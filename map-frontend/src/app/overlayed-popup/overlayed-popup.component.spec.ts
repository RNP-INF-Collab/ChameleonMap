import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayedPopupComponent } from './overlayed-popup.component';

describe('OverlayedPopupComponent', () => {
  let component: OverlayedPopupComponent;
  let fixture: ComponentFixture<OverlayedPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OverlayedPopupComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverlayedPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
