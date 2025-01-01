import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { ModelMenuComponent } from '@common/models/containers/model-menu/model-menu.component';
import { ModelMenuExtendedComponent } from './containers/model-menu-extended/model-menu-extended.component';
import {MenuItemTextPipe} from '@common/shared/pipes/menu-item-text.pipe';
import {TagsMenuComponent} from '@common/shared/ui-components/tags/tags-menu/tags-menu.component';
import {MatMenuModule} from '@angular/material/menu';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';

@NgModule({
  declarations: [ModelMenuComponent, ModelMenuExtendedComponent],
  exports     : [ModelMenuComponent, ModelMenuExtendedComponent],
  imports: [
    CommonModule,
    MenuItemTextPipe,
    TagsMenuComponent,
    MatMenuModule,
    MatIcon,
    MatIconButton
  ]
})
export class FeatureModelsModule {
}
