import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {getModelDesign} from '../../../tasks/tasks.utils';
import {TextareaControlComponent} from '../../../shared/ui-components/forms/textarea-control/textarea-control.component';
import {EditJsonComponent} from '../../../shared/ui-components/overlay/edit-json/edit-json.component';
import {take} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector   : 'sm-model-view-network',
  templateUrl: './model-view-network.component.html',
  styleUrls  : ['./model-view-network.component.scss']
})
export class ModelViewNetworkComponent implements OnInit {
  private _model: any;
  @ViewChild('diff', {static: true}) diff: TextareaControlComponent;
  public design: string;
  @Input() set model(model) {
    this._model = model;

    this.design = (model && model.design) ? getModelDesign(model.design) : '';
  }
  get model() {
    return this._model;
  }
  @Input () saving: boolean;
  @Output() openNetworkDesignClicked: EventEmitter<any> = new EventEmitter();
  @Output() saveFormData                                = new EventEmitter();
  @Output() cancelClicked                               = new EventEmitter();
  @Output() activateEditClicked                         = new EventEmitter();
  @ViewChild('prototext') prototextSection;
  public inEditMode: boolean                            = false;
  private unsavedValue: string;


  constructor(private dialog: MatDialog) {
  }
  ngOnInit() {
  }

  public openNetworkDesign() {
    this.openNetworkDesignClicked.emit(getModelDesign(this.model.design));
  }

  public getModelDesign(modelDesign) {
    return getModelDesign(modelDesign);
  }

  fieldValueChanged(value: any) {
    this.unsavedValue = value;
    this.design = value;
  }

  activateEdit() {
    this.inEditMode = true;
    this.activateEditClicked.emit();
  }

  saveClicked() {
    this.inEditMode = false;
    this.saveFormData.emit({...this.model, design: this.unsavedValue});
  }

  cancelEdit() {
    this.inEditMode = false;
    this.cancelClicked.emit();
  }
  editPrototext() {
    const editPrototextDialog = this.dialog.open(EditJsonComponent, {
      data: {textData: this.design, readOnly: false, title: 'EDIT MODEL CONFIGURATION', typeJson: false}
    });

    editPrototextDialog.afterClosed().pipe(take(1)).subscribe((data) => {
      if (data === undefined) {
        this.prototextSection.cancelClickedEvent();
      } else {
        this.fieldValueChanged( data);
        this.saveClicked();
      }
    });
  }
}

