import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuChooserComponent } from './menu-chooser.component';

describe('MenuChooserComponent', () => {
  let component: MenuChooserComponent;
  let fixture: ComponentFixture<MenuChooserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuChooserComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
