import {InjectionToken, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SMSharedModule} from '@common/shared/shared.module';
import {ExperimentConverterService} from './services/experiment-converter.service';
import { ExperimentMenuComponent } from '@common/experiments/shared/components/experiment-menu/experiment-menu.component';
import {ExperimentMenuExtendedComponent} from '../containers/experiment-menu-extended/experiment-menu-extended.component';
import {ExperimentHeaderComponent} from '@common/experiments/dumb/experiment-header/experiment-header.component';
import {SelectHyperParamsForCustomColComponent} from '@common/experiments/dumb/select-hyper-params-for-custom-col/select-hyper-params-for-custom-col.component';
import {ExperimentExecutionParametersComponent} from '@common/experiments/dumb/experiment-execution-parameters/experiment-execution-parameters.component';
import {CloneDialogComponent} from '@common/experiments/shared/components/clone-dialog/clone-dialog.component';
import {ExperimentSystemTagsComponent} from '@common/experiments/shared/components/experiments-system-tags/experiment-system-tags.component';
import {AbortAllChildrenDialogComponent} from '@common/experiments/shared/components/abort-all-children-dialog/abort-all-children-dialog.component';
import {ExperimentsTableComponent} from '@common/experiments/dumb/experiments-table/experiments-table.component';
import {ChangeProjectDialogComponent} from '@common/experiments/shared/components/change-project-dialog/change-project-dialog.component';
import {ExperimentOutputPlotsComponent} from '@common/experiments/containers/experiment-output-plots/experiment-output-plots.component';
import {ExperimentCustomColsMenuComponent} from '@common/experiments/dumb/experiment-custom-cols-menu/experiment-custom-cols-menu.component';
import {SharedPipesModule} from '@common/shared/pipes/shared-pipes.module';
import {EffectsModule} from '@ngrx/effects';
import {CommonExperimentsMenuEffects} from '@common/experiments/effects/common-experiments-menu.effects';
import {CommonExperimentOutputEffects} from '@common/experiments/effects/common-experiment-output.effects';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {ExperimentsMenuEffects} from '~/features/experiments/effects/experiments-menu.effects';
import {ActionReducer, StoreConfig, StoreModule} from '@ngrx/store';
import {CommonLayoutModule} from '@common/layout/layout.module';
import {FormsModule} from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ExperimentOutputEffects} from '~/features/experiments/effects/experiment-output.effects';
import {EXPERIMENTS_PREFIX, EXPERIMENTS_STORE_KEY} from '@common/experiments/experiment.consts';
import {ExperimentCompareSharedModule} from '@common/experiments-compare/shared/experiment-compare-shared.module';
import {CommonExperimentsViewEffects} from '@common/experiments/effects/common-experiments-view.effects';
import {ExperimentGraphsModule} from '@common/shared/experiment-graphs/experiment-graphs.module';
import {CommonExperimentsInfoEffects} from '@common/experiments/effects/common-experiments-info.effects';
import {UserPreferences} from '@common/user-preferences';
import {createUserPrefFeatureReducer} from '@common/core/meta-reducers/user-pref-reducer';
import {ExperimentState} from '~/features/experiments/reducers';
import {merge, pick} from 'lodash-es';
import {EXPERIMENTS_OUTPUT_PREFIX} from '@common/experiments/actions/common-experiment-output.actions';
import {EXPERIMENTS_INFO_PREFIX} from '@common/experiments/actions/common-experiments-info.actions';
import {experimentsReducers} from '~/features/experiments/reducers';
import {CommonExperimentConverterService} from '@common/experiments/shared/services/common-experiment-converter.service';
import {HyperParamMetricColumnComponent} from '@common/experiments/shared/components/hyper-param-metric-column/hyper-param-metric-column.component';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';

export const experimentSyncedKeys = [
  'view.projectColumnsSortOrder',
  'view.projectColumnFilters',
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

export const getExperimentsConfig = (userPreferences: UserPreferences) => ({
  metaReducers: [
    reducer => {
      let onInit = true;
      return (state, action) => {
        const nextState = reducer(state, action);
        if (onInit) {
          onInit = false;
          const savedState = JSON.parse(localStorage.getItem(localStorageKey));
          return merge({}, nextState, savedState);
        }
        if (action.type.startsWith(EXPERIMENTS_PREFIX)) {
          localStorage.setItem(localStorageKey, JSON.stringify(pick(nextState, ['view.tableMode'])));
        }
        return nextState;
      };
    },
    (reducer: ActionReducer<any>) =>
      createUserPrefFeatureReducer(EXPERIMENTS_STORE_KEY, experimentSyncedKeys, [EXPERIMENTS_PREFIX, EXPERIMENTS_INFO_PREFIX, EXPERIMENTS_OUTPUT_PREFIX], userPreferences, reducer),
  ]
});
const DECLARATIONS = [
  ExperimentMenuComponent,
  ExperimentMenuExtendedComponent,
  ExperimentSystemTagsComponent,
  ChangeProjectDialogComponent,
  CloneDialogComponent,
  AbortAllChildrenDialogComponent,
  ExperimentExecutionParametersComponent,
  ExperimentsTableComponent,
  ExperimentHeaderComponent,
  ExperimentCustomColsMenuComponent,
  SelectHyperParamsForCustomColComponent,
  ExperimentOutputPlotsComponent,
];

@NgModule({
  imports        : [
    SMSharedModule,
    CommonModule,
    FormsModule,
    StoreModule.forFeature(EXPERIMENTS_STORE_KEY, experimentsReducers, EXPERIMENT_CONFIG_TOKEN),
    EffectsModule.forFeature([
      ExperimentOutputEffects, ExperimentsMenuEffects,
      CommonExperimentsViewEffects,
      CommonExperimentsInfoEffects,
      CommonExperimentOutputEffects,
      CommonExperimentsMenuEffects
    ]),
    SharedPipesModule,
    ExperimentCompareSharedModule,
    ExperimentGraphsModule,
    MatProgressSpinnerModule,
    ScrollingModule,
    CommonLayoutModule,
    HyperParamMetricColumnComponent,
    LabeledFormFieldDirective,
  ],
  declarations   : [...DECLARATIONS],
  providers      : [
    ExperimentConverterService,
    CommonExperimentConverterService,
    {provide: EXPERIMENT_CONFIG_TOKEN, useFactory: getExperimentsConfig, deps: [UserPreferences]},
  ],
  exports        : [...DECLARATIONS]
})
export class ExperimentSharedModule {
}
