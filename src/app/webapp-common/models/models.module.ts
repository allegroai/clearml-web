import {InjectionToken, NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {ModelSharedModule} from './shared/model-shared.module';
import {SMSharedModule} from '../shared/shared.module';
import {ModelRouterModule} from './models-routing.module';
import {ModelInfoComponent} from './containers/model-info/model-info.component';
import {ModelsComponent} from './models.component';
import {EffectsModule} from '@ngrx/effects';
import {StoreConfig, StoreModule} from '@ngrx/store';
import {ModelsState, reducers} from './reducers';
import {ModelsViewEffects} from './effects/models-view.effects';
import {ModelInfoHeaderComponent} from './dumbs/model-info-header/model-info-header.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ModelsInfoEffects} from './effects/models-info.effects';
import {ModelInfoGeneralComponent} from './containers/model-info-general/model-info-general.component';
import {ModelGeneralInfoComponent} from './dumbs/model-general-info/model-general-info.component';
import {ModelInfoNetworkComponent} from './containers/model-info-network/model-info-network.component';
import {ModelViewNetworkComponent} from './dumbs/model-view-network/model-view-network.component';
import {ModelInfoLabelsComponent} from './containers/model-info-labels/model-info-labels.component';
import {ModelInfoLabelsViewComponent} from './dumbs/model-info-labels-view/model-info-labels-view.component';
import {ExperimentSharedModule} from '~/features/experiments/shared/experiment-shared.module';
import {ModelsMenuEffects} from './effects/models-menu.effects';
import {AngularSplitModule} from 'angular-split';
import {CommonLayoutModule} from '../layout/layout.module';
import {FeatureModelsModule} from '~/features/models/feature-models.module';
import {SmFormBuilderService} from '../core/services/sm-form-builder.service';
import {MODELS_PREFIX_VIEW, MODELS_STORE_KEY} from './models.consts';
import {ModelCustomColsMenuComponent} from './dumbs/model-custom-cols-menu/model-custom-cols-menu.component';
import {ModelHeaderComponent} from '~/webapp-common/models/dumbs/model-header/model-header.component';
import {SharedModule} from '~/shared/shared.module';
import {CommonDeleteDialogModule} from '../shared/entity-page/entity-delete/common-delete-dialog.module';
import { ModelInfoMetadataComponent } from './containers/model-info-metadata/model-info-metadata.component';
import { SelectMetadataKeysCustomColsComponent } from './dumbs/select-metadata-keys-custom-cols/select-metadata-keys-custom-cols.component';
import {merge, pick} from 'lodash/fp';

export const modelSyncedKeys    = [
  'view.projectColumnsSortOrder',
  'view.projectColumnFilters',
  'view.projectColumnsWidth',
  'view.hiddenProjectTableCols',
  'view.colsOrder',
  'view.metadataCols'
];

export const MODELS_CONFIG_TOKEN =
  new InjectionToken<StoreConfig<ModelsState, any>>('ModelsConfigToken');

const localStorageKey = '_saved_models_state_';

const getInitState = () =>
  ({
    metaReducers: [reducer => {
      let onInit = true;
      return (state, action) => {
        const nextState = reducer(state, action);
        if (onInit) {
          onInit = false;
          const savedState = JSON.parse(localStorage.getItem(localStorageKey));
          return merge(nextState, savedState);
        }
        if (action.type.startsWith(MODELS_PREFIX_VIEW)) {
          localStorage.setItem(localStorageKey, JSON.stringify(pick(['view.tableMode'], nextState)));
        }
        return nextState;
      };
    }]
  });


@NgModule({
  imports: [
    ExperimentSharedModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CommonLayoutModule,
    ModelRouterModule,
    ModelSharedModule,
    CommonDeleteDialogModule,
    SMSharedModule,
    FeatureModelsModule,
    AngularSplitModule,
    StoreModule.forFeature(MODELS_STORE_KEY, reducers, MODELS_CONFIG_TOKEN),
    EffectsModule.forFeature([ModelsViewEffects, ModelsInfoEffects, ModelsMenuEffects]),
    FeatureModelsModule,
    SharedModule,
  ],
  providers      : [
    SmFormBuilderService, DatePipe,
    {provide: MODELS_CONFIG_TOKEN, useFactory: getInitState},
  ],
  declarations   : [ModelInfoComponent, ModelsComponent, ModelInfoHeaderComponent,
    ModelViewNetworkComponent, ModelInfoNetworkComponent,
    ModelInfoLabelsComponent, ModelInfoLabelsViewComponent, ModelInfoGeneralComponent,
    ModelGeneralInfoComponent, ModelHeaderComponent,
    ModelCustomColsMenuComponent,
    ModelInfoMetadataComponent,
    SelectMetadataKeysCustomColsComponent]
})
export class ModelsModule {
}
