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
    {header: 'QUEUE', class: ''},
    {header: 'NEXT EXPERIMENT', class: ''},
    {header: 'IN QUEUE', class: ''},
  ];

  constructor() {
  }

  deselectWorkerClicked() {
    this.deselectWorker.emit();
  }
}
