import {Component, OnDestroy} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {selectBackdropActive} from '../../../core/reducers/view-reducer';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {IExperimentInfoState} from '../../../../features/experiments/reducers/experiment-info.reducer';
import {selectExperimentModelInfoData} from '../../reducers';
import {selectExperimentInfoData, selectIsExperimentEditable} from '../../../../features/experiments/reducers';
import {IExperimentInfo} from '../../../../features/experiments/shared/experiment-info.model';
import {selectRouterConfig, selectRouterParams} from '../../../core/reducers/router-reducer';
import {map} from 'rxjs/operators';
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
  public artifactKey$: Observable<string>;
  private selectedArtifact: any;
  private artifactSubscription: Subscription;
  private onOutputModel$: Observable<boolean>;
  private experimentKey$: Observable<string>;
  public routerConfig$: Observable<string[]>;
  public editable$: Observable<boolean>;
  public minimized: boolean;

  constructor(private store: Store<IExperimentInfoState>, public router: Router, private route: ActivatedRoute
  ) {
    this.minimized = getOr(false, 'data.minimized', this.route.snapshot.routeConfig);
    this.backdropActive$ = this.store.select(selectBackdropActive);
    this.editable$       = this.store.select(selectIsExperimentEditable);
    this.modelInfo$ = this.store.select(selectExperimentModelInfoData);
    this.ExperimentInfo$ = this.store.select(selectExperimentInfoData);
    this.routerConfig$       = this.store.select(selectRouterConfig);
    this.selectedRouterConfigSubs = this.store.pipe(
      select(selectRouterConfig),
    ).subscribe((routerConfig) => {
      this.activeSection = routerConfig && routerConfig[5] && routerConfig[5].replace(/(input|output)-model/, 'model');
    });
    this.onOutputModel$ = this.store.select(selectRouterConfig)
      .pipe(
        map(routerConfig => routerConfig && routerConfig[5] === 'output-model'),
      );
    this.artifactKey$ = this.store.select(selectRouterParams)
      .pipe(
        map(params => get('artifactId', params)),
      );

    this.experimentKey$ = this.store.select(selectRouterParams)
      .pipe(
        map(params => get('experimentId', params)),
      );
    this.artifactSubscription = combineLatest([this.onOutputModel$, this.artifactKey$, this.modelInfo$, this.experimentKey$, this.ExperimentInfo$])
      .pipe()
      .subscribe(([onOutputModel, artifactKey, modelInfo, experimentKey, experimentInfo]) => {
        if (experimentInfo && experimentKey && experimentInfo.id === experimentKey) {
          if (artifactKey) {
            this.selectedArtifact = modelInfo.artifacts.find(artifact => artifact.key === artifactKey);
            if (!this.selectedArtifact) {
              this.router.navigate(['../artifacts/input-model'], {relativeTo: this.route});
            }
          }
          if (onOutputModel) {
            if (modelInfo && modelInfo.output) {
              const isOutputModel = modelInfo.output.id;
              if (!isOutputModel) {
                this.router.navigate(['../artifacts/input-model'], {relativeTo: this.route});
              }
            }
          }
        }
      });
  }

  ngOnDestroy():
    void {
    this.selectedRouterConfigSubs.unsubscribe();
    this.artifactSubscription.unsubscribe();
  }

}
