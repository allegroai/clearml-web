import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelMenuComponent } from './model-menu.component';

describe('ModelMenuComponent', () => {
  let component: ModelMenuComponent;
  let fixture: ComponentFixture<ModelMenuComponent>;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
