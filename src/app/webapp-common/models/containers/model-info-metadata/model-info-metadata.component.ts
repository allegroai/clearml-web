import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {selectIsModelSaving, selectSelectedModel} from '../../reducers';
import {filter} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import {ModelInfoState} from '../../reducers/model-info.reducer';
import {Observable, Subscription} from 'rxjs';
import {SelectedModel} from '../../shared/models.model';
import {selectIsSharedAndNotOwner} from '../../../../features/experiments/reducers';
import {ActivateModelEdit, CancelModelEdit, saveMetaData, SetIsModelSaving} from '../../actions/models-info.actions';
import {cloneDeep} from 'lodash/fp';
import {trackById} from '../../../shared/utils/forms-track-by';

export interface IModelMetadataMap {
  [key: string]: IModelMetadataItem
}

export interface IModelMetadataItem {
  key?: string,
  type?: string,
  value?: string
}

@Component({
  selector: 'sm-model-info-metadata',
  templateUrl: './model-info-metadata.component.html',
  styleUrls: ['./model-info-metadata.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelInfoMetadataComponent implements OnInit, OnDestroy {
  public selectedModel$: Observable<SelectedModel>;
  public saving$: Observable<boolean>;
  public isSharedAndNotOwner$: Observable<unknown>;
  public inEdit: boolean;
  trackByFn = trackById;
  public cols = [{header: 'Key', class: 'col-8'},
    {header: 'Type', class: 'col-8'}, {header: 'Value', class: 'col-8'}];
  public metadata: IModelMetadataItem[];
  private modelSub: Subscription;
  private originalMetadata: IModelMetadataItem[];
  searchedText: string;
  public searchResultsCount: number;
  public scrollIndexCounter: number;

  constructor(private store: Store<ModelInfoState>) {
    this.selectedModel$ = this.store.select(selectSelectedModel).pipe(filter(model => !!model));
    this.saving$ = this.store.select(selectIsModelSaving);
    this.isSharedAndNotOwner$ = this.store.select(selectIsSharedAndNotOwner);
  }

  ngOnInit(): void {
    this.modelSub = this.selectedModel$.subscribe(model => {
      this.originalMetadata = Object.values(cloneDeep(model?.metadata));
      this.metadata = Object.values(cloneDeep(model?.metadata));
    })
  }

  saveFormData() {
    this.inEdit = false;
    const metadataObject = this.metadata.reduce((acc, metaItem) => (acc[metaItem.key] = metaItem, acc), {}) as IModelMetadataMap;
    this.store.dispatch(new SetIsModelSaving(true));
    this.store.dispatch(saveMetaData({metadata: metadataObject}))
  }

  cancelModelMetaDataChange() {
    this.inEdit = false;
    this.metadata = cloneDeep(this.originalMetadata);
    this.store.dispatch(new CancelModelEdit());
  }


  activateEditChanged(section: string) {
    this.inEdit = true;
    this.store.dispatch(new ActivateModelEdit(section));
  }

  addRow() {
    this.metadata.push({
      key: null,
      type: null,
      value: null
    });
  }

  removeRow(index) {
    this.metadata.splice(index, 1);
  }

  ngOnDestroy(): void {
    this.modelSub.unsubscribe();
  }
}
