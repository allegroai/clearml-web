import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UsageStatsComponent } from './usage-stats.component';

describe('UsageStatsComponent', () => {
  let component: UsageStatsComponent;
  let fixture: ComponentFixture<UsageStatsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UsageStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsageStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
