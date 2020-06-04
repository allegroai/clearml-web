import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector   : 'sm-model-footer',
  templateUrl: './model-footer.component.html',
  styleUrls  : ['./model-footer.component.scss']
})
export class ModelFooterComponent implements OnInit {

  @Input() visible;
  @Input() numberOfSelectedModels;
  @Input() showAllSelectedIsActive;
  @Input() isArchivedMode;
  @Input() disableArchive: boolean = false;
  @Input() archiveToolTipMessage: string;

  @Output() restoreModelsClicked   = new EventEmitter();
  @Output() compareModelsClicked   = new EventEmitter();
  @Output() archiveModelsClicked   = new EventEmitter();
  @Output() showAllSelectedClicked = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  onCompareModelsClicked() {
    this.compareModelsClicked.emit();
  }

  archiveModels() {
    this.archiveModelsClicked.emit();
  }

  restoreModels() {
    this.restoreModelsClicked.emit();
  }


}
