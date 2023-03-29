import {InjectionToken, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NestedProjectViewPageComponent} from './nested-project-view-page/nested-project-view-page.component';
import {UiComponentsModule} from '@common/shared/ui-components/ui-components.module';
import {SMSharedModule} from '@common/shared/shared.module';
import {CommonProjectsModule} from '@common/projects/common-projects.module';
import {StoreConfig, StoreModule} from '@ngrx/store';
import {projectsReducer, ProjectsState} from '~/features/projects/projects.reducer';
import {ProjectsSharedModule} from '~/features/projects/shared/projects-shared.module';
import {merge} from 'lodash-es';
import {NestedProjectViewRouterModule} from '@common/nested-project-view/nested-project-view.route';


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
    NestedProjectViewPageComponent,
  ],
  imports: [
    CommonModule,
    UiComponentsModule,
    SMSharedModule,
    CommonProjectsModule,
    ProjectsSharedModule,
    NestedProjectViewRouterModule,
    StoreModule.forFeature('nestedProjectView', projectsReducer, PIPELINES_CONFIG_TOKEN),
  ],
  exports: [NestedProjectViewPageComponent],
  providers: [
    {provide: PIPELINES_CONFIG_TOKEN, useFactory: getPipelineConfig},
  ]
})
export class NestedProjectViewModule { }
