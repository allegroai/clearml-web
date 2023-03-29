import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineCardMenuComponent } from './pipeline-card-menu.component';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';

describe('PipelineCardMenuComponent', () => {
  let component: PipelineCardMenuComponent;
  let fixture: ComponentFixture<PipelineCardMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PipelineCardMenuComponent ],
      imports: [
        MatMenuModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PipelineCardMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
