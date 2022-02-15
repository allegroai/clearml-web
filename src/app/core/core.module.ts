import {HttpClientModule} from '@angular/common/http';
import {DEFAULT_CURRENCY_CODE, NgModule} from '@angular/core';
import {AUTH_PREFIX} from '@common/core/actions/common-auth.actions';
import {PROJECTS_PREFIX as ROOT_PROJECTS_PREFIX} from '@common/core/actions/projects.actions';
import {CommonAuthEffects} from '@common/core/effects/common-auth.effects';
import {LayoutEffects} from '@common/core/effects/layout.effects';
import {ProjectsEffects as CommonProjectsEffect} from '@common/core/effects/projects.effects';
import {RouterEffects} from '@common/core/effects/router.effects';
import {CommonUserEffects} from '@common/core/effects/users.effects';
import {createUserPrefReducer} from '@common/core/meta-reducers/user-pref-reducer';
import {messagesReducer} from '@common/core/reducers/messages-reducer';
import {projectsReducer} from '@common/core/reducers/projects.reducer';
import {routerReducer} from '@common/core/reducers/router-reducer';
import {SmSyncStateSelectorService} from '@common/core/services/sync-state-selector.service';
import {EXPERIMENTS_COMPARE_METRICS_CHARTS_} from '@common/experiments-compare/actions/experiments-compare-charts.actions';
import {compareSyncedKeys} from '@common/experiments-compare/experiments-compare.module';
import {EXPERIMENTS_OUTPUT_PREFIX} from '@common/experiments/actions/common-experiment-output.actions';
import {EXPERIMENTS_INFO_PREFIX} from '@common/experiments/actions/common-experiments-info.actions';
import {EXPERIMENTS_PREFIX} from '@common/experiments/actions/common-experiments-view.actions';
import {EXPERIMENTS_STORE_KEY} from '@common/experiments/shared/common-experiments.const';
import {MODELS_PREFIX_INFO, MODELS_PREFIX_MENU, MODELS_PREFIX_VIEW, MODELS_STORE_KEY} from '@common/models/models.consts';
import {modelSyncedKeys} from '@common/models/models.module';
import {PROJECTS_PREFIX} from '@common/projects/common-projects.consts';
import {CHOOSE_COLOR_PREFIX} from '@common/shared/ui-components/directives/choose-color/choose-color.actions';
import {colorSyncedKeys} from '@common/shared/ui-components/directives/choose-color/choose-color.module';
import {UserPreferences} from '@common/user-preferences';
import {EffectsModule} from '@ngrx/effects';
import {ActionReducer, MetaReducer, StoreModule, USER_PROVIDED_META_REDUCERS} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {merge, pick} from 'lodash/fp';
import {USERS_PREFIX, VIEW_PREFIX} from '~/app.constants';
import {ProjectsEffects} from '~/core/effects/projects.effects';
import {experimentSyncedKeys} from '~/features/experiments/experiments.module';
import {loginReducer} from '~/features/login/login.reducer';
import {projectSyncedKeys} from '~/features/projects/projects.module';
import {authReducer} from '~/features/settings/containers/admin/auth.reducers';
import {AdminService} from '~/shared/services/admin.service';
import {UserEffects} from './effects/users.effects';
import {recentTasksReducer} from './reducers/recent-tasks-reducer';
import {sourcesReducer} from './reducers/sources-reducer';
import {usageStatsReducer} from './reducers/usage-stats.reducer';
import {usersReducer} from './reducers/users.reducer';
import {viewReducer} from './reducers/view.reducer';
import {UsageStatsService} from './services/usage-stats.service';

export const reducers = {
  auth: authReducer,
  router: routerReducer,
  messages: messagesReducer,
  recentTasks: recentTasksReducer,
  views: viewReducer,
  sources: sourcesReducer,
  users: usersReducer,
  login: loginReducer,
  rootProjects: projectsReducer,
  userStats: usageStatsReducer
};

const syncedKeys = [
  'auth.S3BucketCredentials',
  'datasets.selectedVersion',
  'datasets.selected',
  'projects.selectedProjectId',
  'projects.selectedProject',
  'views.availableUpdates',
  'views.showSurvey',
  'views.neverShowPopupAgain'
];
const key = '_saved_state_';

const actionsPrefix = [AUTH_PREFIX, USERS_PREFIX, VIEW_PREFIX, ROOT_PROJECTS_PREFIX];

if (!localStorage.getItem(key)) {
  localStorage.setItem(key, '{}');
}

export const localStorageReducer = (reducer: ActionReducer<any>): ActionReducer<any> =>
  (state, action) => {
    let nextState = reducer(state, action);
    // TODO: lil hack to fix ngrx bug in preload strategy that dispatch store/init multiple times.
    if (action.type === '@ngrx/store/init') {
      const savedState = JSON.parse(localStorage.getItem(key));
      nextState = merge(nextState, savedState);
   }

    if (state === nextState) {
      return nextState;
   }

    if (actionsPrefix && !actionsPrefix.some(ap => action.type.startsWith(ap))) {
      return nextState;
   }

    localStorage.setItem(key, JSON.stringify(pick(syncedKeys, nextState)));

    return nextState;
 };

const userPrefMetaFactory = (userPreferences: UserPreferences): MetaReducer<any>[] => [
  (reducer: ActionReducer<any>) =>
    createUserPrefReducer('users', ['activeWorkspace'], [USERS_PREFIX], userPreferences, reducer),
  (reducer: ActionReducer<any>) =>
    createUserPrefReducer('rootProjects', ['tagsColors', 'graphVariant'], [ROOT_PROJECTS_PREFIX], userPreferences, reducer),
  (reducer: ActionReducer<any>) =>
    createUserPrefReducer('views', ['autoRefresh', 'neverShowPopupAgain'], [VIEW_PREFIX], userPreferences, reducer),
  localStorageReducer,
  (reducer: ActionReducer<any>) =>
    createUserPrefReducer('projects', projectSyncedKeys, [PROJECTS_PREFIX], userPreferences, reducer),
  (reducer: ActionReducer<any>) =>
    createUserPrefReducer(EXPERIMENTS_STORE_KEY, experimentSyncedKeys, [EXPERIMENTS_PREFIX, EXPERIMENTS_INFO_PREFIX, EXPERIMENTS_OUTPUT_PREFIX], userPreferences, reducer),
  (reducer: ActionReducer<any>) =>
    createUserPrefReducer(MODELS_STORE_KEY, modelSyncedKeys, [MODELS_PREFIX_INFO, MODELS_PREFIX_MENU, MODELS_PREFIX_VIEW], userPreferences, reducer),
  (reducer: ActionReducer<any>) =>
    createUserPrefReducer('compare-experiments', compareSyncedKeys, [EXPERIMENTS_COMPARE_METRICS_CHARTS_], userPreferences, reducer),
  (reducer: ActionReducer<any>) =>
    createUserPrefReducer('colorsPreference', colorSyncedKeys, [CHOOSE_COLOR_PREFIX], userPreferences, reducer)
];

@NgModule({
  imports: [
    StoreModule.forRoot(reducers, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictStateSerializability: true,
        strictActionSerializability: true
      }
    }),
    EffectsModule.forRoot([
      CommonAuthEffects,
      LayoutEffects,
      CommonUserEffects,
      UserEffects,
      RouterEffects,
      CommonProjectsEffect,
      ProjectsEffects
    ]),
    StoreDevtoolsModule.instrument({
      maxAge: 25 //  Retains last 25 states
    }),
    HttpClientModule,
  ],
  providers: [
    SmSyncStateSelectorService,
    UsageStatsService,
    AdminService,
    {
      provide: USER_PROVIDED_META_REDUCERS,
      deps: [UserPreferences],
      useFactory: userPrefMetaFactory
    },
    {provide: DEFAULT_CURRENCY_CODE, useValue: 'USD'},
  ],
  declarations: [],
  exports: []
})
export class SMCoreModule {
}
