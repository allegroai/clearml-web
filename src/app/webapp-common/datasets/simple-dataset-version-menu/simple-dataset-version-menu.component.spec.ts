import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleDatasetVersionMenuComponent } from './simple-dataset-version-menu.component';

describe('SimpleDatasetVersionMenuComponent', () => {
  let component: SimpleDatasetVersionMenuComponent;
  let fixture: ComponentFixture<SimpleDatasetVersionMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimpleDatasetVersionMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleDatasetVersionMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
