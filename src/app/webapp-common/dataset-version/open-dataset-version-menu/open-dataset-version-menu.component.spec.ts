import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenDatasetVersionMenuComponent } from './open-dataset-version-menu.component';

describe('SimpleDatasetVersionMenuComponent', () => {
  let component: OpenDatasetVersionMenuComponent;
  let fixture: ComponentFixture<OpenDatasetVersionMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenDatasetVersionMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenDatasetVersionMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
