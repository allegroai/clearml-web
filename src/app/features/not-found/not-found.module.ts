import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotFoundRoutingModule } from './not-found-routing.module';
import { NotFoundComponent } from './not-found/not-found.component';
import {CheckPermissionDirective} from '~/shared/directives/check-permission.directive';

@NgModule({
  imports: [
    CommonModule,
    NotFoundRoutingModule,
    CheckPermissionDirective
  ],
  declarations: [NotFoundComponent]
})
export class NotFoundModule { }
