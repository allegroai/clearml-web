import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardReportsComponent } from './dashboard-reports.component';

describe('DashboardReportsComponent', () => {
  let component: DashboardReportsComponent;
  let fixture: ComponentFixture<DashboardReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
