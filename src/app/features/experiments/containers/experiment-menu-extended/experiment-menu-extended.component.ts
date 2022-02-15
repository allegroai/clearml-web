import { Component} from '@angular/core';
import {ExperimentMenuComponent} from '@common/experiments/shared/components/experiment-menu/experiment-menu.component';

@Component({
  selector: 'sm-experiment-menu-extended',
  templateUrl: '../../../../webapp-common/experiments/shared/components/experiment-menu/experiment-menu.component.html',
  styleUrls: ['../../../../webapp-common/experiments/shared/components/experiment-menu/experiment-menu.component.scss']
})
export class ExperimentMenuExtendedComponent extends ExperimentMenuComponent{

  set contextMenu(data) {}
  get contextMenu() {
    return this;
  }
}
