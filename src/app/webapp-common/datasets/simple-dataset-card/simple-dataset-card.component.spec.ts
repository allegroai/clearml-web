import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleDatasetCardComponent } from './simple-dataset-card.component';

describe('SimpleDatasetCardComponent', () => {
  let component: SimpleDatasetCardComponent;
  let fixture: ComponentFixture<SimpleDatasetCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimpleDatasetCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleDatasetCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
