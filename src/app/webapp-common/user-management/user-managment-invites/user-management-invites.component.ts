import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { ICONS } from '../../constants';
import {Invite} from '../../../business-logic/model/login/invite';
import {InviteUser} from '../user-management.component';
import {GetCurrentUserResponseUserObject} from '../../../business-logic/model/users/getCurrentUserResponseUserObject';
import {WhitelistEntry} from '../../../business-logic/model/login/whitelistEntry';

@Component({
  selector: 'sm-user-management-invites',
  templateUrl: './user-management-invites.component.html',
  styleUrls: ['./user-management-invites.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementInvitesComponent implements OnInit {

  @Input() whitelistEntries: Array<WhitelistEntry>;
  @Input() currentUser: GetCurrentUserResponseUserObject;
  @Output() onRemoveWhitelistEntry = new EventEmitter<WhitelistEntry>();

  STATUS = Invite.StatusEnum;
  public  ICONS = ICONS;

  constructor() {}

  ngOnInit(): void {
  }

  // TODO remove this and use the generic function from util!
  trackByFn(index, item) {
    return item.id;
  }
}
