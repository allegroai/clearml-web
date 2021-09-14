import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PROJECT_ROUTES, ProjectRoute} from 'app/features/projects/projects.consts';

@Component({
  selector   : 'sm-project-context-navbar',
  templateUrl: './project-context-navbar.component.html',
  styleUrls  : ['./project-context-navbar.component.scss']
})
export class ProjectContextNavbarComponent {
  @Output() backToProjectClicked = new EventEmitter();
  @Output() onNameChanged        = new EventEmitter();

  @Input() activeFeature: string;
  @Input() archivedMode: boolean;

  public readonly routes = this.projectId === '*' ? PROJECT_ROUTES.slice(1) : PROJECT_ROUTES;
  get projectId() {
    return this.activatedRoute.parent.snapshot.params.projectId;
  }

  constructor(private router: Router,
              public activatedRoute: ActivatedRoute) {
  }

  public tabClicked(feature) {
    this.router.navigate([`projects/${this.projectId}/${feature}`]);
  }

  public onBackToProjectClicked() {
    this.backToProjectClicked.emit();
  }

  trackByFn(index, route: ProjectRoute) {
    return route.header;
  }
}
