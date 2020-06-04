import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {IExperimentModelInfo} from '../../shared/common-experiment-model.model';
import {Model} from '../../../../business-logic/model/models/model';
import {ImmutableFormContainer} from '../../../shared/ui-components/forms/immutableFormContainer';
import {IExperimentInfoFormComponent} from '../../../../features/experiments/shared/experiment-info.model';
import {experimentSectionsEnum} from '../../../../features/experiments/shared/experiments.const';
import {HELP_TEXTS} from '../../shared/common-experiments.const';
import {EditJsonComponent} from '../../../shared/ui-components/overlay/edit-json/edit-json.component';
import {take} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector   : 'sm-experiment-models-form',
  templateUrl: './experiment-models-form.component.html',
  styleUrls  : ['./experiment-models-form.component.scss']
})
export class ExperimentModelsFormComponent extends ImmutableFormContainer implements OnInit, IExperimentInfoFormComponent {

  HELP_TEXTS = HELP_TEXTS;
  public modelProjectId: string;

  constructor(private dialog: MatDialog) {
    super();
  }

  @Input() editable: boolean;
  @Input() controlName = 'model';
  @Input() formData: IExperimentModelInfo;
  @Input() userKnowledge: Map<experimentSectionsEnum, boolean>;
  @Input() modelLabels: Model['labels'];
  @Input() saving;
  @Output() updateSectionKnowledge = new EventEmitter<experimentSectionsEnum>();
  @Output() modelSelected = new EventEmitter<{
    model: Model,
    fieldsToPopulate: { labelEnum: boolean; networkDesign: boolean; }
  }>();
  @ViewChild('prototext') prototextSection;


  ngOnInit(): void {
    // parent
    super.ngOnInit();
    this.modelProjectId = this.formData.input && this.formData.input.project && this.formData.input.project.id ? this.formData.input.project.id : '*';
  }

  onModelSelected(event) {
    this.modelSelected.emit(event);
    this.sectionSaved();
  }

  sectionSaved() {
    this.saveFormData.emit();
  }

  sectionCancelled() {
    this.cancelFormDataChange.emit();
  }

  activateEditClicked(editMode, sectionName: string) {
    this.activateEdit.emit({editMode: editMode, sectionName: sectionName});
  }

  editPrototext() {
    const editPrototextDialog = this.dialog.open(EditJsonComponent, {
      data: {textData: this.formData?.prototext, readOnly: false, title: 'EDIT MODEL CONFIGURATION', typeJson: false}
    });

    editPrototextDialog.afterClosed().pipe(take(1)).subscribe((data) => {
      if (data === undefined) {
        this.prototextSection.cancelClickedEvent();
      } else {
        this.fieldValueChanged({field: 'prototext', value: data});
        this.sectionSaved();
      }
    });
  }
}
