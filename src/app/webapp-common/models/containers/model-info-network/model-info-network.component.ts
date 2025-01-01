import {Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectIsModelSaving, selectSelectedModel} from '../../reducers';
import {activateModelEdit, cancelModelEdit, editModel, setSavingModel } from '../../actions/models-info.actions';
import {selectIsSharedAndNotOwner} from '~/features/experiments/reducers';

@Component({
  selector   : 'sm-model-info-network',
  templateUrl: './model-info-network.component.html',
  styleUrls  : ['./model-info-network.component.scss']
})
export class ModelInfoNetworkComponent {
  private store = inject(Store);

  protected selectedModel$ = this.store.select(selectSelectedModel);
  protected isSharedAndNotOwner$ = this.store.select(selectIsSharedAndNotOwner);
  protected saving$         = this.store.select(selectIsModelSaving);

  saveFormData(changedModel) {
    this.store.dispatch(setSavingModel (true));
    this.store.dispatch(editModel({model: changedModel}));
  }
  cancelClicked() {
    this.store.dispatch(cancelModelEdit());
  }

  activateEditClicked() {
    this.store.dispatch(activateModelEdit('network'));
  }
}
