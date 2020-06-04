import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector   : 'sm-model-custom-cols-menu',
  templateUrl: './model-custom-cols-menu.component.html',
  styleUrls  : ['./model-custom-cols-menu.component.scss']
})
export class ModelCustomColsMenuComponent {
  @Input() tableCols;
  @Input() isLoading: boolean;
  @Output() selectedTableColsChanged  = new EventEmitter();
}
