import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { ModelMenuComponent } from '@common/models/containers/model-menu/model-menu.component';
import {SMSharedModule} from '@common/shared/shared.module';
import {CommonLayoutModule} from '@common/layout/layout.module';
import { ModelMenuExtendedComponent } from './containers/model-menu-extended/model-menu-extended.component';
import {SharedPipesModule} from '@common/shared/pipes/shared-pipes.module';

@NgModule({
  declarations: [ModelMenuComponent, ModelMenuExtendedComponent],
  exports     : [ModelMenuComponent, ModelMenuExtendedComponent],
  imports     : [
    CommonLayoutModule,
    CommonModule,
    SMSharedModule,
    SharedPipesModule
  ]
})
export class FeatureModelsModule {
}
