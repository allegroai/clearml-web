import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineCardComponent } from './pipeline-card.component';
import {SharedPipesModule} from '@common/shared/pipes/shared-pipes.module';

describe('PipelineCardComponent', () => {
  let component: PipelineCardComponent;
  let fixture: ComponentFixture<PipelineCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineCardComponent ],
      imports: [SharedPipesModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
