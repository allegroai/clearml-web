import {ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {Queue} from '../../../../business-logic/model/queues/queue';
import {BlTasksService} from '../../../../business-logic/services/tasks.service';
import {SelectQueueComponent} from '../../../experiments/shared/components/select-queue/select-queue.component';

@Component({
  selector   : 'sm-queue-info',
  templateUrl: './queue-info.component.html',
  styleUrls  : ['./queue-info.component.scss']
})
export class QueueInfoComponent implements OnInit {

  @Input() selectedQueue: Queue;
  @Input() queues: Queue[];
  @Output() deselectQueue                 = new EventEmitter();
  @Output() moveExperimentToTopOfQueue    = new EventEmitter();
  @Output() moveExperimentToBottomOfQueue = new EventEmitter();
  @Output() moveExperimentToOtherQueue    = new EventEmitter();
  @Output() removeExperimentFromQueue     = new EventEmitter();
  @Output() moveExperimentInQueue         = new EventEmitter();

  public activeTab: string;
  public menuSelectedExperiment: any;
  public menuOpen: boolean;
  public menuPosition: { x: number; y: number };
  public readonly experimentsCols = [
    {header: '', class: 'col-4'},
    {header: '', class: 'col-20'},
  ];
  public readonly workersCols     = [
    {header: 'Name', class: 'col-9'},
    {header: 'IP', class: 'col-6'},
    {header: 'Currently Executing', class: 'col-9'},
  ];
  public menuClosed: any;

  @HostListener('document:click', ['$event'])
  clickHandler(event) {
    if (event.button != 2) { // Bug in firefox: right click triggers `click` event
      this.menuOpen = false;
    }
  }

  constructor(private changeDetector: ChangeDetectorRef,
              private blTaskService: BlTasksService,
              private dialog: MatDialog) {
  }


  get routerTab() {
    const url = new URL(window.location.href);
    return url.searchParams.get('tab');
  }

  ngOnInit() {
    this.activeTab = this.routerTab === 'workers' ? 'workers' : 'experiments';
  }


  findQueueById(id) {
    return this.queues.find(queue => queue.id === id);
  }

  deselectQueueClicked() {
    this.deselectQueue.emit();
  }


  experimentDropped($event: CdkDragDrop<any>) {
    this.moveExperimentInQueue.emit({task: (this.selectedQueue.entries[$event.previousIndex].task as any).id, count: ($event.currentIndex - $event.previousIndex)});
    moveItemInArray(this.selectedQueue.entries, $event.previousIndex, $event.currentIndex);
  }


  openContextMenu(e, task) {
    this.menuSelectedExperiment = task;
    e.preventDefault();
    this.menuOpen = false;
    setTimeout(() => {
      this.menuPosition = {x: e.clientX, y: e.clientY};
      this.menuOpen     = true;
      this.changeDetector.detectChanges();
    }, 0);

  }

  moveToTop() {
    this.moveExperimentToTopOfQueue.emit(this.menuSelectedExperiment);
  }

  moveToBottom() {
    this.moveExperimentToBottomOfQueue.emit(this.menuSelectedExperiment);

  }

  moveToQueue() {
    this.enqueuePopup();
  }

  removeFromQueue() {
    this.removeExperimentFromQueue.emit(this.menuSelectedExperiment);
  }

  enqueuePopup() {
    const selectQueueDialog: MatDialogRef<SelectQueueComponent, { confirmed: boolean; queue: Queue }> =
            this.dialog.open(SelectQueueComponent, {data: {}});

    selectQueueDialog.afterClosed().subscribe((res) => {
      if (res && res.confirmed) {
        this.moveExperimentToOtherQueue.emit({queue: res.queue, task: this.menuSelectedExperiment});
        this.blTaskService.setPreviouslyUsedQueue(res.queue);
      }
    });
  }
}
