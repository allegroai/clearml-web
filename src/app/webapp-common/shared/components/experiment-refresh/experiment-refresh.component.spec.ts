import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExperimentRefreshComponent } from './experiment-refresh.component';
import {StoreModule} from '@ngrx/store';

describe('ExperimentRefreshComponent', () => {
  let component: ExperimentRefreshComponent;
  let fixture: ComponentFixture<ExperimentRefreshComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ExperimentRefreshComponent ],
      imports: [StoreModule.forRoot({})]
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
