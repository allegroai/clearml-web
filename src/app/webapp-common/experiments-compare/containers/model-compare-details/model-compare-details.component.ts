import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit,} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {experimentListUpdated} from '../../actions/experiments-compare-details.actions';
import {selectModelsDetails} from '../../reducers';
import {filter, tap} from 'rxjs/operators';
import {ExperimentCompareTree,} from '~/features/experiments-compare/experiments-compare-models';
import {convertmodelsArrays, getAllKeysEmptyObject, isDetailsConverted} from '../../jsonToDiffConvertor';
import {ExperimentCompareBase} from '../experiment-compare-base';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfigurationItem} from '~/business-logic/model/tasks/configurationItem';
import {RefreshService} from '@common/core/services/refresh.service';
import {LIMITED_VIEW_LIMIT} from '@common/experiments-compare/experiments-compare.constants';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {ModelDetail} from '@common/experiments-compare/shared/experiments-compare-details.model';

@Component({
  selector: 'sm-model-compare-details',
  templateUrl: './model-compare-details.component.html',
  styleUrls: ['./model-compare-details.component.scss', '../../cdk-drag.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelCompareDetailsComponent extends ExperimentCompareBase implements OnInit, AfterViewInit {
  public showEllipsis: boolean = true;

  constructor(
    public router: Router,
    public store: Store,
    public changeDetection: ChangeDetectorRef,
    public activeRoute: ActivatedRoute,
    public cdr: ChangeDetectorRef,
    public refresh: RefreshService
  ) {
    super(router, store, changeDetection, activeRoute, refresh, cdr);
    this.entityType = EntityTypeEnum.model;
  }

  experiments$ = this.store.pipe(select(selectModelsDetails));

  ngOnInit() {
    this.onInit();
    this.routerParamsSubscription = this.taskIds$.subscribe((experimentIds) => {
        this.store.dispatch(experimentListUpdated({ids: experimentIds.slice(0, LIMITED_VIEW_LIMIT), entity: EntityTypeEnum.model}));
      }
    );

    this.experimentsSubscription = this.experiments$.pipe(
      filter(experiments => !!experiments && experiments.length > 0),
      tap(experiments => {
        this.extractTags(experiments);
      }),
    ).subscribe(models => {
      this.originalExperiments = models.reduce((acc, exp) => {
        acc[exp.id] = isDetailsConverted(exp) ? this.originalExperiments[exp.id] : exp;
        return acc;
      }, {} as { [id: string]: ConfigurationItem });
      models = Object.values(this.originalExperiments).map(experiment => convertmodelsArrays(experiment, this.originalExperiments[models[0].id], models));

      this.resetComponentState(models);
      this.calculateTree(models);
    });
  }

  buildCompareTree(experiments: Array<ModelDetail>): ExperimentCompareTree {
    const mergedExperiment = getAllKeysEmptyObject(experiments);
    return experiments
      .reduce((acc, cur) => {
        acc[cur.id] = this.buildExperimentTree(cur, this.baseExperiment, mergedExperiment);

        return acc;
      }, {} as ExperimentCompareTree);
  }

  toggleEllipsis() {
    this.showEllipsis = !this.showEllipsis;
  }

  public buildExperimentTree(experiment, baseExperiment, mergedExperiment): any {
    return {
      general: this.buildSectionTree(experiment, 'general', mergedExperiment),
      labels: this.buildSectionTree(experiment, 'labels', mergedExperiment),
      metadata: this.buildSectionTree(experiment, 'metadata', mergedExperiment),
    };
  }
}
