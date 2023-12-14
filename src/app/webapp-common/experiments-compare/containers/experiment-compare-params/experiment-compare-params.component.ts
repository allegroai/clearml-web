import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
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
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';

@Component({
  selector: 'sm-experiment-compare-params',
  templateUrl: './experiment-compare-params.component.html',
  styleUrls: [ './experiment-compare-params.component.scss', '../../cdk-drag.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentCompareParamsComponent extends ExperimentCompareBase implements OnInit {
  public showEllipsis: boolean = true;
  protected entityType: EntityTypeEnum;

  constructor(
    public router: Router,
    public store: Store<ExperimentInfoState>,
    public changeDetection: ChangeDetectorRef,
    public activeRoute: ActivatedRoute,
    public refresh: RefreshService,
    public cdr: ChangeDetectorRef
  ) {
    super(router, store, changeDetection, activeRoute, refresh, cdr);
  }

  experiments$ = this.store.pipe(select(selectExperimentsParams));

  ngOnInit() {
    this.entityType = this.activeRoute.snapshot.parent.parent.data.entityType;
    this.onInit();
    this.compareTabPage = this.activeRoute?.snapshot?.routeConfig?.data?.mode;
    this.routerParamsSubscription = this.taskIds$.subscribe(
      (experimentIds) => {
        this.store.dispatch(experimentListUpdated({ids: experimentIds.slice(0, LIMITED_VIEW_LIMIT), entity: this.entityType}));
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
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'hyper-params': this.buildSectionTree(cur, this.entityType === EntityTypeEnum.model? 'design': 'hyperparams', mergedExperiment)
        };

        return acc;
      }, {} as ExperimentCompareTree);
  }


  toggleEllipsis() {
    this.showEllipsis = !this.showEllipsis;
  }
}
