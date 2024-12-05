import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector   : 'sm-experiment-settings',
  templateUrl: './experiment-settings.html',
  styleUrls  : ['./experiment-settings.scss']
})
export class ExperimentSettingsComponent {

  @Input() disabled                  = false;
  @Input() showSettings              = false;
  @Input() tableView              = false;
  @Output() toggleSettings           = new EventEmitter();




}

