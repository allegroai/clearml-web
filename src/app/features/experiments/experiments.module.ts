import {InjectionToken, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExperimentSharedModule} from './shared/experiment-shared.module';
import {SMSharedModule} from '@common/shared/shared.module';
import {ExperimentRouterModule} from './experiments-routing.module';
import {ExperimentsComponent} from './experiments.component';
import {EffectsModule} from '@ngrx/effects';
import {StoreConfig, StoreModule} from '@ngrx/store';
import {experimentsReducers, ExperimentState} from './reducers';
import {AdminService} from '~/shared/services/admin.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SelectModelModule} from '@common/select-model/select-model.module';
import {SmSyncStateSelectorService} from '@common/core/services/sync-state-selector.service';
import {ExperimentOutputEffects} from './effects/experiment-output.effects';
import {ExperimentsMenuEffects} from './effects/experiments-menu.effects';
import {LayoutModule} from '~/layout/layout.module';
import {ExperimentGraphsModule} from '@common/shared/experiment-graphs/experiment-graphs.module';
import {ExperimentCompareSharedModule} from '@common/experiments-compare/shared/experiment-compare-shared.module';
import {AngularSplitModule} from 'angular-split';
import {SMMaterialModule} from '@common/shared/material/material.module';
import {ExperimentsCommonModule} from '@common/experiments/common-experiments.module';
import {CommonLayoutModule} from '@common/layout/layout.module';
import {EXPERIMENTS_STORE_KEY} from '@common/experiments/shared/common-experiments.const';
import {DebugImagesModule} from '@common/debug-images/debug-images.module';
import {ExperimentInfoExecutionComponent} from '@common/experiments/containers/experiment-info-execution/experiment-info-execution.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {ExperimentOutputComponent} from './containers/experiment-ouptut/experiment-output.component';
import {merge, pick} from 'lodash/fp';
import {EXPERIMENTS_PREFIX} from '@common/experiments/actions/common-experiments-view.actions';
import {ExperimentInfoNavbarComponent} from './containers/experiment-info-navbar/experiment-info-navbar.component';


export const experimentSyncedKeys = [
  'view.projectColumnsSortOrder',
  'view.projectColumnFilter',
  'view.projectColumnsWidth',
  'view.hiddenProjectTableCols',
  'view.metricsCols',
  'view.colsOrder',
  'output.scalarsHoverMode',
  'info.userKnowledge',
  'output.settingsList',
];

export const EXPERIMENT_CONFIG_TOKEN =
  new InjectionToken<StoreConfig<ExperimentState, any>>('ExperimentConfigToken');

const localStorageKey = '_saved_experiment_state_';

const getExperimentsConfig = () => ({
  metaReducers: [reducer => {
    let onInit = true;
    return (state, action) => {
      const nextState = reducer(state, action);
      if (onInit) {
        onInit = false;
        const savedState = JSON.parse(localStorage.getItem(localStorageKey));
        return merge(nextState, savedState);
      }
      if (action.type.startsWith(EXPERIMENTS_PREFIX)) {
        localStorage.setItem(localStorageKey, JSON.stringify(pick(['view.tableMode'], nextState)));
      }
      return nextState;
    };
  }]
});


@NgModule({
  imports: [
    SMMaterialModule,
    FormsModule,
    LayoutModule,
    ReactiveFormsModule,
    CommonModule,
    ExperimentsCommonModule,
    SMSharedModule,
    ExperimentRouterModule,
    ExperimentSharedModule,
    ExperimentGraphsModule,
    SelectModelModule,
    DebugImagesModule,
    ExperimentCompareSharedModule,
    CommonLayoutModule,
    MatSidenavModule,
    MatListModule,
    AngularSplitModule,
    StoreModule.forFeature(EXPERIMENTS_STORE_KEY, experimentsReducers, EXPERIMENT_CONFIG_TOKEN),
    EffectsModule.forFeature([ExperimentOutputEffects, ExperimentsMenuEffects]),
  ],
  declarations: [
    ExperimentsComponent,
    ExperimentInfoExecutionComponent,
    ExperimentOutputComponent,
    ExperimentInfoNavbarComponent
  ],
  providers: [
    AdminService,
    SmSyncStateSelectorService,
    {provide: EXPERIMENT_CONFIG_TOKEN, useFactory: getExperimentsConfig},
  ]
})
export class ExperimentsModule {
}
