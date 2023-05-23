import {Routes} from '@angular/router';
import {ProjectRedirectGuardGuard} from '@common/shared/guards/project-redirect.guard';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';


export const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    data: {search: true, userFocus: true},
  },
  {
    path: 'projects',
    loadChildren: () => import('./features/projects/projects.module').then(m => m.ProjectsModule),
    data: {search: true},
  },
  {path: 'login', loadChildren: () => import('./features/login/login.module').then(m => m.LoginModule)},
  {
    path: 'settings',
    loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule),
    data: {search: false, workspaceNeutral: false, },
  },

  {
    path: 'projects',
    data: {search: true},
    children: [
      {path: '', redirectTo: '*', pathMatch: 'full'},
      {
        path: ':projectId',
        data: {search: true},
        children: [
          {path: '', pathMatch: 'full', children: [], canActivate: [ProjectRedirectGuardGuard]},
          {path: '', redirectTo: '*', pathMatch: 'full'},
          {path: 'overview', loadChildren: () => import('./webapp-common/project-info/project-info.module').then(m => m.ProjectInfoModule)},
          {path: 'projects', loadChildren: () => import('./features/projects/projects.module').then(m => m.ProjectsModule)},
          {path: 'experiments', loadChildren: () => import('./features/experiments/experiments.module').then(m => m.ExperimentsModule)},
          {path: 'models', loadChildren: () => import('./webapp-common/models/models.module').then(m => m.ModelsModule)},
          {
            path: 'compare-experiments',
            loadChildren: () => import('./webapp-common/experiments-compare/experiments-compare.module').then(m => m.ExperimentsCompareModule),
            data: {entityType: EntityTypeEnum.experiment},
          },
          {
            path: 'compare-models',
            data: {entityType: EntityTypeEnum.model},
            loadChildren: () => import('./webapp-common/experiments-compare/experiments-compare.module').then(m => m.ExperimentsCompareModule)
          },
        ]
      },
    ]
  },
  {
    path: 'pipelines',
    // canActivate: [RolePermissionsGuard],
    data: {search: true},
    loadChildren: () => import('@common/pipelines/pipelines.module').then(m => m.PipelinesModule),
  },
  {
    path: 'pipelines',
    // canActivate: [RolePermissionsGuard],
    data: {search: true},
    children: [
      {
        path: ':projectId',
        children: [
          {path: 'pipelines',  loadChildren: () => import('@common/pipelines/pipelines.module').then(m => m.PipelinesModule)},
          {path: 'projects',  loadChildren: () => import('@common/nested-project-view/nested-project-view.module').then(m => m.NestedProjectViewModule)},
          {
            path: 'experiments', loadChildren: () => import('@common/pipelines-controller/pipelines-controller.module').then(m => m.PipelinesControllerModule)
          },
          {
            path: 'compare-experiments',
            data: {entityType: EntityTypeEnum.controller},
            loadChildren: () => import('./webapp-common/experiments-compare/experiments-compare.module').then(m => m.ExperimentsCompareModule)
          },
        ]
      },
    ]
  },
  {
    path: 'datasets',
    data: {search: true},
    loadChildren: () => import('./features/datasets/datasets.module').then(m => m.DatasetsModule)
  },
  {
    path: 'reports',
    loadChildren: () => import('./webapp-common/reports/reports.module').then(m => m.ReportsModule)
  },
  {path: 'workers-and-queues', loadChildren: () => import('./features/workers-and-queues/workers-and-queues.module').then(m => m.WorkersAndQueuesModule)},
  {path: '404', loadChildren: () => import('./features/not-found/not-found.module').then(m => m.NotFoundModule)},
  {path: '**', loadChildren: () => import('./features/not-found/not-found.module').then(m => m.NotFoundModule)},

];
