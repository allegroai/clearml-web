import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ISmCol} from '../../../shared/ui-components/data/table/table.consts';

@Component({
  selector   : 'sm-model-custom-cols-menu',
  templateUrl: './model-custom-cols-menu.component.html',
  styleUrls  : ['./model-custom-cols-menu.component.scss']
})
export class ModelCustomColsMenuComponent {
  @Input() tableCols: ISmCol[];
  @Input() isLoading: boolean;
  @Input() disabled: boolean;
  @Output() selectedTableColsChanged  = new EventEmitter();
}
