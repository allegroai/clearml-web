import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SimpleDatasetVersionsComponent} from '@common/datasets/simple-dataset-versions/simple-dataset-versions.component';
import {
  SimpleDatasetVersionInfoComponent
} from '@common/datasets/simple-dataset-version-info/simple-dataset-version-info.component';
import {SimpleDatasetsComponent} from '@common/datasets/simple-datasets/simple-datasets.component';
import {EntityTypeEnum} from '../../shared/constants/non-common-consts';

const routes: Routes = [
  {
    path     : '',
    component: SimpleDatasetsComponent,
    data     : {search: true}
  },
  {
    path: 'simple/:projectId',
    data: {search: true},
    children: [
      {path: '', redirectTo: 'experiments', pathMatch: 'full'},
      {
        path: 'experiments',
        component: SimpleDatasetVersionsComponent,
        children: [
          {
            path: ':versionId', component: SimpleDatasetVersionInfoComponent,
          },
        ]
      },
      {
        path: 'compare-experiments',
        data: {entityType: EntityTypeEnum.dataset},
        loadChildren: () => import('@common/experiments-compare/experiments-compare.module').then(m => m.ExperimentsCompareModule)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatasetsRoutingModule {}
