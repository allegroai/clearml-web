import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProfileNameComponent} from '../../webapp-common/settings/admin/profile-name/profile-name.component';
import {WebappConfigurationComponent} from '../../webapp-common/settings/webapp-configuration/webapp-configuration.component';
import {WorkspaceConfigurationComponent} from '../../webapp-common/settings/workspace-configuration/workspace-configuration.component';
import {SettingsComponent} from './settings.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full'
      },
      {path: 'profile',
        component: ProfileNameComponent,
      },
      {
        path: 'webapp-configuration',
        component: WebappConfigurationComponent,
      },
      {
        path: 'workspace-configuration',
        component: WorkspaceConfigurationComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }

