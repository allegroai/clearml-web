import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {IExperimentInfo} from '../../../../features/experiments/shared/experiment-info.model';
import {TIME_FORMAT_STRING} from '../../../constants';
import {Store} from '@ngrx/store';
import {ActivateEdit, DeactivateEdit} from '../../actions/common-experiments-info.actions';
import {selectCurrentActiveSectionEdit} from '../../reducers';
import {filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {EditableSectionComponent} from '../../../shared/ui-components/panel/editable-section/editable-section.component';

export const EXPERIMENT_COMMENT = 'ExperimentComment';

@Component({
  selector: 'sm-experiment-general-info',
  templateUrl: './experiment-general-info.component.html',
  styleUrls: ['./experiment-general-info.component.scss']
})
export class ExperimentGeneralInfoComponent implements AfterViewInit, OnDestroy {
  constructor(private store: Store<any>) {
  }

  commentControl = new FormControl();
  experimentCommentText: string;
  experimentCommentOriginal: string;
  private selectCurrentActiveSectionEditSub: Subscription;
  @ViewChild('experimentDescriptionSection') private experimentDescriptionSection: EditableSectionComponent;
  @Input() experiment: IExperimentInfo;
  @Input() editable: boolean;
  @Input() isExample: boolean;

  // TODO: remove ISelectedExperiment and use the form object...
  @Input() set experimentComment(experimentComment: string) {
    this.experimentCommentText = experimentComment;
    this.experimentCommentOriginal = experimentComment;
    this.rebuildCommentControl(experimentComment);
  }

  @Output() commentChanged = new EventEmitter<string>();
  TIME_FORMAT_STRING = TIME_FORMAT_STRING;

  ngAfterViewInit() {
    this.selectCurrentActiveSectionEditSub = this.store.select(selectCurrentActiveSectionEdit)
      .pipe(filter(currentActiveSectionEdit => currentActiveSectionEdit === EXPERIMENT_COMMENT))
      .subscribe(() => {
        this.experimentDescriptionSection.editModeChanged(true);
      });
  }

  rebuildCommentControl(comment) {
    this.commentControl = new FormControl(comment);
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
      this.store.dispatch(new ActivateEdit(EXPERIMENT_COMMENT));
    } else {
      this.store.dispatch(new DeactivateEdit());
    }
  }

  ngOnDestroy() {
    this.selectCurrentActiveSectionEditSub?.unsubscribe();
  }

}
