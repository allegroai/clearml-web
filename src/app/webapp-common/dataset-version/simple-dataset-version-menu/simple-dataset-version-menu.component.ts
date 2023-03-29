import {Component} from '@angular/core';
import {ExperimentMenuComponent} from '@common/experiments/shared/components/experiment-menu/experiment-menu.component';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';

@Component({
  selector: 'sm-simple-dataset-version-menu',
  templateUrl: './simple-dataset-version-menu.component.html',
  styleUrls: ['../../experiments/shared/components/experiment-menu/experiment-menu.component.scss','./simple-dataset-version-menu.component.scss']
})
export class SimpleDatasetVersionMenuComponent extends ExperimentMenuComponent {
  entityTypeEnum = EntityTypeEnum;
}
