import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IExperimentInfo} from '../../../../features/experiments/shared/experiment-info.model';

@Component({
  selector: 'sm-experiment-info-edit-description',
  templateUrl: './experiment-info-edit-description.component.html',
  styleUrls: ['./experiment-info-edit-description.component.scss']
})
export class ExperimentInfoEditDescriptionComponent implements OnInit {
  @Input() selectedExperiment: IExperimentInfo;
  @Output() onDescription = new EventEmitter<null>();

  public isEntered = false;
  public isOpen = false;
  constructor() { }

  ngOnInit(): void {
  }
}
