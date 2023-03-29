import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NestedProjectViewPageExtendedComponent } from './nested-project-view-page-extended.component';
import {StoreModule} from '@ngrx/store';
import {RouterTestingModule} from '@angular/router/testing';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';

describe('PipelinesPageComponent', () => {
  let component: NestedProjectViewPageExtendedComponent;
  let fixture: ComponentFixture<NestedProjectViewPageExtendedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NestedProjectViewPageExtendedComponent ],
      imports: [
        StoreModule.forRoot({}),
        RouterTestingModule,
        MatDialogModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NestedProjectViewPageExtendedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
