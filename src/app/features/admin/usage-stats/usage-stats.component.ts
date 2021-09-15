import { Component, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import {Store} from '@ngrx/store';
import {selectAllowed} from '../../../core/reducers/usage-stats.reducer';
import {Observable} from 'rxjs';
import { updateUsageStats } from 'app/core/actions/usage-stats.actions';
import {ConfigurationService} from '../../../webapp-common/shared/services/configuration.service';


@Component({
  selector: 'sm-usage-stats',
  templateUrl: './usage-stats.component.html',
  styleUrls: ['./usage-stats.component.scss']
})
export class UsageStatsComponent implements OnInit {
  public shown = true;
  public demo = ConfigurationService.globalEnvironment.demo;
  public allowed$: Observable<boolean>;

  constructor(private store: Store<any>) {
    this.allowed$ = this.store.select(selectAllowed);
  }

  ngOnInit() {
  }

  statsChange(toggle: MatSlideToggleChange) {
    this.store.dispatch(updateUsageStats({allowed: toggle.checked}));
  }
}
