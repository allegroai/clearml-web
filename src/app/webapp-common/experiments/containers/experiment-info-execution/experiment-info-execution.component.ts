import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {IExecutionForm, sourceTypesEnum} from '../../../../features/experiments/shared/experiment-execution.model';
import {ISelectedExperiment} from '../../../../features/experiments/shared/experiment-info.model';
import {IExperimentInfoState} from '../../../../features/experiments/reducers/experiment-info.reducer';
import {selectIsExperimentEditable, selectSelectedExperiment, selectShowExtraDataSpinner} from '../../../../features/experiments/reducers';
import * as commonInfoActions from '../../actions/common-experiments-info.actions';
import {selectExperimentExecutionInfoData, selectIsExperimentSaving, selectIsSelectedExperimentInDev} from '../../reducers';
import {selectBackdropActive} from '../../../core/reducers/view-reducer';
import {EditJsonComponent} from '../../../shared/ui-components/overlay/edit-json/edit-json.component';
import {take} from 'rxjs/operators';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {EditableSectionComponent} from '../../../shared/ui-components/panel/editable-section/editable-section.component';
import {ExperimentExecutionSourceCodeComponent} from '../../dumb/experiment-execution-source-code/experiment-execution-source-code.component';
import {getOr} from 'lodash/fp';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'sm-experiment-info-execution',
  templateUrl: './experiment-info-execution.component.html',
  styleUrls: ['./experiment-info-execution.component.scss']
})
export class ExperimentInfoExecutionComponent implements OnInit, OnDestroy {

  public executionInfo$: Observable<IExecutionForm>;
  public showExtraDataSpinner$: Observable<boolean>;
  public selectedExperimentSubscrition: Subscription;
  private selectedExperiment: ISelectedExperiment;
  public editable$: Observable<boolean>;
  public isInDev$: Observable<boolean>;
  public saving$: Observable<boolean>;
  public backdropActive$: Observable<boolean>;
  public formData: IExecutionForm;
  private formDataSubscription: Subscription;
  public minimized: boolean;

  @ViewChild('outputDestination') outputDestination: ElementRef;
  @ViewChild('orchestration') orchestration: ElementRef;
  @ViewChild('sourceCode') sourceCode: ExperimentExecutionSourceCodeComponent;

  @ViewChild('diffSection') diffSection: EditableSectionComponent;
  @ViewChild('requirementsSection') requirementsSection: EditableSectionComponent;
  links = ['details', 'uncommitted changes', 'installed packages'];
  currentLink = 'details';

  constructor(
    private store: Store<IExperimentInfoState>,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {
    this.minimized = getOr(false, 'data.minimized', this.route.snapshot.routeConfig);
    this.executionInfo$ = this.store.select(selectExperimentExecutionInfoData);
    this.showExtraDataSpinner$ = this.store.select(selectShowExtraDataSpinner);
    this.editable$ = this.store.select(selectIsExperimentEditable);
    this.isInDev$ = this.store.select(selectIsSelectedExperimentInDev);
    this.saving$ = this.store.select(selectIsExperimentSaving);
    this.backdropActive$ = this.store.select(selectBackdropActive);
  }

  ngOnInit() {
    this.selectedExperimentSubscrition = this.store.select(selectSelectedExperiment)
      .subscribe(selectedExperiment => {
        this.selectedExperiment = selectedExperiment;
      });
    this.store.dispatch(new commonInfoActions.SetExperimentFormErrors(null));

    this.formDataSubscription = this.executionInfo$.subscribe(formData => {
      this.formData = formData;
    });
  }

  ngOnDestroy(): void {
    this.selectedExperimentSubscrition.unsubscribe();
    this.formDataSubscription.unsubscribe();
  }

  saveSourceData() {
    const source = this.sourceCode.sourceCodeForm.form.value;
    this.store.dispatch(commonInfoActions.saveExperimentSection({
      script: {
        repository: source.repository,
        entry_point: source.entry_point,
        working_dir: source.working_dir,
        ...this.convertScriptType(source)
      }
    }));
  }

  saveOrchestrationData() {
    const docker_cmd = this.orchestration.nativeElement.value;
    this.store.dispatch(commonInfoActions.saveExperimentSection({execution: {docker_cmd}}));
  }

  saveOutputData() {
    const outputDestination = this.outputDestination.nativeElement.value;

    // why BE can't get output.destination as task.edit?
    this.store.dispatch(commonInfoActions.saveExperimentSection({output_dest: outputDestination} as any));
  }

  cancelFormChange() {
    this.store.dispatch(new commonInfoActions.DeactivateEdit());
  }

  activateEditChanged(sectionName) {
    this.store.dispatch(new commonInfoActions.ActivateEdit(sectionName));
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
        this.activateEditChanged('diff');
        this.store.dispatch(commonInfoActions.saveExperimentSection({script: {diff: ''}}));
      }
    });
  }

  editInstallPackages() {
    const editInstallPackagesDialog = this.dialog.open(EditJsonComponent, {
      data: {textData: this.formData?.requirements?.pip, readOnly: false, title: 'EDIT INSTALLED PACKAGES', typeJson: false}
    });

    editInstallPackagesDialog.afterClosed().pipe(take(1)).subscribe((data) => {
      if (data === undefined) {
        this.requirementsSection.cancelClickedEvent();
      } else {
        this.store.dispatch(commonInfoActions.saveExperimentSection({script: {requirements: {...this.formData.requirements, pip: data}}}));
      }
    });
  }

  editDiff() {
    const editDiffDialog = this.dialog.open(EditJsonComponent, {
      data: {textData: this.formData?.diff, readOnly: false, title: 'EDIT UNCOMMITTED CHANGES', typeJson: false}
    });

    editDiffDialog.afterClosed().pipe(take(1)).subscribe((data) => {
      if (data === undefined) {
        this.diffSection.cancelClickedEvent();
      } else {
        this.store.dispatch(commonInfoActions.saveExperimentSection({script: {diff: data}}));
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
        this.activateEditChanged('requirements');
        this.store.dispatch(commonInfoActions.saveExperimentSection({script: {requirements: {...this.formData.requirements, pip: ''}}}));
      }
    });
  }

  private convertScriptType(source: IExecutionForm['source']) {
    switch (source.scriptType) {
      case sourceTypesEnum.Branch:
        return {[sourceTypesEnum.Branch]: source.branch, [sourceTypesEnum.Tag]: '', [sourceTypesEnum.VersionNum]: ''};
      case sourceTypesEnum.Tag:
        return {[sourceTypesEnum.Branch]: source.branch, [sourceTypesEnum.Tag]: source.tag, [sourceTypesEnum.VersionNum]: ''};
      case sourceTypesEnum.VersionNum:
        return {[sourceTypesEnum.Branch]: source.branch, [sourceTypesEnum.Tag]: source.tag, [sourceTypesEnum.VersionNum]: source.version_num};
    }
  }

  showSection(selection: string) {
    this.currentLink = selection;
  }
}
