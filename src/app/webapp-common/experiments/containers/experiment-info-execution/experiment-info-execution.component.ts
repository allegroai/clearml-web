import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {IExecutionForm, sourceTypesEnum} from '~/features/experiments/shared/experiment-execution.model';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {ExperimentInfoState} from '~/features/experiments/reducers/experiment-info.reducer';
import {
  selectIsExperimentEditable,
  selectSelectedExperiment,
  selectShowExtraDataSpinner
} from '~/features/experiments/reducers';
import * as commonInfoActions from '../../actions/common-experiments-info.actions';
import {
  selectExperimentExecutionInfoData,
  selectIsExperimentSaving,
  selectIsSelectedExperimentInDev
} from '../../reducers';
import {selectBackdropActive, selectHideRedactedArguments} from '@common/core/reducers/view.reducer';
import {EditJsonComponent} from '@common/shared/ui-components/overlay/edit-json/edit-json.component';
import {filter, take} from 'rxjs/operators';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {EditableSectionComponent} from '@common/shared/ui-components/panel/editable-section/editable-section.component';
import {
  ExperimentExecutionSourceCodeComponent
} from '../../dumb/experiment-execution-source-code/experiment-execution-source-code.component';
import {getOr, isUndefined} from 'lodash/fp';
import {ActivatedRoute} from '@angular/router';
import {Container} from '~/business-logic/model/tasks/container';

@Component({
  selector: 'sm-experiment-info-execution',
  templateUrl: './experiment-info-execution.component.html',
  styleUrls: ['./experiment-info-execution.component.scss']
})
export class ExperimentInfoExecutionComponent implements OnInit, OnDestroy {

  public executionInfo$: Observable<IExecutionForm>;
  public showExtraDataSpinner$: Observable<boolean>;
  public selectedExperimentSubscrition: Subscription;
  private selectedExperiment: IExperimentInfo;
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

  @ViewChild('containerImage') containerImage: ElementRef;
  @ViewChild('containerArguments') containerArguments: ElementRef;
  links = ['details', 'uncommitted changes', 'installed packages', 'container'];
  currentLink = 'details';
  public redactedArguments$: Observable<{ key: string }[]>;

  constructor(
    private store: Store<ExperimentInfoState>,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private element: ElementRef
  ) {
    this.minimized = getOr(false, 'data.minimized', this.route.snapshot.routeConfig);
    this.executionInfo$ = this.store.select(selectExperimentExecutionInfoData);
    this.showExtraDataSpinner$ = this.store.select(selectShowExtraDataSpinner);
    this.editable$ = this.store.select(selectIsExperimentEditable);
    this.isInDev$ = this.store.select(selectIsSelectedExperimentInDev);
    this.saving$ = this.store.select(selectIsExperimentSaving);
    this.backdropActive$ = this.store.select(selectBackdropActive);
    this.redactedArguments$ = this.store.select(selectHideRedactedArguments);

  }

  ngOnInit() {
    this.selectedExperimentSubscrition = this.store.select(selectSelectedExperiment)
      .subscribe(selectedExperiment => {
        this.selectedExperiment = selectedExperiment;
      });
    this.store.dispatch(commonInfoActions.setExperimentFormErrors({errors: null}));

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
        /* eslint-disable @typescript-eslint/naming-convention */
        repository: source.repository,
        entry_point: source.entry_point,
        working_dir: source.working_dir,
        /* eslint-enable @typescript-eslint/naming-convention */
        ...this.convertScriptType(source)
      }
    }));
  }

  saveContainerData(container: Container) {
    this.store.dispatch(commonInfoActions.saveExperimentSection({container: {...this.formData.container, ...container}}));
  }

  saveOutputData() {
    const outputDestination = this.outputDestination.nativeElement.value;

    // why BE can't get output.destination as task.edit?
    // eslint-disable-next-line @typescript-eslint/naming-convention
    this.store.dispatch(commonInfoActions.saveExperimentSection({output_dest: outputDestination} as any));
  }

  cancelFormChange() {
    this.store.dispatch(commonInfoActions.deactivateEdit());
  }

  activateEditChanged(sectionName: string, section?: EditableSectionComponent) {
    const element = section?.elementRef?.nativeElement;
    if (element) {
      window.setTimeout(() => {
        const bounding = element.getBoundingClientRect();
        const containerRect = this.element.nativeElement.getBoundingClientRect();
        if (bounding.bottom > window.innerHeight && bounding.top > containerRect.top) {
          this.element.nativeElement.scroll({top: element.offsetTop, behavior: 'smooth'} as ScrollToOptions);
        }
      });
    }
    this.store.dispatch(commonInfoActions.activateEdit(sectionName));
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

  editContainerSetupShellScript(smEditableSection?: EditableSectionComponent) {
    this.openEditJsonDialog({
      textData: this.formData.container?.setup_shell_script,
      title: 'EDIT SETUP SHELL SCRIPT'
    }, smEditableSection)
      .afterClosed()
      .pipe(filter(bool => !isUndefined(bool)))
      .subscribe(setupShellScript => {
        if (this.formData.container.setup_shell_script !== setupShellScript) {
          smEditableSection.saveSection();
          // eslint-disable-next-line @typescript-eslint/naming-convention
          this.store.dispatch(commonInfoActions.saveExperimentSection({
            container: {
              ...this.formData.container,
              setup_shell_script: setupShellScript
            }
          }));
        } else {
          smEditableSection.cancelClickedEvent();
        }
      });
  }

  editInstallPackages() {
    const editInstallPackagesDialog = this.dialog.open(EditJsonComponent, {
      data: {
        textData: this.formData?.requirements?.pip,
        readOnly: false,
        title: 'EDIT INSTALLED PACKAGES',
        typeJson: false
      }
    });

    editInstallPackagesDialog.afterClosed().pipe(take(1)).subscribe((data) => {
      if (data === undefined) {
        this.requirementsSection.cancelClickedEvent();
      } else {
        this.requirementsSection.saveSection();
        this.store.dispatch(commonInfoActions.saveExperimentSection({
          script: {
            requirements: {
              ...this.formData.requirements,
              pip: data
            }
          }
        }));
      }
    });
  }

  editDiff() {
    this.openEditJsonDialog({
      textData: this.formData?.diff,
      readOnly: false,
      title: 'EDIT UNCOMMITTED CHANGES',
      typeJson: false
    }, this.diffSection)
      .afterClosed()
      .pipe(take(1))
      .subscribe((data) => {
        this.diffSection.unsubscribeToEventListener();
        if (!isUndefined(data)) {
          this.store.dispatch(commonInfoActions.saveExperimentSection({script: {diff: data}}));
        }
      });
  }

  clearInstalledPackages() {
    this.clearConfirmDialog('installed packages').pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        this.activateEditChanged('requirements');
        this.store.dispatch(commonInfoActions.saveExperimentSection({script: {requirements: {}}}));
      }
    });
  }

  clearSetupShellScript() {
    this.clearConfirmDialog('setup shell script').pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        this.store.dispatch(commonInfoActions.saveExperimentSection({
          container: {
            ...this.formData.container,
            setup_shell_script: ''
          }
        }));
      }
    });
  }

  private clearConfirmDialog(title: string): Observable<boolean> {
    return this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Clear ${title}`,
        body: `Are you sure you want to clear the entire contents of ${title.charAt(0).toUpperCase() + title.slice(1)}?`,
        yes: 'Clear',
        no: 'Keep',
        iconClass: 'al-icon al-ico-trash al-color blue-300',
      }
    }).afterClosed();

  }

  private openEditJsonDialog(data: { textData: string; readOnly?: boolean; title?: string; typeJson?: boolean }, editableSectionComponent?: EditableSectionComponent): MatDialogRef<EditJsonComponent> {
    const editJsonComponent = this.dialog.open(EditJsonComponent, {
      data
    });
    editJsonComponent.afterClosed().subscribe(res => {
      if (isUndefined(res) && !isUndefined(editJsonComponent)) {
        editableSectionComponent.cancelClickedEvent();
      }
    });
    return editJsonComponent;
  }

  private convertScriptType(source: IExecutionForm['source']) {
    switch (source.scriptType) {
      case sourceTypesEnum.Branch:
        return {[sourceTypesEnum.Branch]: source.branch, [sourceTypesEnum.Tag]: '', [sourceTypesEnum.VersionNum]: ''};
      case sourceTypesEnum.Tag:
        return {
          [sourceTypesEnum.Branch]: source.branch,
          [sourceTypesEnum.Tag]: source.tag,
          [sourceTypesEnum.VersionNum]: ''
        };
      case sourceTypesEnum.VersionNum:
        return {
          [sourceTypesEnum.Branch]: source.branch,
          [sourceTypesEnum.Tag]: source.tag,
          [sourceTypesEnum.VersionNum]: source.version_num
        };
    }
  }

  showSection(selection: string) {
    this.currentLink = selection;
  }
}
