import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Model} from '../../../../business-logic/model/models/model';
import {getTags} from '../../../core/actions/projects.actions';
import {TagsMenuComponent} from '../../../shared/ui-components/tags/tags-menu/tags-menu.component';
import {Store} from '@ngrx/store';
import {selectProjectTags} from '../../../core/reducers/projects.reducer';
import {Observable} from 'rxjs';
import { removeTag, addTag } from '../../actions/models-menu.actions';
import {ISelectedModel, ITableModel} from '../../shared/models.model';
import {MenuComponent} from '../../../shared/ui-components/panel/menu/menu.component';
import {getSysTags} from '../../model.utils';
import {ActivateModelEdit, CancelModelEdit} from '../../actions/models-info.actions';

@Component({
  selector   : 'sm-model-info-header',
  templateUrl: './model-info-header.component.html',
  styleUrls  : ['./model-info-header.component.scss']
})
export class ModelInfoHeaderComponent {

  public viewId: boolean;
  public tags$: Observable<string[]>;
  public sysTags: string[];

  @Input() editable: boolean;
  @Input() backdropActive: boolean;
  @Output() deselectModel    = new EventEmitter();
  @Output() modelNameChanged = new EventEmitter();
  @ViewChild('tagMenu') tagMenu: MenuComponent;
  @ViewChild('tagsMenuContent') tagMenuContent: TagsMenuComponent;

  constructor(private store: Store<any>) {
    this.tags$ = this.store.select(selectProjectTags);
  }

  private _model: Model | ITableModel | ISelectedModel;

  get model() {
    return this._model;
  }

  @Input() set model(model: Model | ITableModel | ISelectedModel) {
    this._model = model;
    this.viewId = false;
    this.sysTags = getSysTags(model as ITableModel);
  }

  public onNameChanged(name) {
    this.modelNameChanged.emit(name);
  }

  openTagMenu(event: MouseEvent) {
    if (!this.tagMenu) {
      return;
    }
    this.store.dispatch(getTags());
    this.tagMenu.position = {x: event.clientX, y: event.clientY};
    window.setTimeout(() => {
      this.tagMenu.openMenu();
      this.tagMenuContent.focus();
    });
  }

  addTag(tag: string) {
    this.store.dispatch(addTag({tag, models: [this.model as ISelectedModel]}));
  }

  removeTag(tag: string) {
    this.store.dispatch(removeTag({tag, models: [this.model as ISelectedModel]}));
  }

  tagsMenuClosed() {
    this.tagMenuContent.clear();
  }

  editExperimentName(edit: boolean) {
    if (edit) {
      this.store.dispatch(new ActivateModelEdit('ModelName'));
    } else {
      this.store.dispatch(new CancelModelEdit());
    }
  }
}
