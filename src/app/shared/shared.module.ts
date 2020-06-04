import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CheckPermissionDirective} from './directives/check-permission.directive';

@NgModule({
  declarations: [CheckPermissionDirective],
  exports     : [CheckPermissionDirective],
  imports     : [
    CommonModule
  ],
})
export class SharedModule {
}
