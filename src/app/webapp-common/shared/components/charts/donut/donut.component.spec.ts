import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {DonutComponent} from './donut.component';
import {AppModule} from '~/app.module';

describe('DonutComponent', () => {
  let component: DonutComponent;
  let fixture: ComponentFixture<DonutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DonutComponent],
      imports: [AppModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture   = TestBed.createComponent(DonutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
