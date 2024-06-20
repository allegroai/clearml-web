import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {SelectedModel} from '../../shared/models.model';
import {Observable} from 'rxjs';
import {selectIsModelSaving, selectSelectedModel} from '../../reducers';
import {filter} from 'rxjs/operators';
import {activateModelEdit, cancelModelEdit, editModel, setSavingModel } from '../../actions/models-info.actions';
import {selectIsSharedAndNotOwner} from '~/features/experiments/reducers';

@Component({
  selector: 'sm-model-info-labels',
  templateUrl: './model-info-labels.component.html',
  styleUrls: ['./model-info-labels.component.scss']
})
export class ModelInfoLabelsComponent {

  public selectedModel$: Observable<SelectedModel>;
  public saving$: Observable<boolean>;
  public isSharedAndNotOwner$: Observable<boolean>;

  constructor(private store: Store) {
    this.selectedModel$ = this.store.select(selectSelectedModel).pipe(filter(model => !!model));
    this.saving$         = this.store.select(selectIsModelSaving);
    this.isSharedAndNotOwner$ = this.store.select(selectIsSharedAndNotOwner);
  }

  saveFormData(changedModel) {
    this.store.dispatch(setSavingModel (true));
    this.store.dispatch(editModel({model: changedModel}));
  }
  cancelClicked() {
    this.store.dispatch(cancelModelEdit());
  }

  activateEditClicked() {
    this.store.dispatch(activateModelEdit('labels'));
  }
}
