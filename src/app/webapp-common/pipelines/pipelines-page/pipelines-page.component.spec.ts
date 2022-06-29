import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelinesPageComponent } from './pipelines-page.component';
import {StoreModule} from '@ngrx/store';
import {RouterTestingModule} from '@angular/router/testing';
import {MatDialogModule} from '@angular/material/dialog';

describe('PipelinesPageComponent', () => {
  let component: PipelinesPageComponent;
  let fixture: ComponentFixture<PipelinesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelinesPageComponent ],
      imports: [
        StoreModule.forRoot({}),
        RouterTestingModule,
        MatDialogModule
      ]
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
