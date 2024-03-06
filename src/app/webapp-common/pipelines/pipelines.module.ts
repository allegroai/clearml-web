import { InjectionToken, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PipelinesPageComponent } from "./pipelines-page/pipelines-page.component";
import { CommonProjectsModule } from "@common/projects/common-projects.module";
import { ActionReducer, StoreConfig, StoreModule } from "@ngrx/store";
import {
  projectsReducer,
  ProjectsState,
} from "~/features/projects/projects.reducer";
import { ProjectsSharedModule } from "~/features/projects/shared/projects-shared.module";
import { merge } from "lodash-es";
import { PipelinesRouterModule } from "@common/pipelines/pipelines.route";
import { PipelineCardComponent } from "@common/pipelines/pipeline-card/pipeline-card.component";
import { ButtonToggleComponent } from "@common/shared/ui-components/inputs/button-toggle/button-toggle.component";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatMenuModule } from "@angular/material/menu";
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatSidenavModule  } from "@angular/material/sidenav";
import { MatInputModule } from "@angular/material/input";
import { PipelineDialogComponent } from "./pipeline-dialog/pipeline-dialog.component";
import { CreateNewPipelineFormComponent } from "./pipeline-dialog/create-new-pipeline-form/create-new-pipeline-form.component";
import { PipelineSettingDialogComponent } from './pipeline-setting/pipeline-setting.dialog.component';
import { PipelineSettingFormComponent } from './pipeline-setting/pipeline-setting-form/pipeline-setting-form.component';
import { SimpleDatasetVersionPreviewComponent } from "@common/dataset-version/simple-dataset-version-preview/simple-dataset-version-preview.component";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { ScrollEndDirective } from "@common/shared/ui-components/directives/scroll-end.directive";
import { ClickStopPropagationDirective } from "@common/shared/ui-components/directives/click-stop-propagation.directive";
import { ShowTooltipIfEllipsisDirective } from "@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { TooltipDirective } from "@common/shared/ui-components/indicators/tooltip/tooltip.directive";
import { SearchTextDirective } from "@common/shared/ui-components/directives/searchText.directive";
import { SharedModule } from "~/shared/shared.module";
import { CommonLayoutModule } from "@common/layout/layout.module";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { ExistNameValidatorDirective } from "@common/shared/ui-components/template-forms-ui/exist-name-validator.directive";
import { UniqueNameValidatorDirective } from "@common/shared/ui-components/template-forms-ui/unique-name-validator.directive";
import { MarkdownEditorComponent } from "@common/shared/components/markdown-editor/markdown-editor.component";
import { SearchComponent } from "@common/shared/ui-components/inputs/search/search.component";
import { TagListComponent } from "@common/shared/ui-components/tags/tag-list/tag-list.component";
import { DialogTemplateComponent } from "@common/shared/ui-components/overlay/dialog-template/dialog-template.component";
import { ToggleArchiveComponent } from "@common/shared/ui-components/buttons/toggle-archive/toggle-archive.component";
import { LabeledFormFieldDirective } from "@common/shared/directive/labeled-form-field.directive";
import { EditPipelinePageComponent } from "./edit-pipeline-page/edit-pipeline-page.component";
import { EditPipelineHeaderComponent } from "./edit-pipeline-header/edit-pipeline-header.component";
import { ClearFiltersButtonComponent } from "@common/shared/components/clear-filters-button/clear-filters-button.component";
import { MenuComponent } from "@common/shared/ui-components/panel/menu/menu.component";
import { MenuItemComponent } from "@common/shared/ui-components/panel/menu-item/menu-item.component";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { RefreshButtonComponent } from "@common/shared/components/refresh-button/refresh-button.component";
import { ExperimentSharedModule } from "~/features/experiments/shared/experiment-shared.module";
import { EffectsModule } from "@ngrx/effects";
import { PipelinesEffects } from "./pipelines.effects";
import {
  PipelineState,
  pipelinesReducer,
  PIPELINES_KEY,
} from "./pipelines.reducer";
import { UserPreferences } from "@common/user-preferences";
import { createUserPrefFeatureReducer } from "@common/core/meta-reducers/user-pref-reducer";
import { PIPELINES_PREFIX } from "./pipelines.actions";
import { PipelineAddStepDialogComponent } from "./pipeline-add-step-dialog/pipeline-add-step-dialog.component";
import { PipelineAddStepFormComponent } from "./pipeline-add-step-dialog/pipeline-add-step-form/pipeline-add-step-form.component";
import { SortPipe } from "@common/shared/pipes/sort.pipe";
import { PipelineParametersComponent } from "./pipeline-parameters/pipeline-parameters.component";
import { FlowEditorComponent } from "./edit-pipeline-page/flow-editor.component";
import { PipelineStepInfoComponent } from "./edit-pipeline-page/pipeline-step-info/pipeline-step-info.component";
import { MatExpansionModule } from "@angular/material/expansion";
import { IdBadgeComponent } from "@common/shared/components/id-badge/id-badge.component";
import { FilterPipe } from "@common/shared/pipes/filter.pipe";
import { FileSizePipe } from "@common/shared/pipes/filesize.pipe";
import { RegexPipe } from "@common/shared/pipes/filter-regex.pipe";
import { FilterMonitorMetricPipe } from "@common/shared/pipes/filter-monitor-metric.pipe";
import { PipelineParametersDialogComponent } from "./pipeline-parameters-dialog/pipeline-parameters-dialog.component";
import { PipelineDetailsDrawerComponent } from './details-dialog/pipeline-details-drawer.component';

export const pipelinesSyncedKeys = ["projects.showPipelineExamples"];
const pipelinesSyncedKeys2 = ["orderBy", "sortOrder"];
// export const REPORTS_STORE_CONFIG_TOKEN =
//   new InjectionToken<StoreConfig<ReportsState, any>>('DatasetsConfigToken');

export const PIPELINES_CONFIG_TOKEN = new InjectionToken<
  StoreConfig<ProjectsState, any>
>("PipelineConfigToken");

export const PIPELINES_CONFIG_TOKEN_FOR_PIPELINE_SERVICE = new InjectionToken<
  StoreConfig<PipelineState, any>
>("PipelineConfigToken");

const localStorageKey = "_saved_pipeline_state_";

const getPipelineConfig = () => ({
  metaReducers: [
    (reducer) => {
      let onInit = true;
      return (state, action) => {
        const nextState = reducer(state, action);
        if (onInit) {
          onInit = false;
          const savedState = JSON.parse(localStorage.getItem(localStorageKey));
          return merge({}, nextState, savedState);
        }
        return nextState;
      };
    },
  ],
});

const getInitState = (userPreferences: UserPreferences) => ({
  metaReducers: [
    (reducer: ActionReducer<any>) =>
      createUserPrefFeatureReducer(
        PIPELINES_KEY,
        pipelinesSyncedKeys2,
        [PIPELINES_PREFIX],
        userPreferences,
        reducer
      ),
  ],
});

@NgModule({
  declarations: [
    PipelinesPageComponent,
    PipelineDialogComponent,
    PipelineAddStepDialogComponent,
    CreateNewPipelineFormComponent,
    PipelineAddStepFormComponent,
    EditPipelinePageComponent,
    EditPipelineHeaderComponent,
    PipelineParametersComponent,
    FlowEditorComponent,
    PipelineSettingDialogComponent,
    PipelineSettingFormComponent,
    PipelineStepInfoComponent,
    PipelineParametersDialogComponent,
    PipelineDetailsDrawerComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CommonProjectsModule,
    ProjectsSharedModule,
    PipelinesRouterModule,
    StoreModule.forFeature("projects", projectsReducer, PIPELINES_CONFIG_TOKEN),
    EffectsModule.forFeature([PipelinesEffects]),
    StoreModule.forFeature(
      PIPELINES_KEY,
      pipelinesReducer,
      PIPELINES_CONFIG_TOKEN_FOR_PIPELINE_SERVICE
    ),
    PipelineCardComponent,
    ButtonToggleComponent,
    SharedModule,
    CommonLayoutModule,
    ScrollingModule,
    ExistNameValidatorDirective,
    MatProgressSpinnerModule,
    LabeledFormFieldDirective,
    SearchTextDirective,
    UniqueNameValidatorDirective,
    MatTabsModule,
    MatIconModule,
    MatDialogModule,
    MatButtonToggleModule,
    MarkdownEditorComponent,
    SearchComponent,
    TagListComponent,
    DialogTemplateComponent,
    TooltipDirective,
    ButtonToggleComponent,
    ToggleArchiveComponent,
    MatMenuModule,
    MatSidenavModule,
    MatInputModule,
    MatAutocompleteModule,
    ScrollEndDirective,
    ClickStopPropagationDirective,
    ShowTooltipIfEllipsisDirective,
    ClearFiltersButtonComponent,
    MenuComponent,
    MenuItemComponent,
    ExperimentSharedModule,
    RefreshButtonComponent,
    LabeledFormFieldDirective,
    SortPipe,
    MatCheckboxModule,
    MatExpansionModule,
    IdBadgeComponent,
    FilterPipe,
    FileSizePipe,
    RegexPipe,
    FilterMonitorMetricPipe,
    SimpleDatasetVersionPreviewComponent,
  ],
  exports: [PipelinesPageComponent, EditPipelinePageComponent],
  providers: [
    { provide: PIPELINES_CONFIG_TOKEN, useFactory: getPipelineConfig },
    {
      provide: PIPELINES_CONFIG_TOKEN_FOR_PIPELINE_SERVICE,
      useFactory: getInitState,
      deps: [UserPreferences],
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { floatLabel: "always" },
    },
  ],
})
export class PipelinesModule {}
