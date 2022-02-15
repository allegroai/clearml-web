import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from '../settings/settings.component';
import {SMMaterialModule} from '../../webapp-common/shared/material/material.module';
import {SMSharedModule} from '@common/shared/shared.module';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '~/shared/shared.module';
import {MatExpansionModule} from '@angular/material/expansion';
import {WebappConfigurationComponent} from '@common/settings/webapp-configuration/webapp-configuration.component';
import {WorkspaceConfigurationComponent} from '@common/settings/workspace-configuration/workspace-configuration.component';
import {ProfileKeyStorageComponent} from '@common/settings/admin/profile-key-storage/profile-key-storage.component';
import {ProfilePreferencesComponent} from '@common/settings/admin/profile-preferences/profile-preferences.component';
import {ProfileNameComponent} from '@common/settings/admin/profile-name/profile-name.component';
import {AdminFooterComponent} from '@common/settings/admin/admin-footer/admin-footer.component';
import {S3AccessComponent} from '@common/settings/admin/s3-access/s3-access.component';
import {AdminDialogTemplateComponent} from '@common/settings/admin/admin-dialog-template/admin-dialog-template.component';
import {AdminCredentialTableComponent} from '@common/settings/admin/admin-credential-table/admin-credential-table.component';
import {AdminFooterActionsComponent} from '~/features/settings/containers/admin/admin-footer-actions/admin-footer-actions.component';
import {UserCredentialsComponent} from '~/features/settings/containers/admin/user-credentials/user-credentials.component';
import {UserDataComponent} from '~/features/settings/containers/admin/user-data/user-data.component';
import {UsageStatsComponent} from '~/features/settings/containers/admin/usage-stats/usage-stats.component';
import {CreateCredentialDialogComponent} from '~/features/settings/containers/admin/create-credential-dialog/create-credential-dialog.component';



@NgModule({
  declarations: [
    SettingsComponent,
    UsageStatsComponent,
    UserDataComponent,
    UserCredentialsComponent,
    AdminFooterActionsComponent,
    AdminCredentialTableComponent,
    AdminDialogTemplateComponent,
    S3AccessComponent,
    CreateCredentialDialogComponent,
    AdminFooterComponent,
    ProfileNameComponent,
    ProfilePreferencesComponent,
    ProfileKeyStorageComponent,
    WorkspaceConfigurationComponent,
    WebappConfigurationComponent,
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    SMMaterialModule,
    SMSharedModule,
    ReactiveFormsModule, SharedModule, MatExpansionModule,
  ],
  exports: [
    UserCredentialsComponent,
    AdminFooterComponent,
    ProfilePreferencesComponent,
    ProfileNameComponent,
    WebappConfigurationComponent,
  ]
})
export class SettingsModule { }
