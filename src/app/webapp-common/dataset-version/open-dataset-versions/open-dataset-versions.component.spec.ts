import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenDatasetVersionsComponent } from './open-dataset-versions.component';

describe('SimpleDatasetVersionsComponent', () => {
  let component: OpenDatasetVersionsComponent;
  let fixture: ComponentFixture<OpenDatasetVersionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenDatasetVersionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenDatasetVersionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
