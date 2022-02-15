import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { ModelMenuComponent } from '../../webapp-common/models/containers/model-menu/model-menu.component';
import {SMSharedModule} from '../../webapp-common/shared/shared.module';
import {CommonLayoutModule} from '../../webapp-common/layout/layout.module';
import { ModelMenuExtendedComponent } from './containers/model-menu-extended/model-menu-extended.component';

@NgModule({
  declarations: [ModelMenuComponent, ModelMenuExtendedComponent],
  exports     : [ModelMenuComponent, ModelMenuExtendedComponent],
  imports     : [
    CommonLayoutModule,
    CommonModule,
    SMSharedModule
  ]
})
export class FeatureModelsModule {
}
