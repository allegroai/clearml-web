import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SMSharedModule} from '../../shared/shared.module';
import {ModelTypeIconLabelComponent} from './model-type-icon-label/model-type-icon-label.component';
import {ModelStatusIconLabelComponent} from './model-status-icon-label/model-status-icon-label.component';
import {ModelsTableComponent} from './models-table/models-table.component';
import {ModelTagsComponent} from './model-tags/model-tags.component';
import {LayoutModule} from '~/layout/layout.module';
import {SelectModelHeaderComponent} from './select-model-header/select-model-header.component';
import {CommonLayoutModule} from '../../layout/layout.module';
import {FeatureModelsModule} from '~/features/models/feature-models.module';
import {SharedModule} from '~/shared/shared.module';
import {SharedPipesModule} from '@common/shared/pipes/shared-pipes.module';
import {HyperParamMetricColumnComponent} from '@common/experiments/shared/components/hyper-param-metric-column/hyper-param-metric-column.component';


const DECLERATIONS = [ModelTypeIconLabelComponent, ModelStatusIconLabelComponent, SelectModelHeaderComponent, ModelsTableComponent, ModelTagsComponent];

@NgModule({
    imports: [
        LayoutModule,
        SMSharedModule,
        CommonModule,
        CommonLayoutModule,
        FeatureModelsModule,
        SharedModule,
        SharedPipesModule,
        HyperParamMetricColumnComponent,
    ],
  declarations: DECLERATIONS,
  exports     : DECLERATIONS
})
export class ModelSharedModule {
}
