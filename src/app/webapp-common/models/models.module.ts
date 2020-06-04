import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {ModelSharedModule} from './shared/model-shared.module';
import {SMSharedModule} from '../shared/shared.module';
import {ModelRouterModule} from './models-routing.module';
import {ModelInfoComponent} from './containers/model-info/model-info.component';
import {ModelsComponent} from './models.component';
import {EffectsModule} from '@ngrx/effects';
import {ActionReducer, StoreModule} from '@ngrx/store';
import {reducers} from './reducers';
import {ModelsViewEffects} from './effects/models-view.effects';
import {ModelInfoHeaderComponent} from './dumbs/model-info-header/model-info-header.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ModelFooterComponent} from './dumbs/model-footer/model-footer.component';
import {ModelsInfoEffects} from './effects/models-info.effects';
import {ModelInfoGeneralComponent} from './containers/model-info-general/model-info-general.component';
import {ModelGeneralInfoComponent} from './dumbs/model-general-info/model-general-info.component';
import {ModelInfoNetworkComponent} from './containers/model-info-network/model-info-network.component';
import {ModelViewNetworkComponent} from './dumbs/model-view-network/model-view-network.component';
import {ModelInfoLabelsComponent} from './containers/model-info-labels/model-info-labels.component';
import {ModelInfoLabelsViewComponent} from './dumbs/model-info-labels-view/model-info-labels-view.component';
import {ExperimentSharedModule} from '../../features/experiments/shared/experiment-shared.module';
import {ModelsMenuEffects} from './effects/models-menu.effects';
import {AngularSplitModule} from 'angular-split';
import {CommonLayoutModule} from '../layout/layout.module';
import {FeatureModelsModule} from '../../features/models/feature-models.module';
import {SmFormBuilderService} from '../core/services/sm-form-builder.service';
import {MODELS_PREFIX_INFO, MODELS_PREFIX_MENU, MODELS_PREFIX_VIEW, MODELS_STORE_KEY} from './models.consts';
import {createLocalStorageReducer} from '../core/meta-reducers/local-storage-reducer';
import {ModelCustomColsMenuComponent} from './dumbs/model-custom-cols-menu/model-custom-cols-menu.component';
import {BaseModelMenuComponent} from './containers/model-menu/model-menu.component';
import {ModelHeaderComponent} from '../../features/models/dumb/model-header/model-header.component';

const syncedKeys    = [
  'view.colsOrder'
];
const key           = MODELS_STORE_KEY;
const actionsPrefix = [MODELS_PREFIX_INFO, MODELS_PREFIX_MENU, MODELS_PREFIX_VIEW];

export function localStorageReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return createLocalStorageReducer(key, syncedKeys, actionsPrefix)(reducer);
}
@NgModule({
  imports        : [
    ExperimentSharedModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CommonLayoutModule,
    ModelRouterModule,
    ModelSharedModule,
    SMSharedModule,
    FeatureModelsModule,
    AngularSplitModule.forRoot(),
    StoreModule.forFeature(MODELS_STORE_KEY, reducers, {metaReducers: [localStorageReducer]}),
    EffectsModule.forFeature([ModelsViewEffects, ModelsInfoEffects, ModelsMenuEffects]),
    FeatureModelsModule,
  ],
  providers      : [SmFormBuilderService, DatePipe],
  declarations   : [ModelInfoComponent, ModelsComponent, ModelInfoHeaderComponent,
    ModelViewNetworkComponent, ModelInfoNetworkComponent, ModelFooterComponent,
    ModelInfoLabelsComponent, ModelInfoLabelsViewComponent, ModelInfoGeneralComponent,
    ModelGeneralInfoComponent, ModelHeaderComponent, BaseModelMenuComponent,
    ModelCustomColsMenuComponent]
})
export class ModelsModule {
}
