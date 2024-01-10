import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderNavbarTabsComponent } from './header-navbar-tabs.component';

describe('ContextNavbarComponent', () => {
  let component: HeaderNavbarTabsComponent;
  let fixture: ComponentFixture<HeaderNavbarTabsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderNavbarTabsComponent]
    });
    fixture = TestBed.createComponent(HeaderNavbarTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
