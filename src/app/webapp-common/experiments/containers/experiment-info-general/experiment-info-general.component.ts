import {Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {filter, map} from 'rxjs/operators';
import {tap} from 'rxjs/operators';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {selectExperimentInfoData, selectIsExperimentEditable, selectSelectedExperiment} from '~/features/experiments/reducers';
import {experimentDetailsUpdated} from '../../actions/common-experiments-info.actions';
import {isReadOnly} from '@common/shared/utils/is-read-only';
import {selectEditingDescription} from '@common/experiments/reducers';
import {
  ExperimentGeneralInfoComponent
} from '@common/experiments/dumb/experiment-general-info/experiment-general-info.component';

@Component({
  selector   : 'sm-experiment-info-general',
  templateUrl: './experiment-info-general.component.html',
  styleUrls  : ['./experiment-info-general.component.scss']
})
export class ExperimentInfoGeneralComponent implements OnDestroy{

  public selectedExperiment$: Observable<IExperimentInfo>;
  public editable$: Observable<boolean>;
  public experimentInfoData$: Observable<IExperimentInfo>;
  public isExample: boolean;
  private selectedExperiment: IExperimentInfo;
  private sub = new Subscription();

  @ViewChild(ExperimentGeneralInfoComponent) info: ExperimentGeneralInfoComponent;

  constructor(private store: Store, private readonly ref: ElementRef<HTMLElement>) {
    this.selectedExperiment$ = this.store.select(selectSelectedExperiment)
      .pipe(
        filter(experiment => !!experiment),
        map(experiment => this.selectedExperiment = experiment),
        tap((experiment) => this.isExample = isReadOnly(experiment))
      );
    this.experimentInfoData$ = this.store.select(selectExperimentInfoData);
    this.editable$           = this.store.select(selectIsExperimentEditable);
    this.sub.add(this.store.select(selectEditingDescription)
      .pipe(
        filter(edit => edit))
      .subscribe(() => {
        this.ref.nativeElement.scrollTo({top: 0, behavior: 'smooth'});
        this.info?.experimentDescriptionSection.editModeChanged(true);
      })
    );
  }

  commentChanged(comment) {
    this.store.dispatch(experimentDetailsUpdated({id: this.selectedExperiment.id, changes: {comment}}));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
