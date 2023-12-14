import {Component} from '@angular/core';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {filter, map} from 'rxjs/operators';
import {tap} from 'rxjs/operators';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {ExperimentInfoState} from '~/features/experiments/reducers/experiment-info.reducer';
import {selectExperimentInfoData, selectIsExperimentEditable, selectSelectedExperiment} from '~/features/experiments/reducers';
import {experimentDetailsUpdated} from '../../actions/common-experiments-info.actions';
import {isReadOnly} from '@common/shared/utils/is-read-only';

@Component({
  selector   : 'sm-experiment-info-general',
  templateUrl: './experiment-info-general.component.html',
  styleUrls  : ['./experiment-info-general.component.scss']
})
export class ExperimentInfoGeneralComponent {

  public selectedExperiment$: Observable<IExperimentInfo>;
  public editable$: Observable<boolean>;
  public experimentInfoData$: Observable<IExperimentInfo>;
  public isExample: boolean;
  private selectedExperiment: IExperimentInfo;

  constructor(private store: Store<ExperimentInfoState>) {
    this.selectedExperiment$ = this.store.select(selectSelectedExperiment)
      .pipe(
        filter(experiment => !!experiment),
        map(experiment => this.selectedExperiment = experiment),
        tap((experiment) => this.isExample = isReadOnly(experiment))
      );
    this.experimentInfoData$ = this.store.select(selectExperimentInfoData);
    this.editable$           = this.store.select(selectIsExperimentEditable);
  }

  commentChanged(comment) {
    this.store.dispatch(experimentDetailsUpdated({id: this.selectedExperiment.id, changes: {comment}}));
  }

}
