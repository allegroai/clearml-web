import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleDatasetVersionDetailsComponent } from './simple-dataset-version-details.component';

describe('SimpleDatasetVersionDetailsComponent', () => {
  let component: SimpleDatasetVersionDetailsComponent;
  let fixture: ComponentFixture<SimpleDatasetVersionDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimpleDatasetVersionDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleDatasetVersionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
