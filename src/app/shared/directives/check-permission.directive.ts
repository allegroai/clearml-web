import {Directive, Input, OnDestroy, TemplateRef, ViewContainerRef} from '@angular/core';
import { Store } from '@ngrx/store';
import {selectCurrentUser} from '../../webapp-common/core/reducers/users-reducer';
import {Subscription} from 'rxjs';
import {User} from '../../business-logic/model/users/user';

@Directive({
  selector: '[smCheckPermission]'
})
export class CheckPermissionDirective implements OnDestroy{
  private userDataSubscription: Subscription;
  private elseTemplateRef: TemplateRef<any>|null = null;
  private user: User;
  private blocked = true;

  @Input() set smCheckPermission(permission: boolean) {
    this.blocked = !permission;
    this.setUpView();
  }

  @Input()
  set smCheckPermissionElse(templateRef: TemplateRef<any>|null) {
    this.elseTemplateRef = templateRef;
    this.setUpView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private store: Store<any>) {
    this.userDataSubscription = this.store.select(selectCurrentUser)
      .subscribe((user: User) => {
        this.user = user;
        this.setUpView();
      });
  }

  setUpView() {
    const allowed = !this.blocked && this.user && this.user.role !== 'guest';
    this.viewContainer.clear();
    if (allowed) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else if (this.elseTemplateRef) {
      this.viewContainer.createEmbeddedView(this.elseTemplateRef);
    }
  }

  ngOnDestroy(): void {
    this.userDataSubscription?.unsubscribe();
  }
}
