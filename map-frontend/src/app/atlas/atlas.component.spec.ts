import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ATLASComponent } from './atlas.component';

describe('ATLASComponent', () => {
  let component: ATLASComponent;
  let fixture: ComponentFixture<ATLASComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ATLASComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ATLASComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
