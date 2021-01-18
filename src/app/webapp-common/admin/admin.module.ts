import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SMSharedModule } from '../shared/shared.module';
import { AdminComponent } from './admin.component';
import { AdminService } from '../../features/admin/admin.service';
import {AdminCredentialTableComponent} from './admin-credential-table/admin-credential-table.component';
import { AdminDialogTemplateComponent } from './admin-dialog-template/admin-dialog-template.component';
import {ReactiveFormsModule} from '@angular/forms';
import { S3AccessComponent } from './s3-access/s3-access.component';
import {CreateCredentialDialogComponent} from './create-credential-dialog/create-credential-dialog.component';
import {SharedModule} from '../../shared/shared.module';
import { UsageStatsComponent } from '../../features/admin/usage-stats/usage-stats.component';
import {MatExpansionModule} from '@angular/material/expansion';

@NgModule({
  imports: [CommonModule, SMSharedModule, ReactiveFormsModule, SharedModule, MatExpansionModule],
  declarations   : [
    AdminComponent, AdminCredentialTableComponent, AdminDialogTemplateComponent,
    S3AccessComponent, CreateCredentialDialogComponent, UsageStatsComponent
  ],
  providers      : [AdminService],
  exports        : []
})
export class AdminModule { }
