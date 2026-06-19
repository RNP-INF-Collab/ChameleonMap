# ChameleonMap Technology Stack

**Last updated:** 2026-06-19

**Source-of-truth files:**


| Area                  | Files                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| Backend dependencies  | `[inventory_backend/django/requirements.txt](../inventory_backend/django/requirements.txt)`        |
| Backend runtime       | `[inventory_backend/django/Dockerfile](../inventory_backend/django/Dockerfile)`                    |
| Frontend dependencies | `[map-frontend/package.json](../map-frontend/package.json)`                                        |
| Frontend runtime      | `[map-frontend/Dockerfile](../map-frontend/Dockerfile)`                                            |
| Infrastructure        | `[docker-compose.yml](../docker-compose.yml)`, overlay files, nginx Dockerfiles                    |
| Environment templates | `[env/env_example.dev](../env/env_example.dev)`, `[env/env_example.prod](../env/env_example.prod)` |
| Lint/format tooling   | `[package.json](../package.json)` (repository root)                                                |


> **Note on versions:** The repository does not commit lock files (`package-lock.json` is gitignored; there is no Python lock file). Versions below come from explicit pins in dependency manifests and Docker base images. Transitive dependency versions are not recorded.

---

## Overview

ChameleonMap is a tool for creating and visualizing interactive maps of network infrastructure. Users explore inventory data (locations, tags, links, KML shapes) through a web-based map interface, while administrators manage content through a multi-tenant Django admin portal.

For end-user manuals and operational guides, see the external [ChameleonMap Guide](https://rnp-inf-collab.github.io/ChameleonMap-guide/).

---

## Backend Stack

### Runtime and framework


| Component             | Version       | Source                                     | Purpose                                   |
| --------------------- | ------------- | ------------------------------------------ | ----------------------------------------- |
| Python                | 3.11 (Alpine) | `python:3.11-alpine` in backend Dockerfile | Application runtime                       |
| Django                | 5.0           | `requirements.txt`                         | Web framework, ORM, sessions, admin       |
| Django REST Framework | 3.15.1        | `requirements.txt`                         | Read-only REST API for map entities       |


The backend runs as a single Django process started by `[entrypoint.sh](../inventory_backend/django/entrypoint.sh)` with `python manage.py runserver 0.0.0.0:8000`.

### Python dependencies


| Package                 | Version    | How it is used                                                                                                                                                        |
| ----------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Django**              | `==5.0`    | Core web framework. Handles routing, ORM, authentication, static/media files, and the admin interface. Project settings live in `inventory_backend/settings.py`.      |
| **psycopg2-binary**     | `==2.9.10` | PostgreSQL database adapter. Connects Django to the `db` service via the `django_tenants.postgresql_backend` engine.                                                  |
| **djangorestframework** | `==3.15.1` | Exposes read-only ViewSets for map entities (`menu`, `tag`, `location`, `link`, etc.) and the consolidated `/map-data/` endpoint. Registered in `clients/urls.py`.    |
| **django-tenants**      | `==3.7.0`  | Multi-tenancy via PostgreSQL schemas. Each tenant (client map) gets its own schema. Middleware resolves the tenant from the request subdomain.                        |
| **django-tenant-users** | `==2.1.1`  | Tenant-aware user model and permissions. Custom user model: `clients.TenantUser`. Authentication backend: `tenant_users.permissions.backend.UserBackend`.             |
| **django-unfold**       | `==0.62.0` | Modern admin UI theme. Configured via `UNFOLD` dict in settings; admin site uses `UnfoldAdminSite` in `administration/admin.py`.                                      |
| **django-axes**         | `~=7.0.0`  | Brute-force login protection. Locks accounts after repeated failed attempts; uses the default LocMem cache backend.                                                   |
| **django-cors-headers** | `==3.7.0`  | Cross-origin resource sharing for development. `CorsMiddleware` reads allowed origins from the `CORS_WHITELIST` environment variable.                                 |
| **django-colorfield**   | `==0.4.2`  | Color picker fields on admin models (e.g. tag colors, KML layer colors) via `ColorField`.                                                                             |
| **django-tinymce**      | `==3.4.0`  | Rich-text editor in the admin for sidebar/content fields on tags and related models.                                                                                  |
| **pillow**              | `==10.4.0` | Image processing for `ImageField` uploads (e.g. custom footer files in map configuration).                                                                            |
| **openpyxl**            | `==3.1.5`  | Reads Excel (`.xlsx`) files during data import. Used in `importer/sources/xlsx_to_csv_streams.py`.                                                                    |
| **kml2geojson**         | `==5.1.0`  | Converts KML uploads to GeoJSON on the server. Used in `administration/map_data/kml_geojson.py` when building the map-data bundle.                                    |
| **requests**            | `>=2.27.1` | HTTP client for external integrations: InfraDPDI import (`importer/sources/InfraDPDI/Requester.py`) and openRAN gateway (`atlas_builder/sources/openRAN_gateway.py`). |


### Django applications


| App                | Purpose                                                                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **clients**        | Tenant model (`Client`), domain mapping, custom user model, bootstrap command (`setup_admin`), and tenant-scoped URL routing.                                         |
| **administration** | Core map data models (menus, tags, locations, links, KML shapes, settings), REST ViewSets, admin interface, and the `map-data` bundle builder with in-memory caching. |
| **importer**       | Data import pipeline supporting CSV, XLSX, and InfraDPDI (NetBox-like) sources. Admin-triggered via `/import/`.                                                       |
| **atlas_builder**  | Integration with the openRAN gateway for Atlas-based map building. Admin-triggered via `/atlas/`.                                                                     |


### Multi-tenancy model

ChameleonMap uses **schema-per-tenant** isolation via django-tenants. Three tenant types are configured in `settings.py`:


| Type     | Apps                              | URL routing                                |
| -------- | --------------------------------- | ------------------------------------------ |
| `public` | Admin, auth, clients, shared apps | Root URLconf (`inventory_backend/urls.py`) |
| `root`   | Same as public                    | Root URLconf                               |
| `scoped` | Administration (map data) + auth  | Tenant URLconf (`clients/urls.py`)         |


Tenant resolution is driven by subdomain: `*.{DJANGO_BASE_DOMAIN}` (configured in nginx and Django).

### Data layer


| Component        | Technology          | Details                                                                                                                                          |
| ---------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Database**     | PostgreSQL          | Docker service `db`, image `postgres` (tag not pinned). Connection via `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`.                      |
| **ORM**          | Django ORM          | Built-in; no third-party ORM. Router: `django_tenants.routers.TenantSyncRouter`.                                                                 |
| **Cache**        | Django LocMemCache  | In-process cache for map-data bundles (`map_data:v1:{schema}`). See `administration/map_data/cache.py`. Not shared across workers or containers. |
| **Media**        | Filesystem          | Uploaded files stored under `MEDIA_ROOT` (`/media/uploads` proxied by nginx).                                                                    |
| **Static files** | Collected to volume | `collectstatic` output served by nginx at `/staticfiles/` from the `static_volume` Docker volume.                                                |


### API surface

Tenant-scoped routes (defined in `clients/urls.py`, proxied by nginx):


| Path                                         | Handler              | Description                                   |
| -------------------------------------------- | -------------------- | --------------------------------------------- |
| `/map-data/`                                 | `MapDataAPIView`     | Consolidated JSON bundle for the frontend map |
| `/menu`, `/menugroup`                        | DRF ViewSets         | Menu structure                                |
| `/tag`, `/location`, `/link`, `/linksgroup`  | DRF ViewSets         | Map entities                                  |
| `/kmlshape`, `/tagrelationship`, `/settings` | DRF ViewSets         | KML layers, tag relations, map config         |
| `/admin/`                                    | Unfold admin site    | Tenant administration                         |
| `/import/`                                   | Importer views       | Data import workflows                         |
| `/atlas/`                                    | Atlas builder views  | openRAN gateway integration                   |
| `/password_reset`, `/reset/...`              | Password reset views | Admin password recovery                       |


All ViewSets are read-only from the API perspective; writes happen through the admin interface.

### Backend container

Multi-stage Dockerfile (`inventory_backend/django/Dockerfile`):


| Stage         | Base image           | Purpose                                                |
| ------------- | -------------------- | ------------------------------------------------------ |
| `builder`     | `python:3.11-alpine` | Installs build deps, pre-builds wheels                 |
| `deployment`  | `python:3.11-alpine` | Production image; runs as user `dpdadm`                |
| `development` | extends `deployment` | Adds editable install for local dev with volume mounts |


**Startup sequence** (`entrypoint.sh`):

1. `makemigrations`
2. `migrate_schemas --shared`
3. `setup_admin` (creates public tenant and superuser from env vars)
4. `runserver 0.0.0.0:8000`

---

## Frontend Stack

### Runtime and framework


| Component   | Version                                       | Source                                  | Purpose                                |
| ----------- | --------------------------------------------- | --------------------------------------- | -------------------------------------- |
| Node.js     | 20 (Alpine)                                   | `node:20-alpine` in frontend Dockerfile | Build and development runtime          |
| Angular     | ^17.0.0                                       | `map-frontend/package.json`             | SPA framework                          |
| TypeScript  | ~5.4.0                                        | `map-frontend/package.json`             | Typed JavaScript                       |
| Angular CLI | ^17.0.0                                       | devDependencies                         | Project scaffolding, dev server, build |
| Bundler     | Webpack (via `@angular-devkit/build-angular`) | `angular.json`                          | Production and development builds      |


There is no Vite, standalone Webpack config, or esbuild-based Angular builder.

### Production and development serving


| Mode            | Server                       | Port                                           | Details                                                                     |
| --------------- | ---------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------- |
| **Production**  | Apache httpd `2.4.51-alpine` | 80 (internal)                                  | Static files from `ng build` output copied into `/usr/local/apache2/htdocs` |
| **Development** | `ng serve`                   | 4200 (exposed) / 80 (configured in npm script) | Hot reload with volume mount; global `@angular/cli` installed in container  |


Build command: `npm run build -- --output-path=./dist/out --configuration production`

### Dependencies by role

#### Core Angular


| Package                             | Version | Purpose                                           |
| ----------------------------------- | ------- | ------------------------------------------------- |
| `@angular/core`                     | ^17.0.0 | Framework core (components, DI, change detection) |
| `@angular/common`                   | ^17.0.0 | Common directives and pipes                       |
| `@angular/compiler`                 | ^17.0.0 | Template compilation                              |
| `@angular/platform-browser`         | ^17.0.0 | DOM rendering                                     |
| `@angular/platform-browser-dynamic` | ^17.0.0 | JIT bootstrap                                     |
| `@angular/forms`                    | ^17.0.0 | Template-driven forms                             |
| `@angular/router`                   | ^17.0.0 | Client-side routing (`app-routing.module.ts`)     |
| `@angular/animations`               | ^17.0.0 | Animation support for Material                    |
| `rxjs`                              | ^7.8.1  | Reactive streams for HTTP and data pipelines      |
| `zone.js`                           | ^0.14.7 | Angular change-detection zones                    |
| `tslib`                             | ^2.6.3  | TypeScript runtime helpers                        |


#### UI components


| Package             | Version | Purpose                                                      |
| ------------------- | ------- | ------------------------------------------------------------ |
| `@angular/material` | ^17.0.0 | Material Design components (expansion panels, icons, tables) |
| `@angular/cdk`      | ^17.0.0 | Component Dev Kit (virtual scrolling via `ScrollingModule`)  |


Material modules are imported in `app.module.ts`: `MatExpansionModule`, `MatIconModule`, `MatTableModule`, `ScrollingModule`.

#### Map and geospatial


| Package                                 | Version | Purpose                                 |
| --------------------------------------- | ------- | --------------------------------------- |
| `leaflet`                               | ^1.9.3  | Core interactive map engine             |
| `@asymmetrik/ngx-leaflet`               | ^17.0.0 | Angular bindings for Leaflet            |
| `@asymmetrik/ngx-leaflet-markercluster` | ^17.0.0 | Angular wrapper for marker clustering   |
| `leaflet.markercluster`                 | ^1.5.3  | Groups nearby markers into clusters     |
| `leaflet-responsive-popup`              | ^1.0.0  | Responsive popup sizing for map markers |
| `@elfalem/leaflet-curve`                | ^0.9.2  | Curved lines between link endpoints     |
| `@tmcw/togeojson`                       | ^5.8.1  | Client-side KML to GeoJSON conversion   |


Leaflet CSS and JS are loaded globally via `angular.json` styles and scripts arrays.

#### Utilities


| Package  | Version  | Purpose                           |
| -------- | -------- | --------------------------------- |
| `lodash` | ^4.17.21 | General-purpose utility functions |


#### Type definitions (dev)


| Package                           | Version |
| --------------------------------- | ------- |
| `@types/leaflet`                  | ^1.9.1  |
| `@types/leaflet.markercluster`    | ^1.5.3  |
| `@types/leaflet-responsive-popup` | ^0.6.4  |
| `@types/node`                     | ^20.0.0 |
| `@types/xmldom`                   | ^0.1.34 |
| `@types/jasmine`                  | ^4.3.1  |


### State management

ChameleonMap does **not** use NgRx, Redux, or similar global state libraries. State is managed through:


| Mechanism              | Service / location            | Role                                                                                                                      |
| ---------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Central data store** | `MapDataService`              | Fetches `/map-data/` via `ApiService`, hydrates a `MapDataStore` with indexed lookups (`locationsById`, `tagsById`, etc.) |
| **HTTP layer**         | `ApiService`                  | Wraps Angular `HttpClient` for backend API calls                                                                          |
| **Popup content**      | `PopupContentService`         | Builds HTML content for map marker popups                                                                                 |
| **Event bus**          | `EventEmitterService`         | Cross-component communication via Angular `EventEmitter`                                                                  |
| **Component state**    | Map, filter, atlas components | Local UI and map interaction state                                                                                        |


The frontend uses **relative API paths** (no hardcoded backend URL). All requests go through nginx, which routes them to the backend.

### Testing


| Tool                                  | Version               | Purpose                                          |
| ------------------------------------- | --------------------- | ------------------------------------------------ |
| Jasmine                               | `jasmine-core` ^5.1.2 | Test framework                                   |
| Karma                                 | ^6.4.3                | Test runner (Chrome via `karma-chrome-launcher`) |
| `@angular-devkit/build-angular:karma` | ^17.0.0               | Angular test builder                             |
| `karma-coverage`                      | ^2.2.1                | Code coverage reports                            |


**Scripts:**

- `npm test` — full unit test suite
- `npm run test:map-behavior` — focused tests for map logic, popup content, and location popups

No end-to-end framework (Cypress, Playwright) is installed.

### Browser support

Defined in `.browserslistrc`: last 1 Chrome/Firefox, last 2 Edge/Safari/iOS, Firefox ESR. Internet Explorer is not supported.

---

## Infrastructure and Containers

### Orchestration

ChameleonMap is deployed entirely via **Docker Compose** (file format version `3.7`). There is no in-repository CI/CD, Terraform, Kubernetes, or Helm configuration.

**Compose files:**


| File                                                            | Purpose                                                         |
| --------------------------------------------------------------- | --------------------------------------------------------------- |
| `[docker-compose.yml](../docker-compose.yml)`                   | Base stack: backend, db, nginx, frontend                        |
| `[docker-compose.dev.yml](../docker-compose.dev.yml)`           | Dev overrides: hot reload, pgAdmin, static collector, env files |
| `[docker-compose.prod.yml](../docker-compose.prod.yml)`         | Prod overrides: env files, restart policies, port mapping       |
| `[docker-compose.prod.ssl.yml](../docker-compose.prod.ssl.yml)` | Prod + TLS: adds `nginx_ssl` service                            |


**Run commands** (project name `-p map`):

```bash
# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml -p map up --build

# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml -p map up --build

# Production with SSL
docker-compose -f docker-compose.yml -f docker-compose.prod.ssl.yml -p map up --build
```

**Host requirements:** Docker, Docker Compose, minimum ~2 GB disk and 4 GB RAM (per README).

### Services


| Service                  | Image / build                                                     | Ports                            | Profile  | Role                                                                 |
| ------------------------ | ----------------------------------------------------------------- | -------------------------------- | -------- | -------------------------------------------------------------------- |
| **backend**              | Build: `inventory_backend/django` (`deployment` or `development`) | 8000 (internal)                  | all      | Django API and admin                                                 |
| **frontend**             | Build: `map-frontend` (`deployment` or `development`)             | 80 (prod, internal) / 4200 (dev) | all      | Angular SPA                                                          |
| **nginx**                | Build: `nginx/` (`nginx:1.27.0-alpine`)                           | `${NGINX_PORT:-80}:80`           | all      | Reverse proxy, static files                                          |
| **nginx_ssl**            | Build: `nginx_ssl/` (`nginx:1.27.0-alpine` + certs)               | 443, 80                          | prod SSL | TLS termination                                                      |
| **db**                   | `postgres` (tag not pinned)                                       | 5432 (internal)                  | all      | PostgreSQL database                                                  |
| **pg-admin**             | `dpage/pgadmin4` (tag not pinned)                                 | 8001:80                          | dev only | Database admin UI                                                    |
| **web_static_collector** | Backend `development` target                                      | —                                | dev only | Runs `collectstatic` with `inotifywait` for live static file updates |


### Container images and versions


| Image                 | Version           | Used by                                  |
| --------------------- | ----------------- | ---------------------------------------- |
| `python:3.11-alpine`  | 3.11              | Backend builder, deployment, development |
| `node:20-alpine`      | 20                | Frontend builder, development            |
| `httpd:2.4.51-alpine` | 2.4.51            | Frontend production (static file server) |
| `nginx:1.27.0-alpine` | 1.27.0            | nginx, nginx_ssl                         |
| `postgres`            | latest (unpinned) | db                                       |
| `dpage/pgadmin4`      | latest (unpinned) | pg-admin (dev)                           |


### nginx routing

Configured in `[nginx/nginx.conf](../nginx/nginx.conf)`. The server name pattern is `*.${DJANGO_BASE_DOMAIN}` for multi-tenant subdomain access.


| Location                                                                                                        | Upstream     | Notes                           |
| --------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------- |
| `/`                                                                                                             | frontend     | Main map SPA                    |
| `/location/detail`, `/tag/detail`                                                                               | frontend     | Deep-link routes (SPA fallback) |
| `/admin`, `/password_reset`, `/reset/...`                                                                       | backend      | Admin and auth                  |
| `/map-data`, `/menu`, `/tag`, `/location`, `/link`, `/linksgroup`, `/kmlshape`, `/tagrelationship`, `/settings` | backend      | REST API                        |
| `/import`, `/atlas`                                                                                             | backend      | Import and Atlas builder        |
| `/media/uploads`                                                                                                | backend      | Uploaded media files            |
| `/staticfiles/`                                                                                                 | local volume | Collected Django static assets  |


The nginx entrypoint substitutes `${DJANGO_BASE_DOMAIN}` into the config template via `envsubst`.

**Security headers** set by nginx: `X-Xss-Protection`, `Referrer-Policy`, `Permissions-Policy`.

### Volumes


| Volume          | Mount point                                     | Purpose                       |
| --------------- | ----------------------------------------------- | ----------------------------- |
| `postgres_data` | `/var/lib/postgresql` (db)                      | Persistent database storage   |
| `static_volume` | `/home/dpdadm/web/staticfiles` (backend, nginx) | Shared collected static files |


In development, additional bind mounts provide live code reload for backend and frontend source directories.

---

## Development Tooling

Root-level tooling in `[package.json](../package.json)` (not part of the runtime application):


| Tool                               | Version | Purpose                               |
| ---------------------------------- | ------- | ------------------------------------- |
| ESLint                             | ^8.32.0 | Lint TypeScript in `map-frontend/src` |
| `@typescript-eslint/eslint-plugin` | ^5.49.0 | TypeScript-specific lint rules        |
| `@typescript-eslint/parser`        | ^5.49.0 | TypeScript parser for ESLint          |
| Prettier                           | ^2.8.3  | Code formatting                       |


**Scripts:**

- `npm run lint` — ESLint with auto-fix on frontend TypeScript
- `npm run pformat` — Prettier format on frontend TypeScript

Configuration: `[.eslintrc](../.eslintrc)`, `[.prettierrc](../.prettierrc)`.

**Not present:** Makefile, pre-commit hooks, Husky, in-repository CI/CD pipelines (GitHub Actions, Jenkins, etc.).

---

## External Integrations


| Integration         | Protocol    | Env vars                                                    | Backend module                             | Purpose                                                      |
| ------------------- | ----------- | ----------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| **InfraDPDI**       | HTTP (REST) | `INFRADPDI_TOKEN`, `INFRADPDI_BASEURL`, `AVAILABLE_IMPORTS` | `importer/sources/InfraDPDI/`              | Import network inventory from InfraDPDI (NetBox-like source) |
| **openRAN gateway** | HTTP (REST) | `GATEWAY_BASE_URL`, `GATEWAY_AUTH_KEY`                      | `atlas_builder/sources/openRAN_gateway.py` | Atlas-based map building via external gateway                |
| **SMTP email**      | SMTP (TLS)  | `EMAIL`_* vars                                              | Django `smtp.EmailBackend`                 | Password reset and notification emails                       |


All HTTP integrations use the `requests` library. No message queues (Celery, RabbitMQ, Redis Queue) are configured.

---

## Related Documentation


| Document                                                                   | Description                                  |
| -------------------------------------------------------------------------- | -------------------------------------------- |
| [README.md](../README.md)                                                  | Installation and deployment instructions     |
| [docs/csv_import_format.md](csv_import_format.md)                          | CSV import file format specification         |
| [ChameleonMap Guide](https://rnp-inf-collab.github.io/ChameleonMap-guide/) | External user manuals and operational guides |


