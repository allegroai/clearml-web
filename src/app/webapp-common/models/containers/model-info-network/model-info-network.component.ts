import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {ISelectedModelInput} from '../../shared/models.model';
import {Store} from '@ngrx/store';
import {ModelInfoState} from '../../reducers/model-info.reducer';
import {selectIsModelSaving, selectSelectedModel} from '../../reducers';
import {activateModelEdit, cancelModelEdit, editModel, setSavingModel } from '../../actions/models-info.actions';
import {selectIsSharedAndNotOwner} from '~/features/experiments/reducers';

@Component({
  selector   : 'sm-model-info-network',
  templateUrl: './model-info-network.component.html',
  styleUrls  : ['./model-info-network.component.scss']
})
export class ModelInfoNetworkComponent implements OnInit {
  public selectedModel$: Observable<ISelectedModelInput>;
  public saving$: Observable<boolean>;
  public isSharedAndNotOwner$: Observable<boolean>;

  constructor(private store: Store) {
    this.selectedModel$ = this.store.select(selectSelectedModel);
    this.isSharedAndNotOwner$ = this.store.select(selectIsSharedAndNotOwner);
    this.saving$         = this.store.select(selectIsModelSaving);
  }
  ngOnInit() {
  }

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
