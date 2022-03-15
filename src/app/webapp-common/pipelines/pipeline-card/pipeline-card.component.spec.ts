import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineCardComponent } from './pipeline-card.component';

describe('PipelineCardComponent', () => {
  let component: PipelineCardComponent;
  let fixture: ComponentFixture<PipelineCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineCardComponent ]
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
