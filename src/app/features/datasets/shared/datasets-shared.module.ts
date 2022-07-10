import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SMSharedModule} from '@common/shared/shared.module';
import {ChipsModule} from '@common/shared/ui-components/buttons/chips/chips.module';
import {SharedModule} from '~/shared/shared.module';
import {SimpleDatasetCardComponent} from '@common/datasets/simple-dataset-card/simple-dataset-card.component';
import {ProjectsSharedModule} from '~/features/projects/shared/projects-shared.module';

const _declerations = [
SimpleDatasetCardComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SMSharedModule,
    ChipsModule,
    SharedModule,
    ProjectsSharedModule,
  ],
  declarations: [..._declerations],
  exports     : [..._declerations]
})

export class DatasetsSharedModule { }
