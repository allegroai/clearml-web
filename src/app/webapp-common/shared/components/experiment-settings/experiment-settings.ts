import {Component, input, output } from '@angular/core';

@Component({
  selector   : 'sm-experiment-settings',
  templateUrl: './experiment-settings.html',
  styleUrls  : ['./experiment-settings.scss']
})
export class ExperimentSettingsComponent {

  disabled = input(false);
  showSettings = input(false);
  tableView = input(false);
  toggleSettings = output();
}

