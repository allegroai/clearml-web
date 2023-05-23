import {CommonModule} from '@angular/common';
import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {SimpleDatasetsComponent} from '@common/datasets/simple-datasets/simple-datasets.component';
import {CommonProjectsModule} from '@common/projects/common-projects.module';
import {DatasetsRoutingModule} from '~/features/datasets/datasets-routing.module';
import {DatasetsSharedModule} from '~/features/datasets/shared/datasets-shared.module';
import {SharedPipesModule} from '@common/shared/pipes/shared-pipes.module';
import {SMSharedModule} from '@common/shared/shared.module';
import {FeatureNestedProjectViewModule} from '~/features/nested-project-view/feature-nested-project-view.module';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';


@NgModule({
  imports: [
    CommonModule,
    SMSharedModule,
    CommonProjectsModule,
    DatasetsRoutingModule,
    DatasetsSharedModule,
    SharedPipesModule,
    FeatureNestedProjectViewModule,
    LabeledFormFieldDirective,
  ],
  declarations: [
    SimpleDatasetsComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  exports: []
})
export class DatasetsModule {
}

