import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniTagComponent } from './mini-tag.component';

describe('MiniTagComponent', () => {
  let component: MiniTagComponent;
  let fixture: ComponentFixture<MiniTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniTagComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiniTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
