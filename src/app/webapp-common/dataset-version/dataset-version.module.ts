import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {
  SimpleDatasetVersionsComponent
} from '@common/dataset-version/simple-dataset-versions/simple-dataset-versions.component';
import {
  SimpleDatasetVersionInfoComponent
} from '@common/dataset-version/simple-dataset-version-info/simple-dataset-version-info.component';
import {
  SimpleDatasetVersionMenuComponent
} from '@common/dataset-version/simple-dataset-version-menu/simple-dataset-version-menu.component';
import {
  SimpleDatasetVersionDetailsComponent
} from '@common/dataset-version/simple-dataset-version-details/simple-dataset-version-details.component';
import {
  SimpleDatasetVersionContentComponent
} from '@common/dataset-version/simple-dataset-version-content/simple-dataset-version-content.component';
import {
  SimpleDatasetVersionPreviewComponent
} from '@common/dataset-version/simple-dataset-version-preview/simple-dataset-version-preview.component';
import {ExperimentSharedModule} from '~/features/experiments/shared/experiment-shared.module';
import {ExperimentCompareSharedModule} from '@common/experiments-compare/shared/experiment-compare-shared.module';
import {ExperimentOutputLogModule} from '@common/experiments/shared/experiment-output-log/experiment-output-log.module';
import {DebugImagesModule} from '@common/debug-images/debug-images.module';
import {AngularSplitModule} from 'angular-split';
import {DatasetVersionStepComponent} from '@common/dataset-version/dataset-version-step/dataset-version-step.component';
import {HesitateDirective} from '@common/shared/ui-components/directives/hesitate.directive';
import {UniqueByPipe} from '@common/shared/pipes/unique-by.pipe';
import {TimeAgoPipe} from '@common/shared/pipes/timeAgo';
import {ReplaceViaMapPipe} from '@common/shared/pipes/replaceViaMap';
import {MenuItemTextPipe} from '@common/shared/pipes/menu-item-text.pipe';
import {FileSizePipe} from '@common/shared/pipes/filesize.pipe';
import {ReversePipe} from '@common/shared/pipes/reverse.pipe';
import {TagsMenuComponent} from '@common/shared/ui-components/tags/tags-menu/tags-menu.component';
import {EntityFooterComponent} from '@common/shared/entity-page/entity-footer/entity-footer.component';
import {ClipboardModule} from 'ngx-clipboard';
import {MatMenuModule} from '@angular/material/menu';
import {MatExpansionModule} from '@angular/material/expansion';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {TableComponent} from '@common/shared/ui-components/data/table/table.component';
import {ButtonToggleComponent} from '@common/shared/ui-components/inputs/button-toggle/button-toggle.component';
import {OverlayComponent} from '@common/shared/ui-components/overlay/overlay/overlay.component';
import {TableModule} from 'primeng/table';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';



export const routes: Routes = [
  {
    path: '',
    component: SimpleDatasetVersionsComponent,
    children: [
      {
        path: ':versionId', component: SimpleDatasetVersionInfoComponent,
      },
    ]
  }
];


@NgModule({
  declarations: [
    SimpleDatasetVersionsComponent,
    SimpleDatasetVersionMenuComponent,
    SimpleDatasetVersionInfoComponent,
    SimpleDatasetVersionDetailsComponent,
    SimpleDatasetVersionContentComponent,
    DatasetVersionStepComponent,
  ],
  imports: [
    SimpleDatasetVersionPreviewComponent,
    CommonModule,
    AngularSplitModule,
    ExperimentSharedModule,
    ExperimentCompareSharedModule,
    ExperimentOutputLogModule,
    DebugImagesModule,
    RouterModule.forChild(routes),
    HesitateDirective,
    UniqueByPipe,
    TimeAgoPipe,
    ReplaceViaMapPipe,
    MenuItemTextPipe,
    FileSizePipe,
    ReversePipe,
    TagsMenuComponent,
    EntityFooterComponent,
    ClipboardModule,
    MatMenuModule,
    MatExpansionModule,
    TooltipDirective,
    TableComponent,
    ButtonToggleComponent,
    OverlayComponent,
    TableModule,
    ShowTooltipIfEllipsisDirective
  ],
  exports: [
    SimpleDatasetVersionPreviewComponent,
  ]
})
export class DatasetVersionModule { }
