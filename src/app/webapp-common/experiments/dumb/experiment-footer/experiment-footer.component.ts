import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector   : 'sm-experiment-footer',
  templateUrl: './experiment-footer.component.html',
  styleUrls  : ['./experiment-footer.component.scss']
})
export class ExperimentFooterComponent implements OnInit {

  @Input() visible                 = false;
  @Input() numberOfSelectedExperiments;
  @Input() showAllSelectedIsActive;
  @Input() isArchivedMode;
  @Input() disableArchive: boolean = false;
  @Input() archiveToolTipMessage: string;

  @Output() restoreExperimentsClicked = new EventEmitter();
  @Output() compareExperimentsClicked = new EventEmitter();
  @Output() archiveExperimentsClicked = new EventEmitter();
  @Output() showAllSelectedClicked    = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  onCompareExperimentsClicked() {
    this.compareExperimentsClicked.emit();
  }

  archiveExperiments() {
    this.archiveExperimentsClicked.emit();
  }

  restoreExperiments() {
    this.restoreExperimentsClicked.emit();
  }
}
