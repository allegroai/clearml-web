import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExperimentSettingsComponent} from '../../shared/components/experiment-settings/experiment-settings';
import {SMSharedModule} from '../../shared/shared.module';

const _declerations = [
  ExperimentSettingsComponent,
];

@NgModule({
  imports        : [
    CommonModule,
    SMSharedModule
  ],
  declarations   : [_declerations],
  exports        : [..._declerations]
})
export class ExperimentCompareSharedModule {
}
