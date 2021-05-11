import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SMSharedModule} from '../../../webapp-common/shared/shared.module';
import {ExperimentConverterService} from './services/experiment-converter.service';
import { ExperimentMenuComponent } from '../../../webapp-common/experiments/shared/components/experiment-menu/experiment-menu.component';

const DECLARATIONS = [
  ExperimentMenuComponent,
];

@NgModule({
  imports        : [
    SMSharedModule,
    CommonModule
  ],
  declarations   : [...DECLARATIONS],
  providers      : [ExperimentConverterService],
  exports        : [...DECLARATIONS]
})
export class ExperimentSharedModule {
}
