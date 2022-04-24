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
import {BehaviorSubject, combineLatest, Observable, Subscription} from 'rxjs';
import {debounceTime, filter, map} from 'rxjs/operators';
import {last} from 'lodash/fp';
import {ISelectedExperiment} from '~/features/experiments/shared/experiment-info.model';
import {IExperimentInfoState} from '~/features/experiments/reducers/experiment-info.reducer';
import {selectSelectedExperiment} from '~/features/experiments/reducers';
import {
  downloadFullLog,
  getExperimentLog,
  ResetLogFilter,
  ResetOutput,
  SetLogFilter
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

  public log$: Observable<any[]>;
  public filter$: Observable<string>;
  public logBeginning$: Observable<boolean>;
  public creator: string | Worker;
  public disabled: boolean;
  public hasLog: boolean;
  private logRef: ExperimentLogInfoComponent;
  private experiment$ = new BehaviorSubject<ITableExperiment>(null);
  @ViewChildren(ExperimentLogInfoComponent) private logRefs: QueryList<ExperimentLogInfoComponent>;

  constructor(private store: Store<IExperimentInfoState>, private cdr: ChangeDetectorRef, private refresh: RefreshService) {
    this.log$ = this.store.select(selectExperimentLog);
    this.logBeginning$ = this.store.select(selectExperimentBeginningOfLog);
    this.filter$ = this.store.select(selectLogFilter);

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
            this.store.dispatch(new ResetOutput());
            this.logRef?.reset();
            this.currExperiment = experiment;
            this.hasLog = undefined;
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
      if (log) {
        this.creator = last(log)?.worker ?? '';
        this.disabled = false;
        this.hasLog = log.length > 0;
        this.cdr.detectChanges();
      }
    }));

    this.subs.add(this.refresh.tick
      .subscribe((autoRefresh) => this.store.dispatch(getExperimentLog({
        id: this.currExperiment.id,
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
    this.store.dispatch(getExperimentLog({id: this.currExperiment.id, direction, from, refresh: !from}));
  }

  downloadLog() {
    this.store.dispatch(downloadFullLog({experimentId: this.currExperiment.id}));
  }
}
