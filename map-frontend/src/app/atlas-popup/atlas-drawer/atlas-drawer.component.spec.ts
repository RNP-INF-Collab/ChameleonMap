import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtlasDrawerComponent } from './atlas-drawer.component';

describe('AtlasDrawer', () => {
  let component: AtlasDrawerComponent;
  let fixture: ComponentFixture<AtlasDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AtlasDrawerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AtlasDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
