import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { ModelMenuComponent } from '../../webapp-common/models/containers/model-menu/model-menu.component';
import {SMSharedModule} from '../../webapp-common/shared/shared.module';
import {ModelHeaderComponent} from './dumb/model-header/model-header.component';
import {CommonLayoutModule} from '../../webapp-common/layout/layout.module';

@NgModule({
  declarations: [ModelMenuComponent],
  exports     : [ModelMenuComponent],
  imports     : [
    CommonLayoutModule,
    CommonModule,
    SMSharedModule
  ]
})
export class FeatureModelsModule {
}
