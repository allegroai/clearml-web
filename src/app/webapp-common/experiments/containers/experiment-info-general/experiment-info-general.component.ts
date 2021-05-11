import {Component} from '@angular/core';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {filter, map} from 'rxjs/operators';
import {tap} from 'rxjs/operators';
import {isReadOnly} from '../../../shared/utils/shared-utils';
import {IExperimentInfo} from '../../../../features/experiments/shared/experiment-info.model';
import {IExperimentInfoState} from '../../../../features/experiments/reducers/experiment-info.reducer';
import {selectExperimentInfoData, selectIsExperimentEditable, selectSelectedExperiment} from '../../../../features/experiments/reducers';
import {ExperimentDetailsUpdated} from '../../actions/common-experiments-info.actions';

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

  constructor(private store: Store<IExperimentInfoState>) {
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
    this.store.dispatch(new ExperimentDetailsUpdated({id: this.selectedExperiment.id, changes: {comment: comment}}));
  }

}
