import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineDiagramComponent } from './pipeline-diagram.component';

describe('PipelineDiagramComponent', () => {
  let component: PipelineDiagramComponent;
  let fixture: ComponentFixture<PipelineDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipelineDiagramComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PipelineDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
