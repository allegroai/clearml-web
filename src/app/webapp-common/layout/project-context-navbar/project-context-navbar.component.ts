import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PROJECT_ROUTES, PROJECT_ROUTES_TYPE} from '../../../shared/constants/non-common-consts';

@Component({
  selector   : 'sm-project-context-navbar',
  templateUrl: './project-context-navbar.component.html',
  styleUrls  : ['./project-context-navbar.component.scss']
})
export class ProjectContextNavbarComponent {
  // @Output() featureClicked       = new EventEmitter();
  @Output() backToProjectClicked = new EventEmitter();
  @Output() onNameChanged        = new EventEmitter();

  @Input() activeFeature: PROJECT_ROUTES_TYPE;
  @Input() archivedMode: boolean;

  public readonly routes = PROJECT_ROUTES;
  get projectId() {
    return this.route.parent.snapshot.params.projectId;
  }

  constructor(private router: Router,
              private route: ActivatedRoute) {
  }

  public tabClicked(feature) {
    this.router.navigate([`projects/${this.projectId}/${feature}`]);
  }

  public onBackToProjectClicked() {
    this.backToProjectClicked.emit();
  }
}
