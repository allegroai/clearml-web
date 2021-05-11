import {Component, OnDestroy} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectBackdropActive} from '../../../core/reducers/view-reducer';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {IExperimentInfoState} from '../../../../features/experiments/reducers/experiment-info.reducer';
import {selectExperimentModelInfoData} from '../../reducers';
import {selectExperimentInfoData, selectIsExperimentEditable} from '../../../../features/experiments/reducers';
import {IExperimentInfo} from '../../../../features/experiments/shared/experiment-info.model';
import {selectRouterConfig, selectRouterParams} from '../../../core/reducers/router-reducer';
import {distinctUntilChanged, filter, map} from 'rxjs/operators';
import {get, getOr} from 'lodash/fp';
import {ActivatedRoute, Router} from '@angular/router';
import {IExperimentModelInfo} from '../../shared/common-experiment-model.model';

@Component({
  selector: 'sm-experiment-info-artifacts-model',
  templateUrl: './experiment-info-artifacts.component.html',
  styleUrls: ['./experiment-info-aritfacts.component.scss']
})
export class ExperimentInfoArtifactsComponent implements OnDestroy {
  public backdropActive$: Observable<boolean>;
  public modelInfo$: Observable<IExperimentModelInfo>;
  public ExperimentInfo$: Observable<IExperimentInfo>;
  public activeSection: any;
  private selectedRouterConfigSubs: Subscription;
  public selectedId$: Observable<string>;
  private artifactSubscription: Subscription;
  private onOutputModel$: Observable<boolean>;
  private onInputModel$: Observable<boolean>;
  private experimentKey$: Observable<string>;
  public routerConfig$: Observable<string[]>;
  public editable$: Observable<boolean>;
  public minimized: boolean;
  private previousTarget: string;

  constructor(private store: Store<IExperimentInfoState>, public router: Router, private route: ActivatedRoute
  ) {
    this.minimized = getOr(false, 'data.minimized', this.route.snapshot.routeConfig);
    this.backdropActive$ = this.store.select(selectBackdropActive);
    this.editable$ = this.store.select(selectIsExperimentEditable);
    this.modelInfo$ = this.store.select(selectExperimentModelInfoData);
    this.ExperimentInfo$ = this.store.select(selectExperimentInfoData);
    this.routerConfig$ = this.store.select(selectRouterConfig);
    this.selectedRouterConfigSubs = this.store.select(selectRouterConfig)
      .pipe(filter(rc => !!rc))
      .subscribe((routerConfig: string[]) => {
        this.activeSection = this.minimized ? routerConfig[5] : routerConfig[6];
      });

    this.selectedId$ = this.store.select(selectRouterParams)
      .pipe(
        map(params => get('artifactId', params) || get('modelId', params)),
      );

    this.experimentKey$ = this.store.select(selectRouterParams)
      .pipe(
        map(params => get('experimentId', params)),
      );
    this.artifactSubscription = combineLatest([this.selectedId$, this.modelInfo$, this.experimentKey$, this.ExperimentInfo$])
      .pipe(
        distinctUntilChanged(),
        filter(([selectedId, modelInfo, experimentKey, experimentInfo]) =>
          !!modelInfo && experimentInfo && experimentKey && experimentInfo.id === experimentKey))
      .subscribe(([selectedId, modelInfo]) => {
        const onOutputModel = this.route.snapshot.firstChild?.data?.outputModel;
        const onInputModel = this.route.snapshot.firstChild?.data?.outputModel === false;
        if (selectedId) {
          const selectedArtifact = modelInfo.artifacts.find(artifact => artifact.key === selectedId);
          const selectedInputModel = modelInfo.input.find(model => model.id === selectedId);
          const selectedOutputModel = modelInfo.output.find(model => model.id === selectedId);
          const onArtifact = !onInputModel && !onOutputModel;
          if ((onOutputModel && !selectedOutputModel) || (onInputModel && !selectedInputModel) || (onArtifact && !selectedArtifact)) {
            this.resetSelection(modelInfo);
          }
        } else {
          this.resetSelection(modelInfo);
        }
      });
  }

  private navigateToTarget(target: string) {
    if (target !== this.previousTarget || !this.route.firstChild) {
      this.router.navigate([target], {relativeTo: this.route, queryParamsHandling: 'preserve'});
      this.previousTarget = target;
    }
  }

  private resetSelection(modelInfo): void {
    let target: string;
    if (modelInfo.input?.length > 0) {
      target = `../artifacts/input-model/${modelInfo.input[0]?.id}`;
    } else if (modelInfo.output?.length > 0) {
      target = `../artifacts/output-model/${modelInfo.output[0]?.id}/`;
    } else if (modelInfo.artifacts.length > 0) {
      target = `../artifacts/other/${modelInfo.artifacts[0]?.key}/${modelInfo.artifacts[0]?.mode}`;
    } else {
      // no items
      target = '../artifacts/input-model/input-model';
    }
    this.navigateToTarget(target);
  }

  ngOnDestroy(): void {
    this.selectedRouterConfigSubs.unsubscribe();
    this.artifactSubscription.unsubscribe();
  }

}
