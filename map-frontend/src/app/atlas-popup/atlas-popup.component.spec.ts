import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtlasPopupComponent } from './atlas-popup.component';

describe('OverlayedPopupComponent', () => {
  let component: AtlasPopupComponent;
  let fixture: ComponentFixture<AtlasPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AtlasPopupComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AtlasPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
