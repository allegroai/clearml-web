import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';


@Component({
  selector   : 'sm-create-new-queue-form',
  templateUrl: './create-new-queue-form.component.html',
  styleUrls  : ['./create-new-queue-form.component.scss']
})
export class CreateNewQueueFormComponent {
  public queuesNames: Array<string>;

  @Input() set queues(queues) {
    this.queuesNames = queues.map(queue => queue.name);
  }

  @Input() queue = {
    name: null,
    id  : null
  };

  @Output() queueCreated = new EventEmitter();
  @ViewChild('queueForm', {static: true}) queueForm: NgForm;


  get isEdit(): boolean {
    return !!this.queue.id;
  }

  send() {
    if (this.queueForm.valid) {
      this.queueCreated.emit(this.queue);
    } else {
      this.queueForm.onSubmit(null);
    }
  }
}
