import {Component} from '@angular/core';
import {
  ExperimentOutputScalarsComponent
} from '@common/experiments/containers/experiment-output-scalars/experiment-output-scalars.component';
import {ActivatedRoute} from '@angular/router';
import {selectSelectedModel} from '@common/models/reducers';
import {
  experimentScalarRequested,
  setExperimentSettings
} from '@common/experiments/actions/common-experiment-output.actions';
import {debounceTime, distinctUntilChanged, filter, tap} from 'rxjs/operators';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {
  selectModelInfoHistograms,
  selectModelSettingsGroupBy,
  selectModelSettingsHiddenScalar,
  selectModelSettingsSmoothType,
  selectModelSettingsSmoothWeight,
  selectModelSettingsXAxisType, selectSelectedSettingsModelTableMetric,
  selectSelectedSettingsTableMetric,
} from '@common/experiments/reducers';
import {isEqual} from 'lodash-es';

@Component({
  selector: 'sm-model-info-scalars',
  templateUrl: '../../../experiments/containers/experiment-output-scalars/experiment-output-scalars.component.html',
  styleUrls: [
    '../../../experiments/containers/experiment-output-scalars/experiment-output-scalars.component.scss',
    '../../../experiments/containers/experiment-output-scalars/shared-experiment-output.scss'
  ]
})
export class ModelInfoScalarsComponent extends ExperimentOutputScalarsComponent {

  constructor(private route: ActivatedRoute) {
    super();
    this.tableSelectedMetrics$ = this.store.select(selectSelectedSettingsModelTableMetric);
    this.entitySelector = this.store.select(selectSelectedModel);
    this.entityType = 'model';
    this.exportForReport = !route.snapshot?.parent?.parent?.data?.setAllProject;

    this.xAxisType$ = this.store.select(selectModelSettingsXAxisType);
    this.groupBy$ = this.store.select(selectModelSettingsGroupBy);
    this.smoothWeight$ = this.store.select(selectModelSettingsSmoothWeight).pipe(filter(smooth => smooth !== null));
    this.smoothWeightDelayed$ = this.store.select(selectModelSettingsSmoothWeight).pipe(debounceTime(75));
    this.smoothType$ = this.store.select(selectModelSettingsSmoothType);
    this.listOfHidden$ = this.store.select(selectModelSettingsHiddenScalar)
      .pipe(distinctUntilChanged(isEqual));

    this.scalars$ = this.store.select(selectModelInfoHistograms)
      .pipe(
        filter((metrics) => !!metrics),
      );

    this.routerParams$ = this.store.select(selectRouterParams)
      .pipe(
        filter(params => !!params.modelId),
        tap(params => this.experimentId = params.modelId),
        distinctUntilChanged()
      );

  }

  override refresh() {
    if (!this.refreshDisabled) {
      this.refreshDisabled = true;
      this.store.dispatch(experimentScalarRequested({experimentId: this.experimentId, model: true}));
    }
  }

  protected override axisChanged() {
    this.store.dispatch(experimentScalarRequested({experimentId: this.experimentId, model: true}));
    this.experimentGraphs.prepareRedraw();
  }
}
