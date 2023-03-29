import {ChangeDetectorRef, Component} from '@angular/core';
import {
  ExperimentOutputScalarsComponent
} from '@common/experiments/containers/experiment-output-scalars/experiment-output-scalars.component';
import {ExperimentInfoState} from '~/features/experiments/reducers/experiment-info.reducer';
import {Store} from '@ngrx/store';
import {ActivatedRoute, Router} from '@angular/router';
import { selectSelectedModel } from '@common/models/reducers';
import {experimentScalarRequested} from '@common/experiments/actions/common-experiment-output.actions';
import {ReportCodeEmbedService} from '~/shared/services/report-code-embed.service';

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
  protected exportForReport = false;

  constructor(
    protected store: Store<ExperimentInfoState>,
    protected router: Router,
    protected activeRoute: ActivatedRoute,
    protected changeDetection: ChangeDetectorRef,
    protected reportEmbed: ReportCodeEmbedService
  ) {
    super(store, router, activeRoute, changeDetection, reportEmbed);
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
