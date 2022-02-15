import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectExperimentBeginningOfLog, selectExperimentLog, selectLogFilter} from '../../reducers';
import {Observable, Subscription} from 'rxjs';
import {distinctUntilChanged, filter} from 'rxjs/operators';
import {last} from 'lodash/fp';
import {IExperimentInfo} from '../../../../features/experiments/shared/experiment-info.model';
import {IExperimentInfoState} from '../../../../features/experiments/reducers/experiment-info.reducer';
import {selectSelectedExperiment} from '../../../../features/experiments/reducers';
import {
  downloadFullLog,
  getExperimentLog,
  ResetLogFilter,
  ResetOutput,
  SetLogFilter
} from '../../actions/common-experiment-output.actions';
import {ExperimentLogInfoComponent} from '../../dumb/experiment-log-info/experiment-log-info.component';
import {selectRefreshing} from '../../../experiments-compare/reducers';

@Component({
  selector: 'sm-experiment-output-log',
  templateUrl: './experiment-output-log.component.html',
  styleUrls: ['./experiment-output-log.component.scss']
})
export class ExperimentOutputLogComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() showHeader = true;
  @Input() isDarkTheme = false;
  private subs = new Subscription();
  private experiment: IExperimentInfo;

  public log$: Observable<any[]>;
  public filter$: Observable<string>;
  public logBeginning$: Observable<boolean>;
  public creator: string | Worker;
  public disabled: boolean;
  public hasLog: boolean;
  private logRef: ExperimentLogInfoComponent;
  @ViewChildren(ExperimentLogInfoComponent) private logRefs: QueryList<ExperimentLogInfoComponent>;

  constructor(private store: Store<IExperimentInfoState>, private cdr: ChangeDetectorRef) {
    this.log$ = this.store.select(selectExperimentLog);
    this.logBeginning$ = this.store.select(selectExperimentBeginningOfLog);
    this.filter$ = this.store.select(selectLogFilter);
  }

  ngAfterViewInit(): void {
    this.subs.add(this.logRefs.changes.subscribe(refs => this.logRef = refs.first));
  }

  ngOnInit() {
    this.subs.add(this.log$.subscribe(log => {
      if (log) {
        this.creator = last(log)?.worker ?? '';
        this.disabled = false;
        this.hasLog = log.length > 0;
        this.cdr.detectChanges();
      }
    }));

    this.subs.add(this.store.select(selectSelectedExperiment)
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
      })
    );

    this.subs.add(this.store.select(selectRefreshing)
      .pipe(filter(({refreshing}) => refreshing))
      .subscribe(({autoRefresh}) => this.store.dispatch(getExperimentLog({
        id: this.experiment.id,
        direction: autoRefresh ? 'prev' : 'next',
        from: last(this.logRef?.orgLogs)?.timestamp
      })))
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.logRef = null;
    this.logRefs = null;
    this.store.dispatch(new ResetLogFilter());
    this.store.dispatch(new ResetOutput());
  }

  public filterLog(event: KeyboardEvent) {
    this.store.dispatch(new SetLogFilter((event.target as HTMLInputElement).value));
  }

  getLogs({direction, from}: {direction: string; from?: number}) {
    this.store.dispatch(getExperimentLog({id: this.experiment.id, direction, from, refresh: !from}));
  }

  downloadLog() {
    this.store.dispatch(downloadFullLog({experimentId: this.experiment.id}));
  }
}
