import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Store} from '@ngrx/store';

@Component({
  selector   : 'sm-experiment-settings',
  templateUrl: './experiment-settings.html',
  styleUrls  : ['./experiment-settings.scss']
})
export class ExperimentSettingsComponent implements OnInit {

  @Input() disabled                  = false;
  @Input() showSettings              = false;
  @Output() toggleSettings           = new EventEmitter();

  constructor(private store: Store<any>) {
  }

  ngOnInit() {  }

}

