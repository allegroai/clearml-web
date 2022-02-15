import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Queue} from '../../../../business-logic/model/queues/queue';
import {ICONS} from '../../../constants';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'sm-queues-menu',
  templateUrl: './queues-menu.component.html',
  styleUrls: ['./queues-menu.component.scss']
})
export class QueuesMenuComponent  {
  public queuesManager: boolean;
  readonly ICONS = ICONS;

  @Input() menuOpen: boolean;
  @Input() selectedQueue: Queue;
  @Input() menuPosition;
  @Output() deleteQueue = new EventEmitter();
  @Output() renameQueue = new EventEmitter();
  constructor(private route: ActivatedRoute) {
    this.queuesManager = route.snapshot.data.queuesManager;

  }
}
