import {InjectionToken, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PipelinesPageComponent} from './pipelines-page/pipelines-page.component';
import {CommonProjectsModule} from '@common/projects/common-projects.module';
import {StoreConfig, StoreModule} from '@ngrx/store';
import {projectsReducer, ProjectsState} from '~/features/projects/projects.reducer';
import {ProjectsSharedModule} from '~/features/projects/shared/projects-shared.module';
import {merge} from 'lodash-es';
import {PipelinesRouterModule} from '@common/pipelines/pipelines.route';
import {PipelineCardComponent} from '@common/pipelines/pipeline-card/pipeline-card.component';
import {ButtonToggleComponent} from '@common/shared/ui-components/inputs/button-toggle/button-toggle.component';
import { EditPipelineComponent } from './edit-pipeline/edit-pipeline.component';
import { EditPipelineHeaderComponent } from './edit-pipeline-header/edit-pipeline-header.component';
import {ClearFiltersButtonComponent} from '@common/shared/components/clear-filters-button/clear-filters-button.component';
import {MenuComponent} from '@common/shared/ui-components/panel/menu/menu.component';
import {MenuItemComponent} from '@common/shared/ui-components/panel/menu-item/menu-item.component';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
// import { ExperimentCustomColsMenuComponent } from '@common/experiments/dumb/experiment-custom-cols-menu/experiment-custom-cols-menu.component';
import { RefreshButtonComponent } from '@common/shared/components/refresh-button/refresh-button.component';
import { ExperimentSharedModule } from '~/features/experiments/shared/experiment-shared.module';
import { LabeledFormFieldDirective } from "../shared/directive/labeled-form-field.directive";


export const pipelinesSyncedKeys = [
  'projects.showPipelineExamples',
];

export const PIPELINES_CONFIG_TOKEN =
  new InjectionToken<StoreConfig<ProjectsState , any>>('PipelineConfigToken');


const localStorageKey = '_saved_pipeline_state_';

const getPipelineConfig = () => ({
  metaReducers: [reducer => {
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
  }]
});



@NgModule({
    declarations: [
        PipelinesPageComponent,
        EditPipelineComponent,
        EditPipelineHeaderComponent,
    ],
    exports: [PipelinesPageComponent, EditPipelineComponent],
    providers: [
        { provide: PIPELINES_CONFIG_TOKEN, useFactory: getPipelineConfig },
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { floatLabel: 'always' } },
    ],
    imports: [
        CommonModule,
        CommonProjectsModule,
        ProjectsSharedModule,
        PipelinesRouterModule,
        StoreModule.forFeature('projects', projectsReducer, PIPELINES_CONFIG_TOKEN),
        PipelineCardComponent,
        ButtonToggleComponent,
        ClearFiltersButtonComponent,
        MenuComponent,
        MenuItemComponent,
        ExperimentSharedModule,
        RefreshButtonComponent,
        LabeledFormFieldDirective
    ]
})
export class PipelinesModule { }
