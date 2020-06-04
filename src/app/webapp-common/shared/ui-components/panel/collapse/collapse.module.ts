import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CollapseComponent} from './collapse.component';
import {MatExpansionModule} from '@angular/material/expansion';


@NgModule({
  declarations: [CollapseComponent],
  imports     : [
    CommonModule,
    MatExpansionModule,
    // MaterialModuleModule
  ],
  exports     : [CollapseComponent]
})
export class CollapseModule {
}
