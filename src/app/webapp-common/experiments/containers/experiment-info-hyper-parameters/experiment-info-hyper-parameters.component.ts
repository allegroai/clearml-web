import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectExperimentConfiguration, selectExperimentHyperParamsInfoData, selectExperimentHyperParamsSelectedSectionFromRoute, selectExperimentSelectedConfigObjectFromRoute, selectIsExperimentSaving, selectIsSelectedExperimentInDev} from '../../reducers';
import {ICommonExperimentInfoState} from '../../reducers/common-experiment-info.reducer';
import {IExperimentInfo, ISelectedExperiment} from '../../../../features/experiments/shared/experiment-info.model';
import {selectBackdropActive} from '../../../core/reducers/view-reducer';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {selectIsExperimentEditable, selectSelectedExperiment} from '../../../../features/experiments/reducers';
import {selectRouterConfig, selectRouterParams} from '../../../core/reducers/router-reducer';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {ParamsItem} from '../../../../business-logic/model/tasks/paramsItem';
import {filter, tap, withLatestFrom} from 'rxjs/operators';
import {ActivateEdit, getExperimentConfigurationNames, getExperimentConfigurationObj, SetExperimentFormErrors} from '../../actions/common-experiments-info.actions';
import {getOr} from 'lodash/fp';

@Component({
  selector: 'sm-experiment-info-hyper-parameters',
  templateUrl: './experiment-info-hyper-parameters.component.html',
  styleUrls: ['./experiment-info-hyper-parameters.component.scss']
})
export class ExperimentInfoHyperParametersComponent implements OnInit, OnDestroy {

  public selectedExperiment: IExperimentInfo;
  public editable$: Observable<boolean>;
  public isInDev$: Observable<boolean>;
  public saving$: Observable<boolean>;
  public backdropActive$: Observable<boolean>;
  private selectedExperimentSubscription: Subscription;
  public routerConfig$: Observable<string[]>;
  public routerParams$: Observable<Params>;
  public hyperParamsInfo$: Observable<{ [p: string]: { [p: string]: ParamsItem } }>;
  public configuration$: Observable<any>;
  private hyperParamsConfigSubscription: Subscription;
  public minimized: boolean;

  constructor(
    private store: Store<ICommonExperimentInfoState>,
    protected router: Router,
    private route: ActivatedRoute
  ) {
    this.minimized = getOr(false, 'data.minimized', this.route.snapshot.routeConfig);
    this.hyperParamsInfo$ = this.store.select(selectExperimentHyperParamsInfoData);
    this.configuration$ = this.store.select(selectExperimentConfiguration);
    this.editable$ = this.store.select(selectIsExperimentEditable);
    this.isInDev$ = this.store.select(selectIsSelectedExperimentInDev);
    this.saving$ = this.store.select(selectIsExperimentSaving);
    this.backdropActive$ = this.store.select(selectBackdropActive);
    this.routerConfig$ = this.store.select(selectRouterConfig);
    this.routerParams$ = this.store.select(selectRouterParams);
  }

  ngOnInit() {
    this.selectedExperimentSubscription = this.store.select(selectSelectedExperiment)
      .pipe(
        tap((selectedExperiment) => this.selectedExperiment = selectedExperiment),
        filter((selectedExperiment) => selectedExperiment && !selectedExperiment.configuration)
      )
      .subscribe(selectedExperiment => {
        this.store.dispatch(getExperimentConfigurationNames({experimentId: selectedExperiment.id}));
        this.store.dispatch(getExperimentConfigurationObj());
      });
    this.hyperParamsConfigSubscription = combineLatest([this.hyperParamsInfo$, this.configuration$]).pipe(
      withLatestFrom(
        this.store.select(selectExperimentHyperParamsSelectedSectionFromRoute),
        this.store.select(selectExperimentSelectedConfigObjectFromRoute)
      )).subscribe(([[hyperparams, configuration], selectedHyperParam, selectedConfig]) => {
      if ((hyperparams && configuration && !(selectedHyperParam in hyperparams) && !(selectedConfig in configuration))) {
        if (selectedHyperParam) {
          this.router.navigateByUrl(this.router.url.replace(selectedHyperParam, Object.keys(hyperparams)[0]));
        } else if (selectedConfig) {
          this.router.navigateByUrl(this.router.url.replace(`configuration/${selectedConfig}`, `hyper-param/${Object.keys(hyperparams)[0]}`));
        }
      }
    });
    this.store.dispatch(new SetExperimentFormErrors(null));
  }

  ngOnDestroy(): void {
    this.selectedExperimentSubscription.unsubscribe();
    this.hyperParamsConfigSubscription.unsubscribe();
  }

  activateEditChanged(e) {
    this.store.dispatch(new ActivateEdit(e.sectionName));
  }

}
