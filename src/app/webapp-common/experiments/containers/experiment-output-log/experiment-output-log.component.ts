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
import {selectExperimentBeginningOfLog, selectExperimentLog, selectLogFilter, selectLogLoading} from '../../reducers';
import {BehaviorSubject, combineLatest, Observable, Subscription} from 'rxjs';
import {debounceTime, filter, map} from 'rxjs/operators';
import {last} from 'lodash/fp';
import {ISelectedExperiment} from '~/features/experiments/shared/experiment-info.model';
import {ExperimentInfoState} from '~/features/experiments/reducers/experiment-info.reducer';
import {selectSelectedExperiment} from '~/features/experiments/reducers';
import {
  downloadFullLog,
  getExperimentLog,
  resetLogFilter,
  resetOutput,
  setLogFilter
} from '../../actions/common-experiment-output.actions';
import {ExperimentLogInfoComponent} from '../../dumb/experiment-log-info/experiment-log-info.component';
import {ITableExperiment} from '@common/experiments/shared/common-experiment-model.model';
import {RefreshService} from '@common/core/services/refresh.service';

@Component({
  selector: 'sm-experiment-output-log',
  templateUrl: './experiment-output-log.component.html',
  styleUrls: ['./experiment-output-log.component.scss']
})
export class ExperimentOutputLogComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() showHeader = true;
  @Input() isDarkTheme = false;
  @Input() set experiment(experiment: ITableExperiment) {
    this.experiment$.next(experiment);
  }
  private subs = new Subscription();
  private currExperiment: ISelectedExperiment;
  private loading: boolean;

  public log$: Observable<any[]>;
  public filter$: Observable<string>;
  public fetching$: Observable<boolean>;
  public logBeginning$: Observable<boolean>;
  public creator: string | Worker;
  public disabled: boolean;
  public hasLog: boolean;
  private logRef: ExperimentLogInfoComponent;
  private experiment$ = new BehaviorSubject<ITableExperiment>(null);
  @ViewChildren(ExperimentLogInfoComponent) private logRefs: QueryList<ExperimentLogInfoComponent>;

  constructor(private store: Store<ExperimentInfoState>, private cdr: ChangeDetectorRef, private refresh: RefreshService) {
    this.log$ = this.store.select(selectExperimentLog);
    this.logBeginning$ = this.store.select(selectExperimentBeginningOfLog);
    this.filter$ = this.store.select(selectLogFilter);
    this.fetching$ = this.store.select(selectLogLoading);

    this.subs.add(
      combineLatest([
        this.store.select(selectSelectedExperiment),
        this.experiment$
      ]).pipe(
        debounceTime(0),
        map(([selected, input]) => (input || selected) as ISelectedExperiment),
        filter(experiment => !!experiment?.id),
      )
        .subscribe(experiment => {
          if (this.currExperiment?.id !== experiment.id || this.currExperiment?.started !== experiment.started) {
            this.store.dispatch(resetOutput());
            this.logRef?.reset();
            this.currExperiment = experiment;
            this.hasLog = undefined;
            this.loading = true;
            this.cdr.detectChanges();
            this.store.dispatch(getExperimentLog({
              id: this.currExperiment.id,
              direction: null
            }));
          }
          // else if (!this.logRef?.lines?.length || this.logRef?.canRefresh) {
          //   this.store.dispatch(getExperimentLog({
          //     id: this.currExperiment.id,
          //     direction: !this.logRef?.orgLogs ? 'prev' : 'next',
          //     from: last(this.logRef?.orgLogs)?.timestamp
          //   }));
          // }
        })
    );
  }

  ngAfterViewInit(): void {
    this.subs.add(this.logRefs.changes.subscribe(refs => this.logRef = refs.first));
  }

  ngOnInit() {
    this.subs.add(this.log$.subscribe(log => {
      this.loading = false;
      if (log) {
        this.creator = last(log)?.worker ?? '';
        this.disabled = false;
        this.hasLog = log.length > 0;
        this.cdr.detectChanges();
      }
    }));

    this.subs.add(this.refresh.tick
      .pipe(filter(() => !this.loading && !!this.currExperiment?.id && (!this.logRef || this.logRef.atEnd)))
      .subscribe((autoRefresh) => this.store.dispatch(getExperimentLog({
        id: this.currExperiment.id,
        direction: autoRefresh ? 'prev' : 'next',
        from: last(this.logRef?.orgLogs)?.timestamp,
        autoRefresh: true
      })))
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.logRef = null;
    this.logRefs = null;
    this.store.dispatch(resetLogFilter());
    this.store.dispatch(resetOutput());
  }

  public filterLog(event: KeyboardEvent) {
    this.store.dispatch(setLogFilter({filter: (event.target as HTMLInputElement).value}));
  }

  getLogs({direction, from}: {direction: string; from?: number}) {
    this.store.dispatch(getExperimentLog({id: this.currExperiment.id, direction, from, refresh: !from}));
    this.loading = true;
  }

  downloadLog() {
    this.store.dispatch(downloadFullLog({experimentId: this.currExperiment.id}));
  }
}
