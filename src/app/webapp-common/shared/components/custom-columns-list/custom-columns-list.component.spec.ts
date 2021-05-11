import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CustomColumnsListComponent } from './custom-columns-list.component';

describe('CustomColumnsListComponent', () => {
  let component: CustomColumnsListComponent;
  let fixture: ComponentFixture<CustomColumnsListComponent>;

  beforeEach(waitForAsync(() => {
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
