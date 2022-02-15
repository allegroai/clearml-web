import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SMSharedModule} from '../../../webapp-common/shared/shared.module';
import {ExperimentConverterService} from './services/experiment-converter.service';
import { ExperimentMenuComponent } from '../../../webapp-common/experiments/shared/components/experiment-menu/experiment-menu.component';
import {ExperimentMenuExtendedComponent} from '../containers/experiment-menu-extended/experiment-menu-extended.component';

const DECLARATIONS = [
  ExperimentMenuComponent,
  ExperimentMenuExtendedComponent,
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
