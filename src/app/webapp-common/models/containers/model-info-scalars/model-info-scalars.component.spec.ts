import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelInfoScalarsComponent } from './model-info-scalars.component';

describe('ModelInfoScalarsComponent', () => {
  let component: ModelInfoScalarsComponent;
  let fixture: ComponentFixture<ModelInfoScalarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelInfoScalarsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelInfoScalarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
