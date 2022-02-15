import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector   : 'sm-worker-info',
  templateUrl: './worker-info.component.html',
  styleUrls  : ['./worker-info.component.scss']
})
export class WorkerInfoComponent {

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

  deselectWorkerClicked() {
    this.deselectWorker.emit();
  }
}
