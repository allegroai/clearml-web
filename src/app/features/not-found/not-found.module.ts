import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotFoundRoutingModule } from './not-found-routing.module';
import { NotFoundComponent } from './not-found/not-found.component';
import {CheckPermissionDirective} from '~/shared/directives/check-permission.directive';
import {MatIcon} from '@angular/material/icon';

@NgModule({
    imports: [
        CommonModule,
        NotFoundRoutingModule,
        CheckPermissionDirective,
        MatIcon
    ],
  declarations: [NotFoundComponent]
})
export class NotFoundModule { }
