import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareScatterPlotComponent } from './compare-scatter-plot.component';

describe('CompareScatterPlotComponent', () => {
  let component: CompareScatterPlotComponent;
  let fixture: ComponentFixture<CompareScatterPlotComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompareScatterPlotComponent]
    });
    fixture = TestBed.createComponent(CompareScatterPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
