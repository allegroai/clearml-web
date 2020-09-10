import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {experimentListUpdated, setExperiments} from '../../actions/experiments-compare-details.actions';
import {selectExperimentsDetails} from '../../reducers';
import {filter, tap} from 'rxjs/operators';
import {ExperimentCompareTree, IExperimentDetail} from '../../../../features/experiments-compare/experiments-compare-models';
import {convertExperimentsArrays, getAllKeysEmptyObject, isDetailsConverted} from '../../jsonToDiffConvertor';
import {ExperimentCompareBase} from '../experiment-compare-base';
import {ActivatedRoute, Router} from '@angular/router';
import {IExperimentInfoState} from '../../../../features/experiments/reducers/experiment-info.reducer';
import {ConfigurationItem} from '../../../../business-logic/model/tasks/configurationItem';

@Component({
  selector: 'sm-experiment-compare-details',
  templateUrl: './experiment-compare-details.component.html',
  styleUrls: ['./experiment-compare-details.component.scss', '../../cdk-drag.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentCompareDetailsComponent extends ExperimentCompareBase implements OnInit {
  public showEllipsis: boolean = true;

  constructor(public router: Router,
              public store: Store<IExperimentInfoState>,
              public changeDetection: ChangeDetectorRef,
              public activeRoute: ActivatedRoute) {
    super(router, store, changeDetection, activeRoute);
  }

  experiments$ = this.store.pipe(select(selectExperimentsDetails));

  ngOnInit() {
    this.onInit();

    this.routerParamsSubscription = this.taskIds$.subscribe((experimentIds: string) => this.store.dispatch(experimentListUpdated({ids: experimentIds.split(',')})));

    this.experimentsSubscription = this.experiments$.pipe(
      filter(experiments => !!experiments && experiments.length > 0),
      tap(experiments => {
        this.syncUrl(experiments);
        this.extractTags(experiments);
      }),
    ).subscribe(experiments => {
      this.originalExperiments = experiments.reduce((acc, exp) => {
        acc[exp.id] = isDetailsConverted(exp) ? this.originalExperiments[exp.id] : exp;
        return acc;
      }, {} as { [id: string]: ConfigurationItem });
      experiments = Object.values(this.originalExperiments).map(experiment => convertExperimentsArrays(experiment, this.originalExperiments[experiments[0].id], experiments));
      this.resetComponentState(experiments);
      this.calculateTree(experiments);
    });
  }

  buildCompareTree(experiments: Array<IExperimentDetail>): ExperimentCompareTree {
    const mergedExperiment = getAllKeysEmptyObject(experiments);
    return experiments
      .reduce((acc, cur) => {
        acc[cur.id] = this.buildExperimentTree(cur, this.baseExperiment, mergedExperiment);

        return acc;
      }, {} as ExperimentCompareTree);
  }

  experimentListChanged(experiments: Array<IExperimentDetail>) {
    this.store.dispatch(setExperiments({experiments}));
  }

  toggleEllipsis() {
    this.showEllipsis = !this.showEllipsis;
  }
}
