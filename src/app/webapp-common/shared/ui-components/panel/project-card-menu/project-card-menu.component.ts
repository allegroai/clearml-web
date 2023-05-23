import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Project} from '~/business-logic/model/projects/project';


@Component({
  selector: 'sm-project-card-menu',
  templateUrl: './project-card-menu.component.html',
  styleUrls: ['./project-card-menu.component.scss']
})
export class ProjectCardMenuComponent {
  @Output() deleteProjectClicked = new EventEmitter<Project>();
  @Output() moveToClicked = new EventEmitter<Project>();
  @Output() newProjectClicked = new EventEmitter<Project>();
  @Output() projectNameInlineActivated = new EventEmitter();
  @Input() project;
}
