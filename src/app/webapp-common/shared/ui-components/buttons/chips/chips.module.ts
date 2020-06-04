import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ChipsComponent} from './chips.component';
import {ChooseColorModule} from '../../directives/choose-color/choose-color.module';


@NgModule({
  imports     : [
    CommonModule,
    ChooseColorModule
  ],
  providers   : [],
  declarations: [ChipsComponent],
  exports     : [ChipsComponent],
})

export class ChipsModule { }
