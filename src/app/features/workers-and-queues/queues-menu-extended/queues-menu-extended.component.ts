import {Component} from '@angular/core';
import {QueuesMenuComponent} from '../../../webapp-common/workers-and-queues/dumb/queues-menu/queues-menu.component';

@Component({
  selector: 'sm-queues-menu-extended',
  templateUrl: '../../../webapp-common/workers-and-queues/dumb/queues-menu/queues-menu.component.html',
  styleUrls: ['../../../webapp-common/workers-and-queues/dumb/queues-menu/queues-menu.component.scss']
})
export class QueuesMenuExtendedComponent extends QueuesMenuComponent{
  set contextMenu(data) {}
  get contextMenu() {
    return this;
  }
}
