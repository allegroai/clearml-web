import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ImmutableFormContainer} from '../../../shared/ui-components/forms/immutableFormContainer';
import {IExperimentInfoFormComponent} from '../../../../features/experiments/shared/experiment-info.model';
import {IExecutionForm} from '../../../../features/experiments/shared/experiment-execution.model';
import {HELP_TEXTS} from '../../shared/common-experiments.const';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {take} from 'rxjs/operators';
import {EditJsonComponent} from '../../../shared/ui-components/overlay/edit-json/edit-json.component';

@Component({
  selector: 'sm-experiment-execution-form',
  templateUrl: './experiment-execution-form.component.html',
  styleUrls: ['./experiment-execution-form.component.scss']
})
export class ExperimentExecutionFormComponent extends ImmutableFormContainer implements IExperimentInfoFormComponent, OnInit, OnDestroy {
  @Input() formData: IExecutionForm;
  @Input() showExtraDataSpinner: boolean;
  @Input() editable: boolean;
  @Input() isInDev: boolean;
  @Input() saving = false;
  @Output() freezeForm = new EventEmitter();
  @ViewChild('diffSection') diffSection;
  @ViewChild('requirementsSection') requirementsSection;
  @ViewChild('requirementsForm') requirementsForm;


  HELP_TEXTS = HELP_TEXTS;

  constructor(private dialog: MatDialog) {
    super();
  }

  sectionSaved() {
    this.saveFormData.emit();
  }

  discardDiff() {
    const confirmDialogRef: MatDialogRef<any, boolean> = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Discard diff',
        body: 'Uncommitted changes will be discarded',
        yes: 'Discard',
        no: 'Cancel',
        iconClass: 'al-icon al-ico-trash al-color blue-300',
      }
    });

    confirmDialogRef.afterClosed().pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        this.activateEdit.emit({editMode: true, sectionName: 'diff'});
        this.fieldValueChanged({field: 'diff', value: ''});
        this.saveFormData.emit();
      }
    });
  }

  sectionCancelled() {
    this.cancelFormDataChange.emit();
  }

  activateEditClicked(editMode, sectionName: string) {
    this.activateEdit.emit({editMode: editMode, sectionName: sectionName});
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
  }

  editInstallPackages() {
    const editInstallPackagesDialog = this.dialog.open(EditJsonComponent, {
      data: {textData: this.formData?.requirements?.pip, readOnly: false, title: 'EDIT INSTALLED PACKAGES', typeJson: false}
    });

    editInstallPackagesDialog.afterClosed().pipe(take(1)).subscribe((data) => {
      if (data === undefined) {
        this.requirementsSection.cancelClickedEvent();
      } else {
        this.requirementsForm.fieldValueChanged({field: 'pip', value: data});
        this.sectionSaved();
      }
    });
  }

  editDiff() {
    const editDiffDialog = this.dialog.open(EditJsonComponent, {
      data: {textData: this.formData?.diff, readOnly: false, title: 'EDIT UNCOMMITED CHANGES', typeJson: false}
    });

    editDiffDialog.afterClosed().pipe(take(1)).subscribe((data) => {
      if (data === undefined) {
        this.diffSection.cancelClickedEvent();
      } else {
        this.fieldValueChanged({field: 'diff', value: data});
        this.sectionSaved();
      }
    });
  }

  clearInstalledPackages() {
    const confirmDialogRef: MatDialogRef<any, boolean> = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Clear installed packages',
        body: 'Are you sure you want to clear the entire contents of Installed packages?',
        yes: 'Clear',
        no: 'Keep',
        iconClass: 'al-icon al-ico-trash al-color blue-300',
      }
    });

    confirmDialogRef.afterClosed().pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        this.activateEdit.emit({editMode: true, sectionName: 'requirements'});
        this.fieldValueChanged({field: 'requirements', value: ''});
        this.saveFormData.emit();
      }
    });
  }
}
