import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenDatasetCardComponent } from './open-dataset-card.component';

describe('SimpleDatasetCardComponent', () => {
  let component: OpenDatasetCardComponent;
  let fixture: ComponentFixture<OpenDatasetCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenDatasetCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenDatasetCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
