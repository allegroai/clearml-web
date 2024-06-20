import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {MatSlideToggle, MatSlideToggleChange} from '@angular/material/slide-toggle';
import {neverShowPopupAgain, setHideRedactedArguments} from '@common/core/actions/layout.actions';
import {Store} from '@ngrx/store';
import {popupId, TipsService} from '@common/shared/services/tips.service';
import {selectHideRedactedArguments, selectNeverShowPopups} from '@common/core/reducers/view.reducer';
import {FeaturesEnum} from '~/business-logic/model/users/featuresEnum';
import {selectCurrentUser} from '@common/core/reducers/users-reducer';
import {AuthEditUserRequest} from '~/business-logic/model/auth/authEditUserRequest';
import {MatDialog} from '@angular/material/dialog';
import {RedactedArgumentsDialogComponent} from '../redacted-arguments-dialog/redacted-arguments-dialog.component';
import {selectBlockUserScript, selectHideExamples, selectShowHiddenUserSelection} from '@common/core/reducers/projects.reducer';
import {setBlockUserScript, setHideExamples, setShowHidden} from '@common/core/actions/projects.actions';
import RoleEnum = AuthEditUserRequest.RoleEnum;
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {UsageStatsComponent} from '~/features/settings/containers/admin/usage-stats/usage-stats.component';

@Component({
  selector: 'sm-profile-preferences',
  templateUrl: './profile-preferences.component.html',
  styleUrls: ['./profile-preferences.component.scss'],
  standalone: true,
  imports: [
    MatSlideToggle,
    TooltipDirective,
    UsageStatsComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePreferencesComponent {

  private store = inject(Store);
  private dialog = inject(MatDialog);
  public tipsService = inject(TipsService);
  public featuresEnum = FeaturesEnum;
  public supportReScaling = window['chrome'] || window['safari'];
  public disableHidpiChanged: boolean = false;
  public popupId = popupId;
  public disableHidpi = window.localStorage.getItem('disableHidpi') === 'true';
  public neverShowTipsAgain = this.store.selectSignal(selectNeverShowPopups);
  public blockUserScripts = this.store.selectSignal(selectBlockUserScript);
  public show = this.store.selectSignal(selectShowHiddenUserSelection);
  public admin = computed(() => this.currentUser()?.role === RoleEnum.Admin);
  public hideRedactedArguments = this.store.selectSignal(selectHideRedactedArguments);
  public hideExamples= this.store.selectSignal(selectHideExamples);
  private currentUser= this.store.selectSignal(selectCurrentUser);

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

  toggleBlockUserScript(toggle: MatSlideToggleChange) {
    this.store.dispatch(setBlockUserScript({block: toggle.checked}));
  }
}
