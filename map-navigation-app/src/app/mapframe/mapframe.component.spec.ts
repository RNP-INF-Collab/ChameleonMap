import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapframeComponent } from './mapframe.component';

describe('MapframeComponent', () => {
  let component: MapframeComponent;
  let fixture: ComponentFixture<MapframeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapframeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapframeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
