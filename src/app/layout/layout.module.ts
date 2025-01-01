import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {SideNavComponent} from './side-nav/side-nav.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {SharedModule} from '~/shared/shared.module';
import {CheckPermissionDirective} from '~/shared/directives/check-permission.directive';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {MatMenuModule} from '@angular/material/menu';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {DialogTemplateComponent} from '@common/shared/ui-components/overlay/dialog-template/dialog-template.component';
import {ClipboardModule} from 'ngx-clipboard';

@NgModule({
  declarations: [SideNavComponent],
  exports: [SideNavComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    CheckPermissionDirective,
    ClickStopPropagationDirective,
    MatMenuModule,
    TooltipDirective,
    DialogTemplateComponent,
    ClipboardModule,
    NgOptimizedImage,
  ]
})
export class LayoutModule { }
