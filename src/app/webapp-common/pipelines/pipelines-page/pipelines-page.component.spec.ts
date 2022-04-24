import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelinesPageComponent } from './pipelines-page.component';
import {StoreModule} from '@ngrx/store';
import {RouterModule} from '@angular/router';

describe('PipelinesPageComponent', () => {
  let component: PipelinesPageComponent;
  let fixture: ComponentFixture<PipelinesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelinesPageComponent ],
      imports: [StoreModule.forRoot({}), RouterModule]
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
