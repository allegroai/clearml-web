import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleDatasetsComponent } from './simple-datasets.component';

describe('SimpleDatasetsComponent', () => {
  let component: SimpleDatasetsComponent;
  let fixture: ComponentFixture<SimpleDatasetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimpleDatasetsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleDatasetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
