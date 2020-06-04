import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentRefreshComponent } from './experiment-refresh.component';

describe('ExperimentRefreshComponent', () => {
  let component: ExperimentRefreshComponent;
  let fixture: ComponentFixture<ExperimentRefreshComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExperimentRefreshComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentRefreshComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
