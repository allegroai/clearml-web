import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SimpleDatasetsComponent} from '@common/datasets/simple-datasets/simple-datasets.component';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {CrumbTypeEnum} from '@common/layout/breadcrumbs/breadcrumbs.component';
import {NestedSimpleDatasetsPageComponent} from '@common/datasets/nested-simple-datasets-page/nested-simple-datasets-page.component';

const routes: Routes = [
  {
    path     : '',
    component: SimpleDatasetsComponent,
    data: {search: true, staticBreadcrumb:[[{
        name: 'DATASETS',
        type: CrumbTypeEnum.Feature
      }]]}
  },
  {
    path: 'simple/:projectId',
    data: {search: true},
    children: [
      {
        path: 'datasets',
        component: SimpleDatasetsComponent,
        data: {search: true}
      },
      {
        path: 'projects',
        component: NestedSimpleDatasetsPageComponent,
        data: {search: true}
      },
      {
        path: 'experiments',
        loadChildren: () => import('@common/dataset-version/dataset-version.module')
          .then(m => m.DatasetVersionModule)
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
