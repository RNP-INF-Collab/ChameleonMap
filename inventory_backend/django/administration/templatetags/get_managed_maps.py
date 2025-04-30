from django import template

register = template.Library()

@register.simple_tag(takes_context=True)
def get_managed_maps(context):
    request = context['request']
    user = request.user
    if not user.is_authenticated:
        raise Exception("Not authenticated")
    return get_user_managed_apps(user)

def get_user_managed_apps(user):
    tenants_list = [
        {"name": tenant.name, "url": f"http://{tenant.get_primary_domain()}/admin/"}
        for tenant in user.tenants.all()
    ]
    return tenants_list
