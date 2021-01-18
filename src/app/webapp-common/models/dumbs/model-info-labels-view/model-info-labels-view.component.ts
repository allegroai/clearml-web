import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Model} from '../../../../business-logic/model/models/model';
import {NgForm} from '@angular/forms';
import {debounceTime} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {SelectedModel} from '../../shared/models.model';

@Component({
  selector: 'sm-model-info-labels-view',
  templateUrl: './model-info-labels-view.component.html',
  styleUrls: ['./model-info-labels-view.component.scss']
})
export class ModelInfoLabelsViewComponent implements OnInit, OnDestroy {
  public formData: Array<{ label: string; id: number }> = [];
  public editable: boolean = false;
  public cols = [{header: 'Label', class: 'col-10'},
    {header: 'Id', class: 'col-4'}];

  private unsavedValue: any;
  private formChangesSubscription: Subscription;
  private _model: SelectedModel;

  @ViewChild('labels', {static: true}) labels: NgForm;

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

  ngOnInit(): void {
    this.formChangesSubscription = this.labels.valueChanges.pipe(debounceTime(10)).subscribe(formValue => {
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
    this.saveFormData.emit({...this.model, labels: this.convertParameters(this.unsavedValue)});
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
    labels.forEach(l => {
      obj[l.label] = l.id;
    });
    return obj;
  }

}
