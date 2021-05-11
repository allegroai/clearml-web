import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectExperimentConfigObj, selectExperimentInfoErrors, selectExperimentSelectedConfigObjectFromRoute, selectExperimentUserKnowledge, selectIsExperimentSaving} from '../../reducers';
import {Model} from '../../../../business-logic/model/models/model';
import {Observable, Subscription} from 'rxjs';
import {IExperimentInfo, ISelectedExperiment} from '../../../../features/experiments/shared/experiment-info.model';
import {IExperimentInfoState} from '../../../../features/experiments/reducers/experiment-info.reducer';
import {experimentSectionsEnum} from '../../../../features/experiments/shared/experiments.const';
import {selectIsExperimentEditable, selectSelectedExperiment} from '../../../../features/experiments/reducers';
import {ActivateEdit, CancelExperimentEdit, DeactivateEdit, getExperimentConfigurationObj, saveExperimentConfigObj, SetExperimentErrors, SetExperimentFormErrors} from '../../actions/common-experiments-info.actions';
import {ConfigurationItem} from '../../../../business-logic/model/tasks/configurationItem';
import {EditJsonComponent} from '../../../shared/ui-components/overlay/edit-json/edit-json.component';
import {take} from 'rxjs/operators';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {EditableSectionComponent} from '../../../shared/ui-components/panel/editable-section/editable-section.component';

@Component({
  selector: 'sm-experiment-info-task-model',
  templateUrl: './experiment-info-task-model.component.html',
  styleUrls: ['./experiment-info-task-model.component.scss']
})
export class ExperimentInfoTaskModelComponent implements OnInit, OnDestroy {
  public selectedExperimentSubscription: Subscription;
  private selectedExperiment: IExperimentInfo;
  public editable$: Observable<boolean>;
  public errors$: Observable<IExperimentInfoState['errors']>;
  public userKnowledge$: Observable<Map<experimentSectionsEnum, boolean>>;
  public modelLabels$: Observable<Model['labels']>;
  public saving$: Observable<boolean>;
  private configInfo$: Observable<ConfigurationItem>;
  public selectedConfigObj$: Observable<string>;
  private selectedConfigObjSubscription: Subscription;
  private formDataSubscription: Subscription;
  public formData: ConfigurationItem;

  public sectionReplaceMap = {
    _legacy: 'General',
    properties: 'User Properties',
    design: 'General'
  };

  @ViewChild('prototext') prototext: EditableSectionComponent;

  constructor(private store: Store<IExperimentInfoState>, private dialog: MatDialog) {
    this.configInfo$ = this.store.select(selectExperimentConfigObj);
    this.selectedConfigObj$ = this.store.select(selectExperimentSelectedConfigObjectFromRoute);
    this.editable$ = this.store.select(selectIsExperimentEditable);
    this.errors$ = this.store.select(selectExperimentInfoErrors);
    this.userKnowledge$ = this.store.select(selectExperimentUserKnowledge);
    this.saving$ = this.store.select(selectIsExperimentSaving);
  }

  ngOnInit() {
    this.formDataSubscription = this.configInfo$.subscribe(formData => {
      this.formData = formData;
    });
    this.selectedExperimentSubscription = this.store.select(selectSelectedExperiment)
      .subscribe(selectedExperiment => {
        this.selectedExperiment = selectedExperiment;
      });
    this.selectedConfigObjSubscription = this.selectedConfigObj$.subscribe((confObjName) => {
      if (confObjName) {
        this.store.dispatch(getExperimentConfigurationObj());
      }
    });
    this.store.dispatch(new SetExperimentFormErrors(null));
  }

  ngOnDestroy(): void {
    this.selectedExperimentSubscription.unsubscribe();
    this.selectedConfigObjSubscription.unsubscribe();
  }

  onFormValuesChanged(event: { field: string; value: any }) {
    // this.store.dispatch(new infoActions.ExperimentDataUpdated({id: this.selectedExperiment.id, changes: {[event.field]: event.value}}));
  }

  onFormErrorsChanged(event: { field: string; errors: any }) {
    this.store.dispatch(new SetExperimentErrors({[event.field]: event.errors}));
  }

  saveModelData(configuration: ConfigurationItem[]) {
    this.store.dispatch(saveExperimentConfigObj({configuration}));
    this.store.dispatch(new DeactivateEdit());
  }

  cancelModelChange() {
    this.store.dispatch(new DeactivateEdit());
    this.store.dispatch(new CancelExperimentEdit());
  }

  activateEditChanged(sectionName: string) {
    this.store.dispatch(new ActivateEdit(sectionName));
  }

  editPrototext() {
    const editPrototextDialog = this.dialog.open(EditJsonComponent, {
      data: {textData: this.formData?.value, readOnly: false, title: 'EDIT CONFIGURATION', typeJson: false}
    });

    editPrototextDialog.afterClosed().pipe(take(1)).subscribe((data) => {
      if (data === undefined) {
        this.prototext.cancelClickedEvent();
      } else {
        this.saveModelData([{name: this.formData.name, type: this.formData.type, value: data, description: this.formData.description}]);
        this.store.dispatch(new DeactivateEdit());
      }
    });
  }

  clearPrototext() {
    const confirmDialogRef: MatDialogRef<any, boolean> = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Clear model configuration',
        body: 'Are you sure you want to clear the entire contents of Model Configuration?',
        yes: 'Clear',
        no: 'Keep',
        iconClass: 'al-icon al-ico-trash al-color blue-300',
      }
    });

    confirmDialogRef.afterClosed().pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        this.activateEditChanged('prototext');
        this.saveModelData([{name: this.formData.name, type: this.formData.type, value: '', description: this.formData.description}]);
        this.store.dispatch(new DeactivateEdit());
      }
    });
  }

}
