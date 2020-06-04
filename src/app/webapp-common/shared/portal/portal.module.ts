import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PortalComponent} from './portal.component';
import {PortalModule} from '@angular/cdk/portal';

@NgModule({
  declarations: [PortalComponent],
  exports     : [PortalComponent],
  imports     : [
    CommonModule,
    PortalModule
  ]
})
export class SMPortalModule {
}
