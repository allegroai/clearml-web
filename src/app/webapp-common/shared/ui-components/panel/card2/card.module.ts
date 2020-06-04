import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CardComponent2} from './card-component2.component';
import {SyncScrollDirective} from '../../directives/sync-scroll.directive';

@NgModule({
  declarations: [CardComponent2, SyncScrollDirective],
  imports     : [
    CommonModule
  ],
  exports: [CardComponent2, SyncScrollDirective],
})
export class CardModule {
}
