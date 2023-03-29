import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelInfoExperimentsComponent } from './model-info-experiments.component';

describe('ModelInfoExperimentsComponent', () => {
  let component: ModelInfoExperimentsComponent;
  let fixture: ComponentFixture<ModelInfoExperimentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelInfoExperimentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelInfoExperimentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
