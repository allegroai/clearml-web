import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {ISelectedModelInput} from '../../shared/models.model';
import {Store} from '@ngrx/store';
import {ModelInfoState} from '../../reducers/model-info.reducer';
import {selectIsModelSaving, selectSelectedModel} from '../../reducers';
import {ActivateModelEdit, CancelModelEdit, EditModel, SetIsModelSaving} from '../../actions/models-info.actions';
import {selectIsSharedAndNotOwner} from '../../../../features/experiments/reducers';

@Component({
  selector   : 'sm-model-info-network',
  templateUrl: './model-info-network.component.html',
  styleUrls  : ['./model-info-network.component.scss']
})
export class ModelInfoNetworkComponent implements OnInit {
  public selectedModel$: Observable<ISelectedModelInput>;
  public saving$: Observable<boolean>;
  public isSharedAndNotOwner$: Observable<boolean>;

  constructor(private store: Store<ModelInfoState>) {
    this.selectedModel$ = this.store.select(selectSelectedModel);
    this.isSharedAndNotOwner$ = this.store.select(selectIsSharedAndNotOwner);
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
    this.store.dispatch(new ActivateModelEdit('network'));
  }
}
