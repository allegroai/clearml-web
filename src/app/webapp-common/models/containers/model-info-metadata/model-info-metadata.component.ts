import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {selectIsModelSaving, selectSelectedModel} from '../../reducers';
import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {SelectedModel} from '../../shared/models.model';
import {selectIsSharedAndNotOwner} from '~/features/experiments/reducers';
import {activateModelEdit, cancelModelEdit, saveMetaData} from '../../actions/models-info.actions';
import {cloneDeep, toInteger} from 'lodash-es';
import {trackById} from '@common/shared/utils/forms-track-by';
import {filter, map} from 'rxjs/operators';

export interface IModelMetadataMap {
  [key: string]: IModelMetadataItem;
}

export interface IModelMetadataItem {
  id: string;
  key?: string;
  type?: string;
  value?: string;
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
  public cols = [
    {id : 'key', header: 'Key'},
    {id : 'type', header: 'Type'},
    {id : 'value', header: 'Value'}
  ];
  public metadata = null as IModelMetadataItem[];
  private modelSub: Subscription;
  private originalMetadata;
  public searchResultsCount: number;

  constructor(private store: Store) {
    this.selectedModel$ = this.store.select(selectSelectedModel);
    this.saving$ = this.store.select(selectIsModelSaving);
    this.isSharedAndNotOwner$ = this.store.select(selectIsSharedAndNotOwner);
  }

  ngOnInit(): void {
    this.modelSub = this.selectedModel$
      .pipe(
        map(model => model?.metadata),
        filter(metadata => !!metadata)
      )
      .subscribe(metadata => {
        this.originalMetadata = Object.values(cloneDeep(metadata));
        this.metadata = Object.values(metadata)
          .map((item, index) => ({...item, id: `${index}`}));
      });
  }

  saveFormData() {
    this.inEdit = false;
    const metadataObject = this.metadata.reduce((acc, metaItem) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {id, ...item} = metaItem;
      acc[metaItem.key] = item;
      return acc;
    }, {}) as IModelMetadataMap;
    this.store.dispatch(saveMetaData({metadata: metadataObject}));
  }

  cancelModelMetaDataChange() {
    this.inEdit = false;
    this.metadata = cloneDeep(this.originalMetadata);
    this.store.dispatch(cancelModelEdit());
  }


  activateEditChanged(section: string) {
    this.inEdit = true;
    this.store.dispatch(activateModelEdit(section));
  }

  addRow() {
    this.metadata.push({
      id: `${toInteger(this.metadata?.at(-1)?.id ?? '0') + 1}`,
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
