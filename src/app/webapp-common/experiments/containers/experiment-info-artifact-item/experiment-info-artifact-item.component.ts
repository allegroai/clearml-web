import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectExperimentModelInfoData} from '../../reducers';
import {IExperimentModelInfo} from '../../shared/common-experiment-model.model';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {IExperimentInfoState} from '../../../../features/experiments/reducers/experiment-info.reducer';
import {selectRouterParams} from '../../../core/reducers/router-reducer';
import {distinctUntilChanged, filter, map} from 'rxjs/operators';
import {get} from 'lodash/fp';
import {Artifact} from '../../../../business-logic/model/tasks/artifact';

@Component({
  selector: 'sm-experiment-info-artifact-item',
  templateUrl: './experiment-info-artifact-item.component.html',
  styleUrls: ['./experiment-info-artifact-item.component.scss']
})
export class ExperimentInfoArtifactItemComponent implements OnInit, OnDestroy {
  public modelInfo$: Observable<IExperimentModelInfo>;
  public editable$: Observable<boolean>;
  public errors$: Observable<IExperimentInfoState['errors']>;
  public saving$: Observable<boolean>;
  private artifactSubscription: Subscription;
  public selectedArtifact: Artifact;
  public artifactKey$: Observable<any>;

  constructor(private store: Store<IExperimentInfoState>) {
    this.modelInfo$ = this.store.select(selectExperimentModelInfoData);
    this.artifactKey$ = this.store.select(selectRouterParams)
      .pipe(
        map(params => {
          return {key: get('artifactId', params), mode: get('mode', params)};
        }),
        filter(artifactId => !!artifactId),
        distinctUntilChanged()
      );
  }

  ngOnInit() {
    this.artifactSubscription = combineLatest([this.artifactKey$, this.modelInfo$])
      .pipe(filter(([artifactKey, modelInfo]) => !!(artifactKey && artifactKey.key) && !!modelInfo))
      .subscribe(([artifactKey, modelInfo]) => {
        this.selectedArtifact = modelInfo.artifacts.find(artifact => (artifact.key === artifactKey.key && artifact.mode === artifactKey.mode));
      });
  }

  ngOnDestroy(): void {
    if (this.artifactSubscription) {
      this.artifactSubscription.unsubscribe();
    }
  }

}
