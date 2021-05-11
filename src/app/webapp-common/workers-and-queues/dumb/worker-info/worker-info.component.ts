import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Worker} from '../../../../business-logic/model/workers/worker';

@Component({
  selector   : 'sm-worker-info',
  templateUrl: './worker-info.component.html',
  styleUrls  : ['./worker-info.component.scss']
})
export class WorkerInfoComponent implements OnInit {

  @Input() selectedWorker;
  @Output() deselectWorker = new EventEmitter();
  activeTab: string        = 'info';
  public readonly cols     = [
    {header: 'QUEUE', class: 'col-8'},
    {header: 'NEXT EXPERIMENT', class: 'col-12'},
    {header: 'IN QUEUE', class: 'col-4'},
  ];

  constructor() {
  }

  ngOnInit() {
  }

  deselectWorkerClicked() {
    this.deselectWorker.emit();
  }
}
