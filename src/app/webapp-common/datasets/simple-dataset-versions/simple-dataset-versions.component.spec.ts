import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleDatasetVersionsComponent } from './simple-dataset-versions.component';

describe('SimpleDatasetVersionsComponent', () => {
  let component: SimpleDatasetVersionsComponent;
  let fixture: ComponentFixture<SimpleDatasetVersionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimpleDatasetVersionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleDatasetVersionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
