import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleDatasetVersionInfoComponent } from './simple-dataset-version-info.component';

describe('SimpleDatasetVersionInfoComponent', () => {
  let component: SimpleDatasetVersionInfoComponent;
  let fixture: ComponentFixture<SimpleDatasetVersionInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimpleDatasetVersionInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleDatasetVersionInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
