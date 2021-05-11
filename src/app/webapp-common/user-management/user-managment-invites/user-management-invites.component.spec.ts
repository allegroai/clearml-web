import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserManagementInvitesComponent } from './user-management-invites.component';

describe('UserManagmentInvionsComponent', () => {
  let component: UserManagementInvitesComponent;
  let fixture: ComponentFixture<UserManagementInvitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserManagementInvitesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserManagementInvitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
