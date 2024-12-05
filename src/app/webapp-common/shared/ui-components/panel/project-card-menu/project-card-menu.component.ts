import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Project} from '~/business-logic/model/projects/project';
import {MenuItemComponent} from '@common/shared/ui-components/panel/menu-item/menu-item.component';
import {MenuComponent} from '@common/shared/ui-components/panel/menu/menu.component';


@Component({
  selector: 'sm-project-card-menu',
  templateUrl: './project-card-menu.component.html',
  styleUrls: ['./project-card-menu.component.scss'],
  standalone: true,
  imports: [
    MenuItemComponent,
    MenuComponent
  ]
})
export class ProjectCardMenuComponent {
  @Output() deleteProjectClicked = new EventEmitter<Project>();
  @Output() moveToClicked = new EventEmitter<Project>();
  @Output() newProjectClicked = new EventEmitter<Project>();
  @Output() projectNameInlineActivated = new EventEmitter();
  @Output() projectEditClicked = new EventEmitter<Project>();
  @Input() project;
}
