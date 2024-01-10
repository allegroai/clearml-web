import {CommonModule} from '@angular/common';
import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {SimpleDatasetsComponent} from '@common/datasets/simple-datasets/simple-datasets.component';
import {CommonProjectsModule} from '@common/projects/common-projects.module';
import {DatasetsRoutingModule} from '~/features/datasets/datasets-routing.module';
import {DatasetsSharedModule} from '~/features/datasets/shared/datasets-shared.module';
import {NestedDatasetsPageComponent} from '~/features/datasets/nested-datasets-page/nested-datasets-page.component';
import {ProjectsSharedModule} from '~/features/projects/shared/projects-shared.module';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import {ButtonToggleComponent} from '@common/shared/ui-components/inputs/button-toggle/button-toggle.component';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';


@NgModule({
  imports: [
    CommonModule,
    CommonProjectsModule,
    DatasetsRoutingModule,
    DatasetsSharedModule,
    NestedDatasetsPageComponent,
    ProjectsSharedModule,
    LabeledFormFieldDirective,
    ButtonToggleComponent,
    ShowTooltipIfEllipsisDirective
  ],
  declarations: [
    SimpleDatasetsComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  exports: []
})
export class DatasetsModule {
}

