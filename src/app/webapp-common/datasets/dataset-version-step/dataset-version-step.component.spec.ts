import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetVersionStepComponent } from './dataset-version-step.component';

describe('DatasetVersionStepComponent', () => {
  let component: DatasetVersionStepComponent;
  let fixture: ComponentFixture<DatasetVersionStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatasetVersionStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetVersionStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
