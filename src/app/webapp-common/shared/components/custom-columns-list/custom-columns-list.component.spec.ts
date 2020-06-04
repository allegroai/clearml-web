import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomColumnsListComponent } from './custom-columns-list.component';

describe('CustomColumnsListComponent', () => {
  let component: CustomColumnsListComponent;
  let fixture: ComponentFixture<CustomColumnsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomColumnsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomColumnsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
