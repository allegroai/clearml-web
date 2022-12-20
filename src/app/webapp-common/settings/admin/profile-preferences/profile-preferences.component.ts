import {Component, OnDestroy} from '@angular/core';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {neverShowPopupAgain, setHideRedactedArguments} from '@common/core/actions/layout.actions';
import {Store} from '@ngrx/store';
import {popupId} from '@common/shared/services/tips.service';
import {selectHideRedactedArguments, selectNeverShowPopups} from '@common/core/reducers/view.reducer';
import {FeaturesEnum} from '~/business-logic/model/users/featuresEnum';
import {selectCurrentUser} from '@common/core/reducers/users-reducer';
import {filter} from 'rxjs/operators';
import {Observable, Subscription} from 'rxjs';
import {AuthEditUserRequest} from '~/business-logic/model/auth/authEditUserRequest';
import RoleEnum = AuthEditUserRequest.RoleEnum;
import {MatDialog} from '@angular/material/dialog';
import {RedactedArgumentsDialogComponent} from '../redacted-arguments-dialog/redacted-arguments-dialog.component';
import {selectHideExamples, selectShowHidden} from '@common/core/reducers/projects.reducer';
import {setHideExamples, setShowHidden} from '@common/core/actions/projects.actions';

@Component({
  selector: 'sm-profile-preferences',
  templateUrl: './profile-preferences.component.html',
  styleUrls: ['./profile-preferences.component.scss']
})
export class ProfilePreferencesComponent implements OnDestroy {
  public featuresEnum = FeaturesEnum;
  public supportReScaling = window['chrome'] || window['safari'];
  public disableHidpiChanged: boolean = false;
  public popupId = popupId;
  public disableHidpi = window.localStorage.getItem('disableHidpi') === 'true';
  public neverShowTipsAgain$ = this.store.select(selectNeverShowPopups);
  public show$: Observable<boolean>;
  public admin: boolean;
  private sub = new Subscription();
  public hideRedactedArguments$: Observable<{ key: string }[]>;
  public hideExamples$: Observable<boolean>;

  constructor(private store: Store<any>, private dialog: MatDialog) {
    this.hideRedactedArguments$ = this.store.select(selectHideRedactedArguments);

    this.show$ = store.select(selectShowHidden);
    this.hideExamples$ = store.select(selectHideExamples);

    this.sub.add(store.select(selectCurrentUser)
      .pipe(filter(user => !!user))
      .subscribe(user => this.admin = user.role === RoleEnum.Admin)
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  hidpiChange(event: MatSlideToggleChange) {
    window.localStorage.setItem('disableHidpi', JSON.stringify(event.checked));
    this.disableHidpiChanged = !this.disableHidpiChanged;
  }

  reload(event) {
    if (this.disableHidpiChanged) {
      event.stopPropagation();
      event.preventDefault();
      window.location.reload();
    }
  }

  setNeverShowTipsAgain($event: MatSlideToggleChange) {
    this.store.dispatch(neverShowPopupAgain({popupId, reset: !$event.checked}));
  }

  statsChange(toggle: MatSlideToggleChange) {
    this.store.dispatch(setShowHidden({show: toggle.checked}));
  }

  hideSpecificContainerArguments(toggle: MatSlideToggleChange) {
    this.store.dispatch(setHideRedactedArguments({hide: toggle.checked}));
  }

  editHideSpecificContainerArguments() {
    this.dialog.open(RedactedArgumentsDialogComponent);
  }

  toggleExamples(toggle: MatSlideToggleChange) {
    this.store.dispatch(setHideExamples({hide: toggle.checked}));
  }
}
