import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  NestedProjectViewPageComponent
} from "@common/nested-project-view/nested-project-view-page/nested-project-view-page.component";


@Component({
  selector: 'sm-nested-project-view-page-extended',
  templateUrl: './nested-project-view-page-extended.component.html',
  styleUrls: ['./nested-project-view-page-extended.component.scss']
})
export class NestedProjectViewPageExtendedComponent extends NestedProjectViewPageComponent implements OnInit, OnDestroy {

}
