import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelInfoPlotsComponent } from './model-info-plots.component';

describe('ModelInfoPlotComponent', () => {
  let component: ModelInfoPlotsComponent;
  let fixture: ComponentFixture<ModelInfoPlotsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelInfoPlotsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelInfoPlotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
