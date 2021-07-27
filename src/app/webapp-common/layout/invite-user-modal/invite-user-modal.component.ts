import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {getInviteUserLink, setInviteUserLink} from '../../core/actions/users.actions';
import {selectInviteLink} from '../../core/reducers/users-reducer';
import {Observable} from 'rxjs';
import {addMessage} from "../../core/actions/layout.actions";
import {MESSAGES_SEVERITY} from "../../../app.constants";
import {OrganizationCreateInviteResponse} from "../../../business-logic/model/organization/organizationCreateInviteResponse";

@Component({
  selector: 'sm-invite-user-modal',
  templateUrl: './invite-user-modal.component.html',
  styleUrls: ['./invite-user-modal.component.scss']
})
export class InviteUserModalComponent implements OnInit, OnDestroy {
  public inviteLink$: Observable<OrganizationCreateInviteResponse>;
  public window = window;

  constructor(public matDialogRef: MatDialogRef<InviteUserModalComponent>, private store: Store<any>) {
    this.inviteLink$ = this.store.select(selectInviteLink);
  }

  ngOnInit(): void {
    this.store.dispatch(getInviteUserLink());
  }

  copyToClipboardSuccess() {
    this.store.dispatch(addMessage(MESSAGES_SEVERITY.SUCCESS, 'URL copied successfully'));
  }

  ngOnDestroy(): void {
    this.store.dispatch(setInviteUserLink({id: null}));
  }

}
