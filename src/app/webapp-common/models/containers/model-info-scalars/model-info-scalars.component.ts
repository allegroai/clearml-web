import {ChangeDetectorRef, Component} from '@angular/core';
import {RefreshService} from '@common/core/services/refresh.service';
import {
  ExperimentOutputScalarsComponent
} from '@common/experiments/containers/experiment-output-scalars/experiment-output-scalars.component';
import {Store} from '@ngrx/store';
import {ActivatedRoute, Router} from '@angular/router';
import {selectSelectedModel} from '@common/models/reducers';
import {experimentScalarRequested} from '@common/experiments/actions/common-experiment-output.actions';
import {ReportCodeEmbedService} from '~/shared/services/report-code-embed.service';
import {debounceTime, distinctUntilChanged, filter, map, tap} from 'rxjs/operators';
import {selectSelectedModelSettings} from '~/features/experiments/reducers';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {
  selectModelInfoHistograms,
  selectModelSettingsGroupBy, selectModelSettingsHiddenScalar, selectModelSettingsSmoothType, selectModelSettingsSmoothWeight,
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
    protected store: Store,
    protected router: Router,
    private route: ActivatedRoute,
    protected activeRoute: ActivatedRoute,
    protected changeDetection: ChangeDetectorRef,
    protected reportEmbed: ReportCodeEmbedService,
    protected refreshService: RefreshService
  ) {
    super(store, router, activeRoute, changeDetection, reportEmbed, refreshService);

    this.exportForReport = !route.snapshot?.parent?.parent?.data?.setAllProject;

    this.xAxisType$ = this.store.select(selectModelSettingsXAxisType);
    this.groupBy$ = this.store.select(selectModelSettingsGroupBy);
    this.smoothWeight$ = this.store.select(selectModelSettingsSmoothWeight);
    this.smoothWeightDelayed$ = this.store.select(selectModelSettingsSmoothWeight).pipe(debounceTime(75));
    this.smoothType$ = this.store.select(selectModelSettingsSmoothType);
    this.listOfHidden$ = this.store.select(selectModelSettingsHiddenScalar)
      .pipe(distinctUntilChanged(isEqual));

    this.settings$ = this.store.select(selectSelectedModelSettings).pipe(
      filter(settings => !!settings),
      map(settings => settings ? settings.selectedScalar : null),
      distinctUntilChanged(),
      filter(selectedPlot => selectedPlot !== undefined)
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
