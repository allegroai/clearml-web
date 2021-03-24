import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector   : 'sm-entity-footer',
  templateUrl: './entity-footer.component.html',
  styleUrls  : ['./entity-footer.component.scss']
})
export class EntityFooterComponent implements OnInit {

  @Input() entitiesType: 'experiments' | 'models' | 'dataviews';
  @Input() visible;
  @Input() numberOfSelectedEntities;
  @Input() showAllSelectedIsActive;
  @Input() isArchivedMode;
  @Input() disableArchive: boolean = false;
  @Input() archiveToolTipMessage: string;

  @Output() restoreEntitiesClicked   = new EventEmitter();
  @Output() compareEntitiesClicked   = new EventEmitter();
  @Output() archiveEntitiesClicked   = new EventEmitter();
  @Output() showAllSelectedClicked = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }
}
