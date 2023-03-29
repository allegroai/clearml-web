import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NestedProjectViewPageComponent } from './nested-project-view-page.component';
import {StoreModule} from '@ngrx/store';
import {RouterTestingModule} from '@angular/router/testing';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';

describe('PipelinesPageComponent', () => {
  let component: NestedProjectViewPageComponent;
  let fixture: ComponentFixture<NestedProjectViewPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NestedProjectViewPageComponent ],
      imports: [
        StoreModule.forRoot({}),
        RouterTestingModule,
        MatDialogModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NestedProjectViewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
