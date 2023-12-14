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
import {projectsReducer, RootProjects} from '@common/core/reducers/projects.reducer';
import {routerReducer} from '@common/core/reducers/router-reducer';
import {SmSyncStateSelectorService} from '@common/core/services/sync-state-selector.service';
import {
  EXPERIMENTS_COMPARE_METRICS_CHARTS_
} from '@common/experiments-compare/actions/experiments-compare-charts.actions';
import {compareSyncedKeys} from '@common/experiments-compare/experiments-compare.module';
import {PROJECTS_PREFIX} from '@common/projects/common-projects.consts';
import {CHOOSE_COLOR_PREFIX} from '@common/shared/ui-components/directives/choose-color/choose-color.actions';
import {colorSyncedKeys} from '@common/shared/ui-components/directives/choose-color/choose-color.module';
import {UserPreferences} from '@common/user-preferences';
import {EffectsModule} from '@ngrx/effects';
import {ActionReducer, MetaReducer, StoreModule, USER_PROVIDED_META_REDUCERS} from '@ngrx/store';
import {merge, pick} from 'lodash-es';
import {USERS_PREFIX, VIEW_PREFIX} from '~/app.constants';
import {ProjectsEffects} from '~/core/effects/projects.effects';
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
import {extCoreModules} from '~/build-specifics';
import {ReportCodeEmbedService} from '../shared/services/report-code-embed.service';

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
  'auth.s3BucketCredentials',
  'datasets.selectedVersion',
  'datasets.selected',
  'projects.selectedProjectId',
  'projects.selectedProject',
  'rootProjects.showHidden',
  'rootProjects.hideExamples',
  'rootProjects.defaultNestedModeForFeature',
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
      nextState = merge({}, nextState, savedState);
    }
    if (state === nextState) {
      return nextState;
    }
    if (actionsPrefix && !actionsPrefix.some(ap => action.type.startsWith(ap))) {
      return nextState;
    }
    localStorage.setItem(key, JSON.stringify(pick(nextState, syncedKeys )));
    return nextState;
  };

const userPrefMetaFactory = (userPreferences: UserPreferences): MetaReducer<any>[] => [
  (reducer: ActionReducer<any>) =>
    createUserPrefReducer('users', ['activeWorkspace', 'showOnlyUserWork'], [USERS_PREFIX], userPreferences, reducer),
  (reducer: ActionReducer<any>) =>
    createUserPrefReducer('rootProjects', ['tagsColors', 'graphVariant', 'showHidden', 'hideExamples', 'defaultNestedModeForFeature'], [ROOT_PROJECTS_PREFIX], userPreferences, reducer),
  (reducer: ActionReducer<any>) =>
    createUserPrefReducer('views', ['autoRefresh', 'neverShowPopupAgain', 'redactedArguments', 'hideRedactedArguments'], [VIEW_PREFIX], userPreferences, reducer),
  localStorageReducer,
  (reducer: ActionReducer<any>) =>
    createUserPrefReducer('projects', projectSyncedKeys, [PROJECTS_PREFIX], userPreferences, reducer),
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
      CommonUserEffects,
      LayoutEffects,
      RouterEffects,
      CommonProjectsEffect,
      ProjectsEffects,
      UserEffects,
    ]),
    HttpClientModule,
    ...extCoreModules
  ],
  providers: [
    SmSyncStateSelectorService,
    UsageStatsService,
    AdminService,
    ReportCodeEmbedService,
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
