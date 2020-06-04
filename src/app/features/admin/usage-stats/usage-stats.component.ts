import { Component, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import {Store} from '@ngrx/store';
import {selectAllowed} from '../../../core/reducers/usage-stats.reducer';
import {Observable} from 'rxjs';
import { updateUsageStats } from '../../../core/Actions/usage-stats.actions';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'sm-usage-stats',
  templateUrl: './usage-stats.component.html',
  styleUrls: ['./usage-stats.component.scss']
})
export class UsageStatsComponent implements OnInit {
  public demo = environment.demo;
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
