import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {TIME_FORMAT_STRING} from '@common/constants';
import {Store} from '@ngrx/store';
import {activateEdit, deactivateEdit} from '../../actions/common-experiments-info.actions';
import {EditableSectionComponent} from '@common/shared/ui-components/panel/editable-section/editable-section.component';

export const EXPERIMENT_COMMENT = 'ExperimentComment';

@Component({
  selector: 'sm-experiment-general-info',
  templateUrl: './experiment-general-info.component.html',
  styleUrls: ['./experiment-general-info.component.scss']
})
export class ExperimentGeneralInfoComponent {
  constructor(private store: Store) {}

  commentControl = new UntypedFormControl();
  experimentCommentText: string;
  experimentCommentOriginal: string;

  @ViewChild('experimentDescriptionSection') experimentDescriptionSection: EditableSectionComponent;
  @Input() experiment: IExperimentInfo;
  @Input() editable: boolean;
  @Input() isExample: boolean;

  @Input() set experimentComment(experimentComment: string) {
    this.experimentCommentText = experimentComment;
    this.experimentCommentOriginal = experimentComment;
    this.rebuildCommentControl(experimentComment);
  }

  @Output() commentChanged = new EventEmitter<string>();
  timeFormatString = TIME_FORMAT_STRING;

  rebuildCommentControl(comment) {
    this.commentControl = new UntypedFormControl(comment);
  }

  commentValueChanged(value) {
    this.commentChanged.emit(value?.trim() ?? null);
    this.editExperimentComment(false);
  }

  onCancelComment() {
    this.experimentCommentText = this.experimentCommentOriginal;
    this.editExperimentComment(false);
  }

  editExperimentComment(edit) {
    if (edit) {
      this.store.dispatch(activateEdit(EXPERIMENT_COMMENT));
    } else {
      this.store.dispatch(deactivateEdit());
    }
  }
}
