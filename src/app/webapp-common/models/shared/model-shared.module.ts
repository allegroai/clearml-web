import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ModelTypeIconLabelComponent} from './model-type-icon-label/model-type-icon-label.component';
import {ModelStatusIconLabelComponent} from './model-status-icon-label/model-status-icon-label.component';
import {ModelsTableComponent} from './models-table/models-table.component';
import {LayoutModule} from '~/layout/layout.module';
import {SelectModelHeaderComponent} from './select-model-header/select-model-header.component';
import {FeatureModelsModule} from '~/features/models/feature-models.module';
import {HyperParamMetricColumnComponent} from '@common/experiments/shared/components/hyper-param-metric-column/hyper-param-metric-column.component';
import {FilterPipe} from '@common/shared/pipes/filter.pipe';
import {NoUnderscorePipe} from '@common/shared/pipes/no-underscore.pipe';
import {TimeAgoPipe} from '@common/shared/pipes/timeAgo';
import {ColGetterPipe} from '@common/shared/pipes/col-getter.pipe';
import {CheckboxControlComponent} from '@common/shared/ui-components/forms/checkbox-control/checkbox-control.component';
import {StatusIconLabelComponent} from '@common/shared/experiment-status-icon-label/status-icon-label.component';
import {SearchComponent} from '@common/shared/ui-components/inputs/search/search.component';
import {
  ClearFiltersButtonComponent
} from '@common/shared/components/clear-filters-button/clear-filters-button.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {TagListComponent} from '@common/shared/ui-components/tags/tag-list/tag-list.component';
import {TagComponent} from '@common/shared/ui-components/indicators/tag/tag.component';
import {MatMenuModule} from '@angular/material/menu';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {
  TableFilterSortTemplateComponent
} from '@common/shared/ui-components/data/table/table-filter-sort-template/table-filter-sort-template.component';
import {TableComponent} from '@common/shared/ui-components/data/table/table.component';
import {
  TableCardFilterTemplateComponent
} from '@common/shared/ui-components/data/table/table-card-filter-template/table-card-filter-template.component';
import {TableCardComponent} from '@common/shared/ui-components/data/table-card/table-card.component';
import {TableModule} from 'primeng/table';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {PushPipe} from '@ngrx/component';



const DECLERATIONS = [ModelTypeIconLabelComponent, ModelStatusIconLabelComponent, SelectModelHeaderComponent, ModelsTableComponent];

@NgModule({
  imports: [
    LayoutModule,
    CommonModule,
    FeatureModelsModule,
    HyperParamMetricColumnComponent,
    FilterPipe,
    NoUnderscorePipe,
    TimeAgoPipe,
    ColGetterPipe,
    CheckboxControlComponent,
    StatusIconLabelComponent,
    SearchComponent,
    ClearFiltersButtonComponent,
    MatSlideToggleModule,
    TagListComponent,
    TagComponent,
    MatMenuModule,
    TooltipDirective,
    TableFilterSortTemplateComponent,
    TableComponent,
    TableCardFilterTemplateComponent,
    TableCardComponent,
    TableModule,
    ShowTooltipIfEllipsisDirective,
    ClickStopPropagationDirective,
    PushPipe,
  ],
  declarations: DECLERATIONS,
  exports     : DECLERATIONS
})
export class ModelSharedModule {
}
