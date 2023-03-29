import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleDatasetVersionContentComponent } from './simple-dataset-version-content.component';

describe('SimpleDatasetVersionContentComponent', () => {
  let component: SimpleDatasetVersionContentComponent;
  let fixture: ComponentFixture<SimpleDatasetVersionContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimpleDatasetVersionContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleDatasetVersionContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
