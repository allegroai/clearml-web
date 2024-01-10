import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { ModelMenuComponent } from '@common/models/containers/model-menu/model-menu.component';
import {CommonLayoutModule} from '@common/layout/layout.module';
import { ModelMenuExtendedComponent } from './containers/model-menu-extended/model-menu-extended.component';
import {MenuItemTextPipe} from '@common/shared/pipes/menu-item-text.pipe';
import {TagsMenuComponent} from '@common/shared/ui-components/tags/tags-menu/tags-menu.component';
import {MatMenuModule} from '@angular/material/menu';

@NgModule({
  declarations: [ModelMenuComponent, ModelMenuExtendedComponent],
  exports     : [ModelMenuComponent, ModelMenuExtendedComponent],
  imports     : [
    CommonLayoutModule,
    CommonModule,
    MenuItemTextPipe,
    TagsMenuComponent,
    MatMenuModule
  ]
})
export class FeatureModelsModule {
}
