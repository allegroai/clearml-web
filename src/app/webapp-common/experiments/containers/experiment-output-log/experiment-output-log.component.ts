import {Component, OnDestroy, OnInit, ChangeDetectorRef, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectExperimentBeginningOfLog, selectExperimentLog, selectLogFilter} from '../../reducers';
import {Observable, Subscription} from 'rxjs';
import {distinctUntilChanged, filter} from 'rxjs/operators';
import {last} from 'lodash/fp';
import {HTTP} from '../../../../app.constants';
import {ISelectedExperiment} from '../../../../features/experiments/shared/experiment-info.model';
import {IExperimentInfoState} from '../../../../features/experiments/reducers/experiment-info.reducer';
import {selectSelectedExperiment} from '../../../../features/experiments/reducers';
import {ResetLogFilter, ResetOutput, SetLogFilter, getExperimentLog} from '../../actions/common-experiment-output.actions';
import {ExperimentLogInfoComponent} from '../../dumb/experiment-log-info/experiment-log-info.component';
import {selectRefreshing} from '../../../experiments-compare/reducers';

@Component({
  selector: 'sm-experiment-output-log',
  templateUrl: './experiment-output-log.component.html',
  styleUrls: ['./experiment-output-log.component.scss']
})
export class ExperimentOutputLogComponent implements OnInit, OnDestroy {

  private selectedExperimentSubscription: Subscription;
  private experiment: ISelectedExperiment;

  public API_BASE_URL = HTTP.API_BASE_URL;
  public log$: Observable<any[]>;
  public experiment$: Observable<ISelectedExperiment>;
  public filter$: Observable<string>;
  public logBeginning$: Observable<boolean>;
  public creator: string | Worker;
  public disabled: boolean;
  public hasLog: boolean;
  public logSubscription: Subscription;
  private refreshingSubscription: Subscription;

  @ViewChild('log', {static: false}) private logRef: ExperimentLogInfoComponent;

  constructor(private store: Store<IExperimentInfoState>, private cdr: ChangeDetectorRef) {
    this.log$ = this.store.select(selectExperimentLog);
    this.logBeginning$ = this.store.select(selectExperimentBeginningOfLog);
    this.filter$ = this.store.select(selectLogFilter);
    this.experiment$ = this.store.select(selectSelectedExperiment);
  }

  ngOnInit() {
    this.logSubscription = this.log$.subscribe(log => {
      if (log) {
        this.creator = (log && log[0]) ? log[0].worker : '';
        this.disabled = false;
        this.hasLog = log.length > 0;
        this.cdr.detectChanges();
      }
    });
    this.selectedExperimentSubscription = this.store.select(selectSelectedExperiment)
      .pipe(
        filter(experiment => !!experiment),
        distinctUntilChanged()
      )
      .subscribe(experiment => {
        if (this.experiment?.id !== experiment.id || this.experiment?.started !== experiment.started) {
          this.store.dispatch(new ResetOutput());
          this.logRef?.reset();
          this.experiment = experiment;
          this.store.dispatch(getExperimentLog({
            id: this.experiment.id,
            direction: null
          }));
        } else if (!this.logRef?.lines?.length || this.logRef?.canRefresh) {
          this.store.dispatch(getExperimentLog({
            id: this.experiment.id,
            direction: !this.logRef?.orgLogs ? 'prev' : 'next',
            from: last(this.logRef?.orgLogs)?.timestamp
          }));
        }
      });

    this.refreshingSubscription = this.store.select(selectRefreshing)
      .pipe(filter(({refreshing}) => refreshing))
      .subscribe(({autoRefresh}) => this.store.dispatch(getExperimentLog({
        id: this.experiment.id,
        direction: autoRefresh ? 'prev' : 'next',
        from: last(this.logRef?.orgLogs)?.timestamp
      })));
  }

  ngOnDestroy(): void {
    this.selectedExperimentSubscription.unsubscribe();
    this.logSubscription.unsubscribe();
    this.store.dispatch(new ResetLogFilter());
    this.store.dispatch(new ResetOutput());
  }

  public filterLog(event: KeyboardEvent) {
    this.store.dispatch(new SetLogFilter((event.target as HTMLInputElement).value));
  }

  getLogs({direction, from}: {direction: string; from?: number}) {
    this.store.dispatch(getExperimentLog({id: this.experiment.id, direction, from, refresh: !from}));
  }
}
