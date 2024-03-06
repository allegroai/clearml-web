import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineParametersDialogComponent } from './pipeline-parameters-dialog.component';

describe('PipelineParametersDialogComponent', () => {
  let component: PipelineParametersDialogComponent;
  let fixture: ComponentFixture<PipelineParametersDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PipelineParametersDialogComponent]
    });
    fixture = TestBed.createComponent(PipelineParametersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
