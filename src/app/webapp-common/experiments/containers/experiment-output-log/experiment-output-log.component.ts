import {Component, OnDestroy, OnInit, ChangeDetectorRef} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {selectExperimentLog, selectIsExperimentInProgress, selectLogFilter} from '../../reducers';
import {Observable, Subscription} from 'rxjs';
import {distinctUntilChanged, filter, tap} from 'rxjs/operators';
import {HTTP} from '../../../../app.constants';
import {ISelectedExperiment} from '../../../../features/experiments/shared/experiment-info.model';
import {IExperimentInfoState} from '../../../../features/experiments/reducers/experiment-info.reducer';
import {selectSelectedExperiment} from '../../../../features/experiments/reducers';
import {GetExperimentLog, ResetLogFilter, ResetOutput, SetLogFilter} from '../../actions/common-experiment-output.actions';

@Component({
  selector: 'sm-experiment-output-log',
  templateUrl: './experiment-output-log.component.html',
  styleUrls: ['./experiment-output-log.component.scss']
})
export class ExperimentOutputLogComponent implements OnInit, OnDestroy {

  private selectedExperimentSubscription: Subscription;
  private experiment: ISelectedExperiment;

  public API_BASE_URL = HTTP.API_BASE_URL;
  public log$: Observable<Array<any>>;
  public experiment$: Observable<any>;
  public filter$: Observable<string>;
  public creator: string | Worker;
  public disabled: boolean;
  public hasLog: boolean;
  public selectIsExperimentPendingRunning: Observable<boolean>;
  public logSubscription: Subscription;


  constructor(private store: Store<IExperimentInfoState>,
              private cdr: ChangeDetectorRef) {
    this.log$ = this.store.select(selectExperimentLog);
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
        if (this.experiment && this.experiment.id !== experiment.id) {
          this.store.dispatch(new ResetOutput());
        }
        this.experiment = experiment;
        this.store.dispatch(new GetExperimentLog(experiment.id));
      });
    this.selectIsExperimentPendingRunning = this.store.pipe(
      select(selectIsExperimentInProgress)
    );
  }

  ngOnDestroy(): void {
    this.selectedExperimentSubscription.unsubscribe();
    this.logSubscription.unsubscribe();
    this.store.dispatch(new ResetLogFilter());
    this.store.dispatch(new ResetOutput());
  }

  refreshExperimentLog() {
    this.store.dispatch(new GetExperimentLog(this.experiment.id));
  }

  public filterLog(event: KeyboardEvent) {
    this.store.dispatch(new SetLogFilter((<HTMLInputElement>event.target).value));
  }
}
