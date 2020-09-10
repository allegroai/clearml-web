import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IExperimentModelInfo} from '../../shared/common-experiment-model.model';
import {Model} from '../../../../business-logic/model/models/model';
import {ImmutableFormContainer} from '../../../shared/ui-components/forms/immutableFormContainer';
import {IExperimentInfoFormComponent} from '../../../../features/experiments/shared/experiment-info.model';
import {experimentSectionsEnum, experimentSections} from '../../../../features/experiments/shared/experiments.const';
import {HELP_TEXTS} from '../../shared/common-experiments.const';
import {getModelDesign} from '../../../tasks/tasks.utils';

@Component({
  selector   : 'sm-experiment-output-model-form',
  templateUrl: './experiment-output-model-form.component.html',
  styleUrls  : ['./experiment-output-model-form.component.scss']
})
export class ExperimentOutputModelFormComponent extends ImmutableFormContainer implements OnInit, IExperimentInfoFormComponent {

  HELP_TEXTS = HELP_TEXTS;

  public readonly experimentSections = experimentSections;

  public modelProjectId: string;

  @Input() editable: boolean;
  @Input() controlName = 'model';
  _formData: IExperimentModelInfo;
  public outputDesign: any;
  private designKey: string;
  @Input() set formData(formData: IExperimentModelInfo){
    this._formData = formData;
    const design = getModelDesign(formData?.output?.design)
    this.outputDesign = design.value ;
    this.designKey = design.key;
  };
  get formData(){
    return this._formData;
  }
  @Input() userKnowledge: Map<experimentSectionsEnum, boolean>;
  @Input() modelLabels: Model['labels'];
  @Input() saving;

  @Output() updateSectionKnowledge = new EventEmitter<experimentSectionsEnum>();
  @Output() modelSelected          = new EventEmitter<{
    model: Model,
    fieldsToPopulate: { labelEnum: boolean; networkDesign: boolean; }
  }>();


  ngOnInit(): void {
    // parent
    super.ngOnInit();
    this.modelProjectId = this.formData.input.project && this.formData.input.project.id ? this.formData.input.project.id : '*';
  }

  activateEditClicked(editMode, sectionName: string) {
    this.activateEdit.emit({editMode: editMode, sectionName: sectionName});

  }

}
