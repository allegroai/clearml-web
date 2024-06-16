import {Component, inject} from '@angular/core';
import {MatSlideToggle, MatSlideToggleChange} from '@angular/material/slide-toggle';
import {Store} from '@ngrx/store';
import {selectAllowed} from '~/core/reducers/usage-stats.reducer';
import { updateUsageStats } from '~/core/actions/usage-stats.actions';
import {ConfigurationService} from '@common/shared/services/configuration.service';


@Component({
  selector: 'sm-usage-stats',
  templateUrl: './usage-stats.component.html',
  styleUrls: ['./usage-stats.component.scss'],
  imports: [
    MatSlideToggle
  ],
  standalone: true
})
export class UsageStatsComponent {
  private store =inject(Store);
  public shown = true;
  public demo = ConfigurationService.globalEnvironment.demo;
  protected allowed = this.store.selectSignal(selectAllowed);

  statsChange(toggle: MatSlideToggleChange) {
    this.store.dispatch(updateUsageStats({allowed: toggle.checked}));
  }
}
