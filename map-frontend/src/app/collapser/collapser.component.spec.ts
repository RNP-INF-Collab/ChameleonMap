import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapserComponent } from './collapser.component';

describe('CollapserComponent', () => {
  let component: CollapserComponent;
  let fixture: ComponentFixture<CollapserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollapserComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollapserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
