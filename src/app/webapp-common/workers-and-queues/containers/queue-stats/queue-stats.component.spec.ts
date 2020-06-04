import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {QueueStatsComponent} from './queue-stats.component';

describe('QueueStatsComponent', () => {
  let component: QueueStatsComponent;
  let fixture: ComponentFixture<QueueStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QueueStatsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture   = TestBed.createComponent(QueueStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
