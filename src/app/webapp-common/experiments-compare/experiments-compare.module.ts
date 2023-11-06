import {InjectionToken, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExperimentsCompareComponent} from './experiments-compare.component';
import {ExperimentsCompareRoutingModule} from './experiments-compare-routing.module';
import {ActionReducer, StoreConfig, StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {experimentsCompareReducers} from './reducers';
import {ExperimentsCompareDetailsEffects} from './effects/experiments-compare-details.effects';
import {ExperimentsCompareChartsEffects} from './effects/experiments-compare-charts.effects';
import {ExperimentsCompareMetricsValuesEffects} from './effects/experiments-compare-metrics-values.effects';
import {SMSharedModule} from '../shared/shared.module';
import {
  ExperimentCompareDetailsComponent
} from './containers/experiment-compare-details/experiment-compare-details.component';
import {
  ExperimentCompareMetricValuesComponent
} from './containers/experiment-compare-metric-values/experiment-compare-metric-values.component';
import {
  ExperimentCompareScalarChartsComponent
} from './containers/experiment-compare-metric-charts/experiment-compare-scalar-charts.component';
import {ExperimentCompareHeaderComponent} from './dumbs/experiment-compare-header/experiment-compare-header.component';
import {ExperimentSharedModule} from '~/features/experiments/shared/experiment-shared.module';
import {
  ExperimentComparePlotsComponent
} from './containers/experiment-compare-plots/experiment-compare-plots.component';
import {ExperimentGraphsModule} from '../shared/experiment-graphs/experiment-graphs.module';

import {DebugImagesModule} from '../debug-images/debug-images.module';
import {ExperimentCompareSharedModule} from './shared/experiment-compare-shared.module';
import {GetKeyValueArrayPipePipe} from './get-key-value-array-pipe.pipe';
import {SelectCompareHeaderEffects} from './effects/select-experiment-for-compare-effects.service';
import {
  SelectExperimentsForCompareComponent
} from './containers/select-experiments-for-compare/select-experiments-for-compare.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {CompareCardListComponent} from './dumbs/compare-card-list/compare-card-list.component';
import {CompareCardBodyDirective} from './dumbs/compare-card-body.directive';
import {CompareCardExtraHeaderDirective} from './dumbs/compare-card-extra-header.directive';
import {CompareCardHeaderDirective} from './dumbs/compare-card-header.directive';
import {TableDiffModule} from '../shared/ui-components/data/table-diff/table-diff.module';
import {CardModule} from '../shared/ui-components/panel/card2';
import {DrawerModule} from '../shared/ui-components/panel/drawer';
import {
  ParallelCoordinatesGraphComponent
} from './dumbs/parallel-coordinates-graph/parallel-coordinates-graph.component';
import {
  ExperimentCompareHyperParamsGraphComponent
} from './containers/experiment-compare-hyper-params-graph/experiment-compare-hyper-params-graph.component';
import {ExperimentsCompareScalarsGraphEffects} from './effects/experiments-compare-scalars-graph.effects';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MatRadioModule} from '@angular/material/radio';
import {
  ExperimentCompareParamsComponent
} from './containers/experiment-compare-params/experiment-compare-params.component';
import {ExperimentsCompareParamsEffects} from './effects/experiments-compare-params.effects';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UiComponentsModule} from '../shared/ui-components/ui-components.module';
import {SMMaterialModule} from '../shared/material/material.module';
import {SharedPipesModule} from '@common/shared/pipes/shared-pipes.module';
import {ModelCompareDetailsComponent} from '@common/experiments-compare/containers/model-compare-details/model-compare-details.component';
import {IExperimentCompareChartsState} from '@common/experiments-compare/reducers/experiments-compare-charts.reducer';
import {UserPreferences} from '@common/user-preferences';
import {merge, pick} from 'lodash-es';
import {EXPERIMENTS_PREFIX} from '@common/experiments/experiment.consts';
import {createUserPrefFeatureReducer} from '@common/core/meta-reducers/user-pref-reducer';
import {EXPERIMENTS_COMPARE_METRICS_CHARTS_} from '@common/experiments-compare/actions/experiments-compare-charts.actions';
import {EXPERIMENTS_COMPARE_SELECT_EXPERIMENT_} from '@common/experiments-compare/actions/compare-header.actions';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import {EllipsisMiddleDirective} from '@common/shared/ui-components/directives/ellipsis-middle.directive';

export const COMPARE_STORE_KEY = 'experimentsCompare';
export const COMPARE_CONFIG_TOKEN =
  new InjectionToken<StoreConfig<IExperimentCompareChartsState, any>>('CompareConfigToken');

export const compareSyncedKeys = [
];

const localStorageKey = '_saved_compare_state_';

export const getCompareConfig = (userPreferences: UserPreferences) => ({
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
        if (action.type.startsWith('EXPERIMENTS_COMPARE_')) {
          localStorage.setItem(localStorageKey, JSON.stringify(pick(nextState, ['charts.settingsList', 'charts.scalarsHoverMode'])));
        }
        return nextState;
      };
    },
    (reducer: ActionReducer<any>) =>
      createUserPrefFeatureReducer(COMPARE_STORE_KEY, compareSyncedKeys, [EXPERIMENTS_COMPARE_METRICS_CHARTS_, EXPERIMENTS_COMPARE_SELECT_EXPERIMENT_], userPreferences, reducer),
  ]
});

@NgModule({
  declarations: [
    ExperimentsCompareComponent,
    ExperimentCompareDetailsComponent,
    ModelCompareDetailsComponent,
    ExperimentCompareParamsComponent,
    ExperimentCompareMetricValuesComponent,
    ExperimentCompareScalarChartsComponent,
    ExperimentComparePlotsComponent,
    ExperimentCompareHeaderComponent,
    GetKeyValueArrayPipePipe,
    SelectExperimentsForCompareComponent,
    CompareCardListComponent,
    CompareCardBodyDirective,
    CompareCardExtraHeaderDirective,
    CompareCardHeaderDirective,
    ExperimentCompareHyperParamsGraphComponent
  ],
    exports: [
        GetKeyValueArrayPipePipe,
    ],
    imports: [
        CommonModule,
        DragDropModule,
        DebugImagesModule,
        SMSharedModule,
        SMMaterialModule,
        UiComponentsModule,
        TableDiffModule,
        ScrollingModule,
        CardModule,
        DrawerModule,
        ExperimentSharedModule,
        ExperimentsCompareRoutingModule,
        ExperimentGraphsModule,
        ExperimentCompareSharedModule,
        StoreModule.forFeature(COMPARE_STORE_KEY, experimentsCompareReducers, COMPARE_CONFIG_TOKEN),
        EffectsModule.forFeature([
            ExperimentsCompareDetailsEffects,
            ExperimentsCompareParamsEffects,
            ExperimentsCompareChartsEffects,
            ExperimentsCompareMetricsValuesEffects,
            SelectCompareHeaderEffects,
            ExperimentsCompareScalarsGraphEffects
        ]),
        MatRadioModule,
        FormsModule,
        ParallelCoordinatesGraphComponent,
        SharedPipesModule,
        LabeledFormFieldDirective,
        ReactiveFormsModule,
        EllipsisMiddleDirective
    ],
  providers: [
    {provide: COMPARE_CONFIG_TOKEN, useFactory: getCompareConfig, deps: [UserPreferences]},
  ],
})
export class ExperimentsCompareModule {
}

