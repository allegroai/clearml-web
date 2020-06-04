import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {ISelectedModel} from '../../shared/models.model';
import {IModelInfoState} from '../../reducers/model-info.reducer';
import {Observable} from 'rxjs';
import {selectIsModelSaving, selectSelectedModel} from '../../reducers';
import {filter} from 'rxjs/operators';
import {ActivateModelEdit, CancelModelEdit, EditModel, SetIsModelSaving} from '../../actions/models-info.actions';

@Component({
  selector: 'sm-model-info-labels',
  templateUrl: './model-info-labels.component.html',
  styleUrls: ['./model-info-labels.component.scss']
})
export class ModelInfoLabelsComponent {

  public selectedModel$: Observable<ISelectedModel>;
  public saving$: Observable<boolean>;

  constructor(private store: Store<IModelInfoState>) {
    this.selectedModel$ = this.store.select(selectSelectedModel).pipe(filter(model => !!model));
    this.saving$         = this.store.select(selectIsModelSaving);
  }
  ngOnInit() {
  }

  saveFormData(changedModel) {
    this.store.dispatch(new SetIsModelSaving(true));
    this.store.dispatch(new EditModel(changedModel));
  }
  cancelClicked() {
    this.store.dispatch(new CancelModelEdit());
  }

  activateEditClicked() {
    this.store.dispatch(new ActivateModelEdit('labels'));
  }
}
