import {InjectionToken, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PipelinesPageComponent} from './pipelines-page/pipelines-page.component';
import {UiComponentsModule} from '@common/shared/ui-components/ui-components.module';
import {SMSharedModule} from '@common/shared/shared.module';
import {CommonProjectsModule} from '@common/projects/common-projects.module';
import {StoreConfig, StoreModule} from '@ngrx/store';
import {ProjectsState, projectsReducer} from '~/features/projects/projects.reducer';
import {RouterModule, Routes} from '@angular/router';
import {ProjectsSharedModule} from '~/features/projects/shared/projects-shared.module';
import {merge} from 'lodash/fp';
import {PipelinesRouterModule} from '@common/pipelines/pipelines.route';

export const routes: Routes = [
  { path: '', component: PipelinesPageComponent }
];

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
        return merge(nextState, savedState);
      }
      return nextState;
    };
  }]
});



@NgModule({
  declarations: [
    PipelinesPageComponent,
  ],
  imports: [
    CommonModule,
    UiComponentsModule,
    SMSharedModule,
    CommonProjectsModule,
    ProjectsSharedModule,
    StoreModule.forFeature('projects', projectsReducer, PIPELINES_CONFIG_TOKEN),
    RouterModule.forChild(routes)
  ],
  exports: [PipelinesRouterModule, PipelinesPageComponent],
  providers: [
    {provide: PIPELINES_CONFIG_TOKEN, useFactory: getPipelineConfig},
  ]
})
export class PipelinesModule { }
