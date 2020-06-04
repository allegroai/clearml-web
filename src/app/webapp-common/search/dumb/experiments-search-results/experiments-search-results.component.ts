import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Task} from '../../../../business-logic/model/tasks/task';
import {ITask} from '../../../../business-logic/model/al-task';

@Component({
  selector   : 'sm-experiments-search-results',
  templateUrl: './experiments-search-results.component.html',
  styleUrls  : ['./experiments-search-results.component.scss']
})
export class ExperimentsSearchResultsComponent {
  @Input() experimentsList: Array<Task>;
  @Output() experimentClicked = new EventEmitter<ITask>();

  public experimentCardClicked(experiment: ITask) {
    this.experimentClicked.emit(experiment);
  }

}
