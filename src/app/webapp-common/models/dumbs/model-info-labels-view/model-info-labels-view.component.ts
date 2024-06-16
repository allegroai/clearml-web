import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import {trackById} from '@common/shared/utils/forms-track-by';
import {Model} from '~/business-logic/model/models/model';
import {NgForm} from '@angular/forms';
import {debounceTime, filter, map, switchMap} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {SelectedModel} from '../../shared/models.model';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';

@Component({
  selector: 'sm-model-info-labels-view',
  templateUrl: './model-info-labels-view.component.html',
  styleUrls: ['./model-info-labels-view.component.scss']
})
export class ModelInfoLabelsViewComponent implements AfterViewInit, OnDestroy {
  public formData: Array<{ label: string; id: number }> = [];
  public editable = false;
  public columns: ISmCol[] = [
    {id: 'label', header: 'Label'},
    {id: 'id', header: 'ID'}
  ];

  private unsavedValue: { label: string; id: number }[];
  private formChangesSubscription: Subscription;
  private _model: SelectedModel;

  @ViewChildren(NgForm) labelsFormList: QueryList<NgForm>;

  @Input() set model(model: SelectedModel) {
    if (model) {
      this.formData = this.revertParameters(model.labels);
    }
    this._model = model;
  }

  get model() {
    return this._model;
  }

  @Input() saving = false;
  @Input() isSharedAndNotOwner: boolean = false;
  @Output() saveFormData = new EventEmitter();
  @Output() cancelClicked = new EventEmitter();
  @Output() activateEditClicked = new EventEmitter();

  constructor() {
  }

  ngAfterViewInit(): void {
    this.formChangesSubscription = this.labelsFormList.changes
      .pipe(
        map(() => this.labelsFormList?.first),
        filter(form => !!form),
        switchMap(() => this.labelsFormList.first?.valueChanges),
        debounceTime(10)
      )
      .subscribe(() => {
        if (this.editable) {
          this.unsavedValue = this.formData;
        }
      });
  }

  ngOnDestroy(): void {
    this.formChangesSubscription.unsubscribe();
  }

  activateEdit() {
    this.editable = true;
    this.activateEditClicked.emit();
  }

  addRow() {
    this.formData.push({
      id: this.formData.length + 1,
      label: null,
    });
  }

  removeRow(index) {
    this.formData.splice(index, 1);
  }

  saveClicked() {
    this.editable = false;
    this.saveFormData.emit({...this.model, labels: this.unsavedValue ? this.convertParameters(this.unsavedValue) : this.model.labels});
  }

  cancelEdit() {
    this.editable = false;
    this.cancelClicked.emit();
  }

  // TODO: move to utils.
  revertParameters(labels: Model['labels']): Array<{ id: number, label: string }> {
    return labels ? Object.entries(labels).map(([key, val]) => ({id: val, label: key})).sort((labelA, labelB) => labelA.id - labelB.id) : [];
  }

  convertParameters(labels: Array<{ id: number, label: string }>): Model['labels'] {
    const obj = {};
    labels?.forEach(l => {
      obj[l.label] = l.id;
    });
    return obj;
  }

  protected readonly trackById = trackById;
}
