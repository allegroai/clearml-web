import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExperimentSharedModule} from './shared/experiment-shared.module';
import {ExperimentRouterModule} from './experiments-routing.module';
import {AdminService} from '~/shared/services/admin.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SelectModelModule} from '@common/select-model/select-model.module';
import {SmSyncStateSelectorService} from '@common/core/services/sync-state-selector.service';
import {LayoutModule} from '~/layout/layout.module';
import {ExperimentGraphsModule} from '@common/shared/experiment-graphs/experiment-graphs.module';
import {ExperimentCompareSharedModule} from '@common/experiments-compare/shared/experiment-compare-shared.module';
import {AngularSplitModule} from 'angular-split';
import {CommonLayoutModule} from '@common/layout/layout.module';
import {DebugImagesModule} from '@common/debug-images/debug-images.module';
import {ExperimentInfoExecutionComponent} from '@common/experiments/containers/experiment-info-execution/experiment-info-execution.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {ExperimentOutputComponent} from './containers/experiment-ouptut/experiment-output.component';
import {ExperimentInfoNavbarComponent} from './containers/experiment-info-navbar/experiment-info-navbar.component';
import {ExperimentInfoHyperParametersComponent} from '@common/experiments/containers/experiment-info-hyper-parameters/experiment-info-hyper-parameters.component';
import {ExperimentInfoArtifactItemComponent} from '@common/experiments/containers/experiment-info-artifact-item/experiment-info-artifact-item.component';
import {ExperimentGeneralInfoComponent} from '@common/experiments/dumb/experiment-general-info/experiment-general-info.component';
import {ExperimentArtifactItemViewComponent} from '@common/experiments/dumb/experiment-artifact-item-view/experiment-artifact-item-view.component';
import {ExperimentHyperParamsNavbarComponent} from '@common/experiments/dumb/experiment-hyper-params-navbar/experiment-hyper-params-navbar.component';
import {ExperimentExecutionSourceCodeComponent} from '@common/experiments/dumb/experiment-execution-source-code/experiment-execution-source-code.component';
import {ExperimentInfoEditDescriptionComponent} from '@common/experiments/dumb/experiment-info-edit-description/experiment-info-edit-description.component';
import {ExperimentOutputModelViewComponent} from '@common/experiments/dumb/experiment-output-model-view/experiment-output-model-view.component';
import {ExperimentInfoGeneralComponent} from '@common/experiments/containers/experiment-info-general/experiment-info-general.component';
import {BaseClickableArtifactComponent} from '@common/experiments/dumb/base-clickable-artifact.component';
import {ExperimentModelsFormViewComponent} from '@common/experiments/dumb/experiment-models-form-view/experiment-models-form-view.component';
import {ExperimentArtifactsNavbarComponent} from '@common/experiments/dumb/experiment-artifacts-navbar/experiment-artifacts-navbar.component';
import {ExperimentInfoArtifactsComponent} from '@common/experiments/containers/experiment-info-aritfacts/experiment-info-artifacts.component';
import {ExperimentInfoHeaderComponent} from '@common/experiments/dumb/experiment-info-header/experiment-info-header.component';
import {ExperimentInfoTaskModelComponent} from '@common/experiments/containers/experiment-info-task-model/experiment-info-task-model.component';
import {ExperimentOutputScalarsComponent} from '@common/experiments/containers/experiment-output-scalars/experiment-output-scalars.component';
import {ExperimentInfoModelComponent} from '@common/experiments/containers/experiment-info-model/experiment-info-model.component';
import {ExperimentInfoHyperParametersFormContainerComponent} from '@common/experiments/containers/experiment-info-hyper-parameters-form-container/experiment-info-hyper-parameters-form-container.component';
import {ExperimentOutputLogModule} from '@common/experiments/shared/experiment-output-log/experiment-output-log.module';
import {RouterModule} from '@angular/router';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CommonDeleteDialogModule} from '@common/shared/entity-page/entity-delete/common-delete-dialog.module';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {SharedModule} from '~/shared/shared.module';
import {MAT_AUTOCOMPLETE_SCROLL_STRATEGY} from '@angular/material/autocomplete';
import {scrollFactory} from '@common/shared/utils/scroll-factory';
import {Overlay} from '@angular/cdk/overlay';
import {ExperimentsComponent} from '@common/experiments/experiments.component';
import {RouterTabNavBarComponent} from '@common/shared/components/router-tab-nav-bar/router-tab-nav-bar.component';
import {MatTabsModule} from '@angular/material/tabs';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import {OverlayComponent} from '@common/shared/ui-components/overlay/overlay/overlay.component';
import {RefreshButtonComponent} from '@common/shared/components/refresh-button/refresh-button.component';
import {InfoHeaderStatusIconLabelComponent} from '@common/shared/experiment-info-header-status-icon-label/info-header-status-icon-label.component';
import {NAPipe} from '@common/shared/pipes/na.pipe';
import {SortPipe} from '@common/shared/pipes/sort.pipe';
import {safeAngularUrlParameterPipe} from '@common/shared/pipes/safeAngularUrlParameter.pipe';
import {ReplaceViaMapPipe} from '@common/shared/pipes/replaceViaMap';
import {FilterOutPipe} from '@common/shared/pipes/filterOut.pipe';
import {DurationPipe} from '@common/shared/pipes/duration.pipe';
import {FilterInternalPipe} from '@common/shared/pipes/filter-internal.pipe';
import {FileSizePipe} from '@common/shared/pipes/filesize.pipe';
import {HideRedactedArgumentsPipe} from '@common/shared/pipes/hide-redacted-arguments.pipe';
import {MenuItemComponent} from '@common/shared/ui-components/panel/menu-item/menu-item.component';
import {CopyClipboardComponent} from '@common/shared/ui-components/indicators/copy-clipboard/copy-clipboard.component';
import {SectionHeaderComponent} from '@common/shared/components/section-header/section-header.component';
import {InlineEditComponent} from '@common/shared/ui-components/inputs/inline-edit/inline-edit.component';
import {TagsMenuComponent} from '@common/shared/ui-components/tags/tags-menu/tags-menu.component';
import {EntityFooterComponent} from '@common/shared/entity-page/entity-footer/entity-footer.component';
import {MenuComponent} from '@common/shared/ui-components/panel/menu/menu.component';
import {
  ExperimentTypeIconLabelComponent
} from '@common/shared/experiment-type-icon-label/experiment-type-icon-label.component';
import {SearchComponent} from '@common/shared/ui-components/inputs/search/search.component';
import {IdBadgeComponent} from '@common/shared/components/id-badge/id-badge.component';
import {ScrollTextareaComponent} from '@common/shared/components/scroll-textarea/scroll-textarea.component';
import {TagListComponent} from '@common/shared/ui-components/tags/tag-list/tag-list.component';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {LabeledRowComponent} from '@common/shared/ui-components/data/labeled-row/labeled-row.component';
import {
  SelectableGroupedFilterListComponent
} from '@common/shared/ui-components/data/selectable-grouped-filter-list/selectable-grouped-filter-list.component';
import {EditableSectionComponent} from '@common/shared/ui-components/panel/editable-section/editable-section.component';
import {MatMenuModule} from '@angular/material/menu';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {HesitateDirective} from '@common/shared/ui-components/directives/hesitate.directive';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';
import {MatButtonModule} from '@angular/material/button';


@NgModule({
  imports: [
    FormsModule,
    LayoutModule,
    ReactiveFormsModule,
    CommonModule,
    ExperimentRouterModule,
    ExperimentSharedModule,
    ExperimentGraphsModule,
    SelectModelModule,
    DebugImagesModule,
    ExperimentCompareSharedModule,
    CommonLayoutModule,
    MatSidenavModule,
    MatListModule,
    AngularSplitModule,
    ScrollingModule,
    CommonDeleteDialogModule,
    RouterModule,
    SharedModule,
    ExperimentOutputLogModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    RouterTabNavBarComponent,
    MatTabsModule,
    RouterTabNavBarComponent,
    LabeledFormFieldDirective,
    OverlayComponent,
    RefreshButtonComponent,
    InfoHeaderStatusIconLabelComponent,
    NAPipe,
    SortPipe,
    safeAngularUrlParameterPipe,
    ReplaceViaMapPipe,
    FilterOutPipe,
    DurationPipe,
    FilterInternalPipe,
    FileSizePipe,
    HideRedactedArgumentsPipe,
    MenuItemComponent,
    CopyClipboardComponent,
    SectionHeaderComponent,
    InlineEditComponent,
    TagsMenuComponent,
    EntityFooterComponent,
    MenuComponent,
    ExperimentTypeIconLabelComponent,
    SearchComponent,
    IdBadgeComponent,
    ScrollTextareaComponent,
    TagListComponent,
    TooltipDirective,
    LabeledRowComponent,
    EditableSectionComponent,
    SelectableGroupedFilterListComponent,
    MatMenuModule,
    MatExpansionModule,
    MatInputModule,
    MatSelectModule,
    HesitateDirective,
    ShowTooltipIfEllipsisDirective,
    MatButtonModule
  ],
  declarations: [
    ExperimentsComponent,
    ExperimentInfoExecutionComponent,
    ExperimentOutputComponent,
    ExperimentInfoNavbarComponent,
    ExperimentInfoNavbarComponent,
    BaseClickableArtifactComponent,
    ExperimentInfoHeaderComponent,
    ExperimentInfoModelComponent,
    ExperimentInfoTaskModelComponent,
    ExperimentInfoGeneralComponent,
    ExperimentGeneralInfoComponent,
    ExperimentModelsFormViewComponent,
    ExperimentOutputModelViewComponent,
    ExperimentExecutionSourceCodeComponent,
    ExperimentOutputScalarsComponent,
    ExperimentInfoHyperParametersComponent,
    ExperimentInfoHyperParametersFormContainerComponent,
    ExperimentArtifactsNavbarComponent,
    ExperimentInfoArtifactsComponent,
    ExperimentHyperParamsNavbarComponent,
    ExperimentInfoArtifactItemComponent,
    ExperimentArtifactItemViewComponent,
    ExperimentInfoEditDescriptionComponent,
  ],
  exports: [
    ExperimentsComponent,
    ExperimentInfoHeaderComponent,
    ExperimentExecutionSourceCodeComponent,
  ],
  providers: [
    AdminService,
    SmSyncStateSelectorService,
    {provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY, useFactory: scrollFactory, deps: [Overlay]},
  ]
})
export class ExperimentsModule {
}
