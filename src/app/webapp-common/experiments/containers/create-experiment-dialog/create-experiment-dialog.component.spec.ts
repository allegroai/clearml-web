import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateExperimentDialogComponent } from './create-experiment-dialog.component';

describe('CreateExperimentDialogComponent', () => {
  let component: CreateExperimentDialogComponent;
  let fixture: ComponentFixture<CreateExperimentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateExperimentDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateExperimentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
