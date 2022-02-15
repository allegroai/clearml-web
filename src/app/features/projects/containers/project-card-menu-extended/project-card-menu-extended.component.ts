import {Component} from '@angular/core';
import {ProjectCardMenuComponent} from '@common/shared/ui-components/panel/project-card-menu/project-card-menu.component';


@Component({
  selector: 'sm-project-card-menu-extended',
  templateUrl: '../../../../webapp-common/shared/ui-components/panel/project-card-menu/project-card-menu.component.html',
  styleUrls: ['../../../../webapp-common/shared/ui-components/panel/project-card-menu/project-card-menu.component.scss']
})
export class ProjectCardMenuExtendedComponent extends ProjectCardMenuComponent{
  set contextMenu(data) {}
  get contextMenu() {
    return this;
  }
}
