import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SimpleDatasetsComponent } from '@common/datasets/simple-datasets/simple-datasets.component';
import { EntityTypeEnum } from '~/shared/constants/non-common-consts';
import {
  NestedProjectViewPageComponent
} from '@common/nested-project-view/nested-project-view-page/nested-project-view-page.component';
import { CrumbTypeEnum } from '@common/layout/breadcrumbs/breadcrumbs.component';

const routes: Routes = [
  {
    path: '',
    component: SimpleDatasetsComponent,
    data: {
      search: true,
      staticBreadcrumb: [[{
        name: 'Datasets',
        type: CrumbTypeEnum.Feature
      }]]
    }
  },
  {
    path: 'simple/:projectId',
    data: { search: true },
    children: [
      {
        path: 'datasets',
        component: SimpleDatasetsComponent,
        data: { search: true }
      },
      {
        path: 'projects',
        component: NestedProjectViewPageComponent,
        data: { search: true }
      },
      {
        path: 'experiments',
        loadChildren: () => import('@common/dataset-version/dataset-version.module')
          .then(m => m.DatasetVersionModule)
      },
      {
        path: 'compare-experiments',
        data: { entityType: EntityTypeEnum.dataset },
        loadChildren: () => import('@common/experiments-compare/experiments-compare.module').then(m => m.ExperimentsCompareModule)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatasetsRoutingModule { }
