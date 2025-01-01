import {Component, ElementRef, viewChild, inject, ChangeDetectionStrategy} from '@angular/core';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {Store} from '@ngrx/store';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
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
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'sm-experiment-info-general',
  templateUrl: './experiment-info-general.component.html',
  styleUrls: ['./experiment-info-general.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperimentInfoGeneralComponent {
  protected store = inject(Store);
  protected readonly ref = inject<ElementRef<HTMLElement>>(ElementRef<HTMLElement>);
  protected refresh = inject(RefreshService);

  public experimentChanged(experiment) {
    this.isExample = isReadOnly(experiment);
    this.selectedExperiment = experiment;
  }



  protected experimentInfoData = this.store.selectSignal(selectExperimentInfoData);
  protected editable           = this.store.selectSignal(selectIsExperimentEditable);
  protected selectedExperiment = this.store.selectSignal(selectSelectedExperiment);

  public isExample: boolean;
  private experiment$ = new BehaviorSubject<IExperimentInfo>(null);

  protected info = viewChild(ExperimentGeneralInfoComponent);

  constructor() {
    this.store.select(selectEditingDescription)
      .pipe(
        takeUntilDestroyed(),
        filter(edit => edit)
      )
      .subscribe(() => {
        this.ref.nativeElement.scrollTo({top: 0, behavior: 'smooth'});
        this.info()?.experimentDescriptionSection().editModeChanged(true);
      });

    combineLatest([
      this.store.select(selectSelectedExperiment),
      this.experiment$
    ])
      .pipe(
        takeUntilDestroyed(),
        debounceTime(0),
        map(([selected, input]) => input ?? selected),
        distinctUntilChanged((prev, current) => prev?.id === current?.id && prev?.started === current?.started),
        filter(experiment => !!experiment?.id),
      )
      .subscribe(experiment => {
        if (this.selectedExperiment()?.id !== experiment.id || this.selectedExperiment()?.started !== experiment.started) {
          this.experimentChanged(experiment)
        }
      });

  }

  commentChanged(comment) {
    this.store.dispatch(experimentDetailsUpdated({id: this.selectedExperiment().id, changes: {comment}}));
  }
}
