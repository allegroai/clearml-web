import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {get} from 'lodash/fp';
import {selectExperimentsParams} from '../../reducers';
import {filter, tap} from 'rxjs/operators';
import {ExperimentCompareTree, IExperimentDetail} from '~/features/experiments-compare/experiments-compare-models';
import {ExperimentParams} from '../../shared/experiments-compare-details.model';
import {convertExperimentsArraysParams, getAllKeysEmptyObject, isParamsConverted} from '../../jsonToDiffConvertor';
import {ExperimentCompareBase} from '../experiment-compare-base';
import {ActivatedRoute, Router} from '@angular/router';
import {ExperimentInfoState} from '~/features/experiments/reducers/experiment-info.reducer';
import {experimentListUpdated} from '../../actions/experiments-compare-params.actions';
import {RefreshService} from '@common/core/services/refresh.service';
import {LIMITED_VIEW_LIMIT} from '@common/experiments-compare/experiments-compare.constants';

@Component({
  selector: 'sm-experiment-compare-params',
  templateUrl: './experiment-compare-params.component.html',
  styleUrls: ['./experiment-compare-params.component.scss', '../../cdk-drag.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentCompareParamsComponent extends ExperimentCompareBase implements OnInit {
  public showEllipsis: boolean = true;

  constructor(
    public router: Router,
    public store: Store<ExperimentInfoState>,
    public changeDetection: ChangeDetectorRef,
    public activeRoute: ActivatedRoute,
    public refresh: RefreshService
  ) {
    super(router, store, changeDetection, activeRoute, refresh);
  }

  experiments$ = this.store.pipe(select(selectExperimentsParams));

  ngOnInit() {
    this.onInit();

    this.compareTabPage = get('snapshot.routeConfig.data.mode', this.activeRoute);

    this.routerParamsSubscription = this.taskIds$.subscribe(
      (experimentIds) => {
        this.store.dispatch(experimentListUpdated({ids: experimentIds.slice(0, LIMITED_VIEW_LIMIT)}));
      });

    this.experimentsSubscription = this.experiments$.pipe(
      filter(experiments => !!experiments && experiments.length > 0),
      tap(experiments => {
        this.extractTags(experiments);
      }),
    ).subscribe(experiments => {
      this.originalExperiments = experiments.reduce((acc, exp) => {
        acc[exp.id] = isParamsConverted(exp.hyperparams) ? this.originalExperiments[exp.id] : exp;
        return acc;
      }, {} as { [id: string]: IExperimentDetail | ExperimentParams });
      const experimentList = Object.values(this.originalExperiments).map(experiment => convertExperimentsArraysParams(experiment, this.originalExperiments[experiments[0].id]));
      this.resetComponentState(experimentList);
      this.calculateTree(experimentList);
    });
  }

  buildCompareTree(experiments: Array<ExperimentParams>): ExperimentCompareTree {
    const mergedExperiment = getAllKeysEmptyObject(experiments);
    return experiments
      .reduce((acc, cur) => {
        acc[cur.id] = {
          'hyper-params': this.buildSectionTree(cur, 'hyperparams', mergedExperiment)
        };

        return acc;
      }, {} as ExperimentCompareTree);
  }


  toggleEllipsis() {
    this.showEllipsis = !this.showEllipsis;
  }
}
