import {
  ChangeDetectorRef,
  Component, inject,
  Input,
  OnDestroy,
  viewChild,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectExperimentBeginningOfLog, selectExperimentLog, selectLogFilter, selectLogLoading} from '../../reducers';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {debounceTime, filter, map} from 'rxjs/operators';
import {last} from 'lodash-es';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {selectSelectedExperiment} from '~/features/experiments/reducers';
import {
  downloadFullLog,
  getExperimentLog,
  resetLogFilter,
  resetOutput,
  setLogFilter
} from '../../actions/common-experiment-output.actions';
import {ExperimentLogInfoComponent} from '../../dumb/experiment-log-info/experiment-log-info.component';
import {RefreshService} from '@common/core/services/refresh.service';
import {activeLoader} from '@common/core/actions/layout.actions';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {selectThemeMode} from '@common/core/reducers/view.reducer';

@Component({
  selector: 'sm-experiment-output-log',
  templateUrl: './experiment-output-log.component.html',
  styleUrls: ['./experiment-output-log.component.scss']
})
export class ExperimentOutputLogComponent implements OnDestroy {
  private store = inject(Store);
  private cdr = inject(ChangeDetectorRef);
  private refresh = inject(RefreshService);

  @Input() showHeader = true;
  @Input() set experiment(experiment: IExperimentInfo) {
    this.experiment$.next(experiment);
  }

  private currExperiment: IExperimentInfo;
  private loading: boolean;

  protected log$ = this.store.select(selectExperimentLog);
  protected logBeginning$ = this.store.select(selectExperimentBeginningOfLog);
  protected filter$ = this.store.select(selectLogFilter);
  protected fetching$ = this.store.select(selectLogLoading);

  theme = this.store.selectSignal(selectThemeMode);

  public creator: string | Worker;
  public disabled: boolean;
  public hasLog: boolean;
  private logRef = viewChild(ExperimentLogInfoComponent);
  private experiment$ = new BehaviorSubject<IExperimentInfo>(null);

  constructor() {
    combineLatest([
      this.store.select(selectSelectedExperiment),
      this.experiment$
    ])
      .pipe(
        takeUntilDestroyed(),
        debounceTime(0),
        map(([selected, input]) => input ?? selected),
        filter(experiment => !!experiment?.id),
      )
      .subscribe(experiment => {
        if (this.currExperiment?.id !== experiment.id || this.currExperiment?.started !== experiment.started) {
          this.store.dispatch(resetOutput());
          this.logRef()?.reset();
          this.currExperiment = experiment;
          this.hasLog = undefined;
          this.loading = true;
          this.cdr.detectChanges();
          this.store.dispatch(activeLoader(getExperimentLog.type));
          this.store.dispatch(getExperimentLog({ id: this.currExperiment.id, direction: null }));
        }
      });

    this.log$
      .pipe(takeUntilDestroyed())
      .subscribe(log => {
        this.loading = false;
        if (log) {
          this.creator = last(log)?.worker ?? '';
          this.disabled = false;
          this.hasLog = log.length > 0;
          this.cdr.detectChanges();
        }
      });

    this.refresh.tick
      .pipe(
        takeUntilDestroyed(),
        filter(autoRefresh => autoRefresh !== null && !this.loading && !!this.currExperiment?.id && (!this.logRef() || this.logRef().atEnd || autoRefresh === false)))
      .subscribe(autoRefresh => this.store.dispatch(getExperimentLog({
        id: this.currExperiment.id,
        ...(autoRefresh && {
          direction: autoRefresh ? 'next' : 'prev',
          from: last(this.logRef()?.orgLogs)?.timestamp,
          autoRefresh: true
        }),
      })));
  }

  ngOnDestroy(): void {
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
