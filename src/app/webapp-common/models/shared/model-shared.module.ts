import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ModelsTableComponent} from './models-table/models-table.component';
import {LayoutModule} from '~/layout/layout.module';
import {SelectModelHeaderComponent} from './select-model-header/select-model-header.component';
import {FeatureModelsModule} from '~/features/models/feature-models.module';
import {HyperParamMetricColumnComponent} from '@common/experiments/shared/components/hyper-param-metric-column/hyper-param-metric-column.component';
import {FilterPipe} from '@common/shared/pipes/filter.pipe';
import {NoUnderscorePipe} from '@common/shared/pipes/no-underscore.pipe';
import {TimeAgoPipe} from '@common/shared/pipes/timeAgo';
import {ColGetterPipe} from '@common/shared/pipes/col-getter.pipe';
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
  TableFilterSortComponent
} from '@common/shared/ui-components/data/table/table-filter-sort/table-filter-sort.component';
import {TableComponent} from '@common/shared/ui-components/data/table/table.component';
import {
  TableCardFilterComponent
} from '@common/shared/ui-components/data/table/table-card-filter-template/table-card-filter.component';
import {TableCardComponent} from '@common/shared/ui-components/data/table-card/table-card.component';
import {TableModule} from 'primeng/table';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {PushPipe} from '@ngrx/component';
import {IsRowSelectedPipe} from '@common/shared/ui-components/data/table/is-rwo-selected.pipe';
import {MatCheckbox} from '@angular/material/checkbox';
import {ReactiveFormsModule} from '@angular/forms';
import {
  MiniTagsListComponent
} from '@common/shared/ui-components/tags/user-tag/mini-tags-list/mini-tags-list.component';



const DECLERATIONS = [SelectModelHeaderComponent, ModelsTableComponent];

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
    StatusIconLabelComponent,
    SearchComponent,
    ClearFiltersButtonComponent,
    MatSlideToggleModule,
    TagListComponent,
    TagComponent,
    MatMenuModule,
    TooltipDirective,
    TableFilterSortComponent,
    TableComponent,
    TableCardFilterComponent,
    TableCardComponent,
    TableModule,
    ShowTooltipIfEllipsisDirective,
    ClickStopPropagationDirective,
    PushPipe,
    IsRowSelectedPipe,
    MatCheckbox,
    ReactiveFormsModule,
    MiniTagsListComponent
  ],
  declarations: DECLERATIONS,
  exports     : DECLERATIONS
})
export class ModelSharedModule {
}
