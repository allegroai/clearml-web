import {Component, OnDestroy} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectBackdropActive} from '@common/core/reducers/view.reducer';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {ExperimentInfoState} from '~/features/experiments/reducers/experiment-info.reducer';
import {selectCurrentArtifactExperimentId, selectExperimentModelInfoData} from '../../reducers';
import {
  selectExperimentInfoData,
  selectIsExperimentEditable
} from '~/features/experiments/reducers';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {selectRouterConfig, selectRouterParams} from '@common/core/reducers/router-reducer';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {IExperimentModelInfo} from '../../shared/common-experiment-model.model';
import {
  getExperimentArtifacts,
  setExperimentArtifacts
} from '@common/experiments/actions/common-experiments-info.actions';
import {selectSelectedProject} from '@common/core/reducers/projects.reducer';

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
  public selectedId$: Observable<string>;
  private experimentKey$: Observable<string>;
  public routerConfig$: Observable<string[]>;
  public editable$: Observable<boolean>;
  public minimized: boolean;
  private previousTarget: string;
  private sub = new Subscription();

  constructor(private store: Store<ExperimentInfoState>, public router: Router, private route: ActivatedRoute
  ) {
    this.minimized = !!this.route.snapshot?.routeConfig?.data?.minimized;
    this.backdropActive$ = this.store.select(selectBackdropActive);
    this.editable$ = this.store.select(selectIsExperimentEditable);
    this.modelInfo$ = this.store.select(selectExperimentModelInfoData);
    this.ExperimentInfo$ = this.store.select(selectExperimentInfoData);
    this.routerConfig$ = this.store.select(selectRouterConfig);
    this.selectedId$ = this.store.select(selectRouterParams).pipe(map(params => params?.artifactId || params?.modelId));
    this.experimentKey$ = this.store.select(selectRouterParams).pipe(map(params => params?.experimentId));

    this.sub.add(this.store.select(selectRouterConfig)
      .pipe(filter(rc => !!rc))
      .subscribe((routerConfig: string[]) => {
        this.activeSection = this.minimized ? routerConfig[5] : routerConfig[6];
      })
    );

    this.sub.add(combineLatest([
      this.experimentKey$,
      this.store.select(selectSelectedProject)
    ])
      .pipe(
        filter(([id, project]) => !!id && !!project?.id),
        map(([id]) => id),
        distinctUntilChanged()
      )
      .subscribe(experimentId => {
        this.store.dispatch(setExperimentArtifacts({model: null, experimentId: null}));
        this.store.dispatch(getExperimentArtifacts({experimentId}));
      })
    );

    this.sub.add(combineLatest([
        this.selectedId$,
        this.modelInfo$,
        this.experimentKey$,
        this.ExperimentInfo$,
        this.store.select(selectCurrentArtifactExperimentId)
      ])
      .pipe(
        debounceTime(0),
        distinctUntilChanged(),
        filter(([, modelInfo, experimentKey, experimentInfo, artifactsExperiment]) =>
          !!modelInfo && experimentInfo && experimentKey && artifactsExperiment === experimentKey))
      .subscribe(([selectedId, modelInfo]) => {
        const onOutputModel = this.route.snapshot.firstChild?.data?.outputModel;
        const onInputModel = this.route.snapshot.firstChild?.data?.outputModel === false;
        if (selectedId) {
          const selectedArtifact = modelInfo.artifacts?.find(artifact => artifact.key === selectedId);
          const selectedInputModel = modelInfo.input?.find(model => model.id === selectedId);
          const selectedOutputModel = modelInfo.output?.find(model => model.id === selectedId);
          const onArtifact = !onInputModel && !onOutputModel;
          if ((onOutputModel && !selectedOutputModel) || (onInputModel && !selectedInputModel) || (onArtifact && !selectedArtifact)) {
            this.resetSelection(modelInfo);
          }
        } else {
          this.resetSelection(modelInfo);
        }
      })
    );
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
    this.sub.unsubscribe();
  }

}
