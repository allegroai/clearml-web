import {ChangeDetectorRef, Component} from '@angular/core';
import {
  ExperimentOutputScalarsComponent
} from '@common/experiments/containers/experiment-output-scalars/experiment-output-scalars.component';
import {ExperimentInfoState} from '~/features/experiments/reducers/experiment-info.reducer';
import {select, Store} from '@ngrx/store';
import {ActivatedRoute, Router} from '@angular/router';
import {selectSelectedModel} from '@common/models/reducers';
import {experimentScalarRequested} from '@common/experiments/actions/common-experiment-output.actions';
import {ReportCodeEmbedService} from '~/shared/services/report-code-embed.service';
import {distinctUntilChanged, filter, map, tap} from 'rxjs/operators';
import {selectSelectedModelSettings} from '~/features/experiments/reducers';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {
  selectModelInfoHistograms,
  selectModelSettingsGroupBy, selectModelSettingsHiddenScalar, selectModelSettingsSmoothWeight,
  selectModelSettingsXAxisType,
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
  protected entitySelector = this.store.select(selectSelectedModel);
  protected entityType: 'task' | 'model' = 'model';

  constructor(
    protected store: Store<ExperimentInfoState>,
    protected router: Router,
    protected activeRoute: ActivatedRoute,
    protected changeDetection: ChangeDetectorRef,
    protected reportEmbed: ReportCodeEmbedService
  ) {
    super(store, router, activeRoute, changeDetection, reportEmbed);

    this.xAxisType$ = this.store.select(selectModelSettingsXAxisType);
    this.groupBy$ = this.store.select(selectModelSettingsGroupBy);
    this.smoothWeight$ = this.store.select(selectModelSettingsSmoothWeight);
    this.listOfHidden$ = this.store.select(selectModelSettingsHiddenScalar)
      .pipe(distinctUntilChanged(isEqual));

    this.settings$ = this.store.pipe(
      select(selectSelectedModelSettings),
      filter(settings => !!settings),
      map(settings => settings ? settings.selectedScalar : null),
      distinctUntilChanged()
    );

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

  refresh() {
    if (!this.refreshDisabled) {
      this.refreshDisabled = true;
      this.store.dispatch(experimentScalarRequested({experimentId: this.experimentId, model: true}));
    }
  }

  protected axisChanged() {
    this.store.dispatch(experimentScalarRequested({experimentId: this.experimentId, model: true}));
    this.experimentGraphs.prepareRedraw();
  }
}
