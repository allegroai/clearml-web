import {Component, Input, OnInit} from '@angular/core';
import {ITask} from '../../../../business-logic/model/al-task';
import {TIME_FORMAT_STRING} from '../../../constants';

@Component({
  selector   : 'sm-experiment-table-card',
  templateUrl: './experiment-table-card.component.html',
  styleUrls  : ['./experiment-table-card.component.scss']
})
export class ExperimentTableCardComponent implements OnInit {
  @Input() experiment: ITask;
  TIME_FORMAT_STRING = TIME_FORMAT_STRING;

  constructor() {
  }

  ngOnInit() {
  }

  experimentDuration(created, completed) {

    const createdDate = new Date(created).getTime();
    const completedDate = new Date(completed).getTime();

    return completed ? (completedDate - createdDate) : '';
  }


}
