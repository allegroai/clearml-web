import {NgModule} from '@angular/core';
import {
  NestedProjectViewPageExtendedComponent
} from './nested-project-view-page-extended/nested-project-view-page-extended.component';
import {NestedProjectViewModule} from "@common/nested-project-view/nested-project-view.module";
import {CommonModule} from "@angular/common";


@NgModule({
  declarations: [
    NestedProjectViewPageExtendedComponent,
  ],
  exports: [NestedProjectViewPageExtendedComponent],
  imports: [
    CommonModule,
    NestedProjectViewModule,
  ]
})
export class FeatureNestedProjectViewModule { }
