import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTabNavBarComponent } from './router-tab-nav-bar.component';

describe('RouterTabNavBarComponent', () => {
  let component: RouterTabNavBarComponent;
  let fixture: ComponentFixture<RouterTabNavBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RouterTabNavBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouterTabNavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
