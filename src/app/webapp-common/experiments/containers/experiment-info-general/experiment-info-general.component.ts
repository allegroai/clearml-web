import {Component, ElementRef, inject, OnDestroy, ViewChild} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {debounceTime, filter, map} from 'rxjs/operators';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {
  selectExperimentInfoData,
  selectIsExperimentEditable,
  selectSelectedExperiment
} from '~/features/experiments/reducers';
import {experimentDetailsUpdated} from '../../actions/common-experiments-info.actions';
import {isReadOnly} from '@common/shared/utils/is-read-only';
import {selectEditingDescription} from '@common/experiments/reducers';
import {
  ExperimentGeneralInfoComponent
} from '@common/experiments/dumb/experiment-general-info/experiment-general-info.component';
import {RefreshService} from '@common/core/services/refresh.service';

@Component({
  selector: 'sm-experiment-info-general',
  templateUrl: './experiment-info-general.component.html',
  styleUrls: ['./experiment-info-general.component.scss']
})
export class ExperimentInfoGeneralComponent implements OnDestroy {
  public experimentChanged(experiment) {
    this.isExample = isReadOnly(experiment);
    this.selectedExperiment = experiment;
  }

  public selectedExperiment$: Observable<IExperimentInfo>;


  public refresh = inject(RefreshService);
  private readonly ref = inject(ElementRef<HTMLElement>);

  public store = inject(Store);
  public editable$: Observable<boolean>;
  public experimentInfoData$: Observable<IExperimentInfo>;
  public isExample: boolean;
  public selectedExperiment: IExperimentInfo;
  public sub = new Subscription();
  public experiment$ = new BehaviorSubject<IExperimentInfo>(null);

  @ViewChild(ExperimentGeneralInfoComponent) info: ExperimentGeneralInfoComponent;

  constructor() {
    this.experimentInfoData$ = this.store.select(selectExperimentInfoData);
    this.editable$ = this.store.select(selectIsExperimentEditable);
    this.selectedExperiment$ = this.store.select(selectSelectedExperiment).pipe(filter(experiment => !!experiment));

    this.sub.add(this.store.select(selectEditingDescription)
      .pipe(
        filter(edit => edit))
      .subscribe(() => {
        this.ref.nativeElement.scrollTo({top: 0, behavior: 'smooth'});
        this.info?.experimentDescriptionSection.editModeChanged(true);
      })
    );

    this.sub.add(
      combineLatest([
        this.store.select(selectSelectedExperiment),
        this.experiment$
      ]).pipe(
        debounceTime(0),
        map(([selected, input]) => input ?? selected),
        filter(experiment => !!experiment?.id),
      )
        .subscribe(experiment => {
          if (this.selectedExperiment?.id !== experiment.id || this.selectedExperiment?.started !== experiment.started) {
            this.experimentChanged(experiment)
          }
        })
    );


  }

  commentChanged(comment) {
    this.store.dispatch(experimentDetailsUpdated({id: this.selectedExperiment?.id, changes: {comment}}));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
