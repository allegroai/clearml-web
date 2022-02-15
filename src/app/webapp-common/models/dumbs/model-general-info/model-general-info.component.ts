import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {getOr} from 'lodash/fp';
import {SelectedModel} from '../../shared/models.model';
import {NA} from '../../../../app.constants';
import {TAGS} from '../../../tasks/tasks.constants';
import {DatePipe} from '@angular/common';
import {TIME_FORMAT_STRING} from '../../../constants';
import {Store} from '@ngrx/store';
import {ActivateModelEdit, CancelModelEdit} from '../../actions/models-info.actions';
import {AdminService} from '~/shared/services/admin.service';
import {getSignedUrl} from '../../../core/actions/common-auth.actions';
import {selectSignedUrl} from '../../../core/reducers/common-auth-reducer';
import {filter, map, take} from 'rxjs/operators';

@Component({
  selector: 'sm-model-general-info',
  templateUrl: './model-general-info.component.html',
  styleUrls: ['./model-general-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelGeneralInfoComponent {
  constructor(private datePipe: DatePipe, private store: Store<any>, private adminService: AdminService) {
  }

  public kpis: {label: string; value: string, downloadable?: boolean; href?: string; task?: string}[];
  private _model: SelectedModel;
  public isLocalFile: boolean;

  @Input() editable: boolean;
  @Input() projectId: string;

  @Input() set model(model: SelectedModel) {
    this._model = model;
    if (model) {
      this.isLocalFile = this.adminService.isLocalFile(model.uri);
      this.kpis = [
        {label: 'CREATED AT', value: model.created ? (this.datePipe.transform(model.created, TIME_FORMAT_STRING)) : 'NA'},
        {label: 'UPDATED AT', value: model.last_update ? (this.datePipe.transform(model.last_update, TIME_FORMAT_STRING)) : 'NA'},
        {label: 'FRAMEWORK', value: model.framework || NA},
        {label: 'STATUS', value: (model.ready !== undefined) ? (model.ready ? 'Published' : 'Draft') : NA},
        {label: 'MODEL URL', value: model.uri || NA, downloadable: true},
        {label: 'USER', value: getOr(NA, 'user.name', model)},
        {
          label: 'CREATING EXPERIMENT', value: getOr(false, 'task.name', model),
          href: `/projects/${getOr('*', 'task.project.id', model)}/experiments/${getOr('', 'task.id', model)}`,
          task: getOr(false, 'task.id', model)
        },
        {label: 'ARCHIVED', value: model && model.system_tags && model.system_tags.includes(TAGS.HIDDEN) ? 'Yes' : 'No'},
        {label: 'PROJECT', value: getOr(NA, 'project.name', model)},
      ];
    }
  }

  get model(): SelectedModel {
    return this._model;
  }

  @Output() showModel = new EventEmitter();
  @Output() commentChanged = new EventEmitter<string>();

  commentValueChanged(value) {
    this.commentChanged.emit(value);
  }

  public canShowModel() {
    return !!this.model && !'Custom'.includes(this.model.framework);
  }

  onShowModel() {
    this.showModel.emit(this.model);
  }

  editExperimentComment(edit) {
    edit && this.store.dispatch(new ActivateModelEdit('ModelComment'));
  }

  cancelEdit() {
    this.store.dispatch(new CancelModelEdit());
  }

  downloadModelClicked() {
    const url = this.model.uri;
    this.store.dispatch(getSignedUrl({url}));
    this.store.select(selectSignedUrl(url))
      .pipe(
        filter(signed => !!signed?.signed),
        map(({signed: signedUrl}) => signedUrl),
        take(1)
      ).subscribe(signed => {
      const a = document.createElement('a') as HTMLAnchorElement;
      a.target = '_blank';
      a.href = signed;
      a.click();
    });
  }
}
