import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelinesPageComponent } from './pipelines-page.component';

describe('PipelinesPageComponent', () => {
  let component: PipelinesPageComponent;
  let fixture: ComponentFixture<PipelinesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelinesPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelinesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
