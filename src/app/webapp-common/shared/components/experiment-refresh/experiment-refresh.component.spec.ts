import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExperimentRefreshComponent } from './experiment-refresh.component';

describe('ExperimentRefreshComponent', () => {
  let component: ExperimentRefreshComponent;
  let fixture: ComponentFixture<ExperimentRefreshComponent>;

  beforeEach(waitForAsync(() => {
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
