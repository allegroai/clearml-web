import {Component, signal} from '@angular/core';
import {ModelMenuComponent} from '../../../../webapp-common/models/containers/model-menu/model-menu.component';

@Component({
  selector: 'sm-model-menu-extended',
  templateUrl: '../../../../webapp-common/models/containers/model-menu/model-menu.component.html',
  styleUrls: ['../../../../webapp-common/models/containers/model-menu/model-menu.component.scss']
})
export class ModelMenuExtendedComponent extends ModelMenuComponent {

  contextMenu = signal(this);
}
