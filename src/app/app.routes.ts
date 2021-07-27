import {Routes} from '@angular/router';
import {AdminComponent} from './webapp-common/admin/admin.component';
import {AccountAdministrationGuard} from "./webapp-common/shared/guards/account-administration.guard";
import {ProjectRedirectGuardGuard} from './webapp-common/shared/guards/project-redirect.guard';


export const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {path: 'admin', redirectTo: 'profile', pathMatch: 'full'},
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    data: {search: true},
  },
  {
    path: 'projects',
    loadChildren: () => import('./features/projects/projects.module').then(m => m.ProjectsModule),
    data: {search: true},
  },
  {path: 'login', loadChildren: () => import('./webapp-common/login/login.module').then(m => m.LoginModule)},
  {path: 'signup', loadChildren: () => import('./webapp-common/login/login.module').then(m => m.LoginModule)},

  {path: 'profile', component: AdminComponent, data: {workspaceNeutral: true}},

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
            data: {search: false}
          },
        ]
      },
    ]
  },
  {path: 'workers-and-queues', loadChildren: () => import('./webapp-common/workers-and-queues/workers-and-queues.module').then(m => m.WorkersAndQueuesModule)},
  {path: '404', loadChildren: () => import('./features/not-found/not-found.module').then(m => m.NotFoundModule)},
  {path: '**', loadChildren: () => import('./features/not-found/not-found.module').then(m => m.NotFoundModule)},

];
