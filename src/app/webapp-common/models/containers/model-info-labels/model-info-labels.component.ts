import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {SelectedModel} from '../../shared/models.model';
import {ModelInfoState} from '../../reducers/model-info.reducer';
import {Observable} from 'rxjs';
import {selectIsModelSaving, selectSelectedModel} from '../../reducers';
import {filter} from 'rxjs/operators';
import {ActivateModelEdit, CancelModelEdit, EditModel, SetIsModelSaving} from '../../actions/models-info.actions';
import {selectIsSharedAndNotOwner} from "../../../../features/experiments/reducers";

@Component({
  selector: 'sm-model-info-labels',
  templateUrl: './model-info-labels.component.html',
  styleUrls: ['./model-info-labels.component.scss']
})
export class ModelInfoLabelsComponent {

  public selectedModel$: Observable<SelectedModel>;
  public saving$: Observable<boolean>;
  public isSharedAndNotOwner$: Observable<boolean>;

  constructor(private store: Store<ModelInfoState>) {
    this.selectedModel$ = this.store.select(selectSelectedModel).pipe(filter(model => !!model));
    this.saving$         = this.store.select(selectIsModelSaving);
    this.isSharedAndNotOwner$ = this.store.select(selectIsSharedAndNotOwner);
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
