import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Model} from '../../../../business-logic/model/models/model';

@Component({
  selector   : 'sm-models-search-results',
  templateUrl: './models-search-results.component.html',
  styleUrls  : ['./models-search-results.component.scss']
})
export class ModelsSearchResultsComponent {
  @Input() modelsList: Array<Model>;
  @Output() modelClicked = new EventEmitter<Model>();

  public modelCardClicked(model: Model) {
    this.modelClicked.emit(model);
  }

}
