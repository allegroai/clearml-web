import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TableDiffComponent} from './table-diff.component';

@NgModule({
  declarations: [TableDiffComponent],
  imports     : [
    CommonModule
  ],
  exports     : [TableDiffComponent]
})
export class TableDiffModule {
}
