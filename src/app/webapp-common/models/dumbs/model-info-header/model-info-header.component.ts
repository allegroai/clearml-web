import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {TagsMenuComponent} from '@common/shared/ui-components/tags/tags-menu/tags-menu.component';
import {Store} from '@ngrx/store';
import {selectCompanyTags, selectSelectedProjectId, selectTagsFilterByProject} from '@common/core/reducers/projects.reducer';
import {Observable, Subscription} from 'rxjs';
import {addTag, removeTag} from '../../actions/models-menu.actions';
import {SelectedModel, TableModel} from '../../shared/models.model';
import {getSysTags} from '../../model.utils';
import {activateModelEdit, cancelModelEdit} from '../../actions/models-info.actions';
import {
  CountAvailableAndIsDisableSelectedFiltered,
  MenuItems,
  selectionDisabledArchive,
  selectionDisabledDelete,
  selectionDisabledMoveTo,
  selectionDisabledPublishModels
} from '@common/shared/entity-page/items.utils';
import {addMessage} from '@common/core/actions/layout.actions';
import {MatMenuTrigger} from '@angular/material/menu';
import {selectModelsTags} from '@common/models/reducers';

@Component({
  selector   : 'sm-model-info-header',
  templateUrl: './model-info-header.component.html',
  styleUrls  : ['./model-info-header.component.scss']
})
export class ModelInfoHeaderComponent {

  public viewId: boolean;
  private sub = new Subscription();
  public tagsFilterByProject$: Observable<boolean>;
  public projectTags$: Observable<string[]>;
  public companyTags$: Observable<string[]>;
  public sysTags: string[];
  public selectedDisableAvailable: Record<string, CountAvailableAndIsDisableSelectedFiltered>;
  public menuPosition = { x: 0, y: 0 };
  public allProjects: boolean;

  @Input() editable: boolean;
  @Input() backdropActive: boolean;
  @Input() minimized: boolean;
  @Input() isSharedAndNotOwner: boolean;
  @Output() modelNameChanged = new EventEmitter<string>();
  @Output() closeInfoClicked = new EventEmitter();
  @Output() maximizedClicked = new EventEmitter();
  @Output() minimizeClicked = new EventEmitter();
  @ViewChild('tagsMenuTrigger') tagMenuTrigger: MatMenuTrigger;
  @ViewChild(TagsMenuComponent) tagMenu: TagsMenuComponent;

  constructor(private store: Store) {
    this.tagsFilterByProject$ = this.store.select(selectTagsFilterByProject);
    this.projectTags$ = this.store.select(selectModelsTags);
    this.companyTags$ = this.store.select(selectCompanyTags);
    this.sub.add(store.select(selectSelectedProjectId)
      .subscribe(id => {
        this.allProjects = id === '*';
      })
    );
  }

  private _model: TableModel | SelectedModel;

  get model() {
    return this._model;
  }

  @Input() set model(model: TableModel | SelectedModel) {
    if (this._model?.id != model?.id) {
      this.viewId = false;
    }
    this._model = model;
    this.sysTags = getSysTags(model as TableModel);
    this.selectedDisableAvailable = {
      [MenuItems.publish]: selectionDisabledPublishModels([model]),
      [MenuItems.moveTo]: selectionDisabledMoveTo([model]),
      [MenuItems.delete]: selectionDisabledDelete([model]),
      [MenuItems.archive]: selectionDisabledArchive([model])
    };
  }

  public onNameChanged(name) {
    this.modelNameChanged.emit(name);
  }

  openTagMenu() {
    if (!this.tagMenu) {
      return;
    }
    window.setTimeout(() => this.store.dispatch(activateModelEdit('tags')), 200);
    window.setTimeout(() => {
      this.tagMenuTrigger.openMenu();
      this.tagMenu.focus();
    });
  }

  addTag(tag: string) {
    this.store.dispatch(addTag({tag, models: [this.model as SelectedModel]}));
  }

  removeTag(tag: string) {
    this.store.dispatch(removeTag({tag, models: [this.model as SelectedModel]}));
  }

  tagsMenuClosed() {
    this.store.dispatch(cancelModelEdit());
    this.tagMenu.clear();
  }

  editExperimentName(edit: boolean) {
    if (edit) {
      this.store.dispatch(activateModelEdit('ModelName'));
    } else {
      this.store.dispatch(cancelModelEdit());
    }
  }

  copyToClipboard() {
    this.store.dispatch(addMessage('success', 'Copied to clipboard'));
  }
}
