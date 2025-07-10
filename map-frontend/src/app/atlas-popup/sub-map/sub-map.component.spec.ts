import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubMapComponent } from './sub-map.component';

describe('SubMapComponent', () => {
  let component: SubMapComponent;
  let fixture: ComponentFixture<SubMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
