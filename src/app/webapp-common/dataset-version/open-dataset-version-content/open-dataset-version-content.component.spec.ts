import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenDatasetVersionContentComponent } from './open-dataset-version-content.component';

describe('SimpleDatasetVersionContentComponent', () => {
  let component: OpenDatasetVersionContentComponent;
  let fixture: ComponentFixture<OpenDatasetVersionContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenDatasetVersionContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenDatasetVersionContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
