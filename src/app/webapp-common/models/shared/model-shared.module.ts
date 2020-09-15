import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SMSharedModule} from '../../shared/shared.module';
import {ModelTypeIconLabelComponent} from './model-type-icon-label/model-type-icon-label.component';
import {ModelStatusIconLabelComponent} from './model-status-icon-label/model-status-icon-label.component';
import {ModelsTableComponent} from './models-table/models-table.component';
import {ModelTagsComponent} from './model-tags/model-tags.component';
import {ExperimentSharedModule} from '../../../features/experiments/shared/experiment-shared.module';
import {LayoutModule} from '../../../layout/layout.module';
import {SelectModelHeaderComponent} from './select-model-header/select-model-header.component';
import {CommonLayoutModule} from '../../layout/layout.module';
import {CommonExperimentSharedModule} from '../../experiments/shared/common-experiment-shared.module';
import {FeatureModelsModule} from '../../../features/models/feature-models.module';
import {SharedModule} from '../../../shared/shared.module';

const DECLERATIONS = [ModelTypeIconLabelComponent, ModelStatusIconLabelComponent, SelectModelHeaderComponent, ModelsTableComponent, ModelTagsComponent];

@NgModule({
    imports: [
        CommonExperimentSharedModule,
        LayoutModule,
        ExperimentSharedModule,
        SMSharedModule,
        CommonModule,
        CommonLayoutModule,
        FeatureModelsModule,
        SharedModule
    ],
  declarations: DECLERATIONS,
  exports     : DECLERATIONS
})
export class ModelSharedModule {
}
