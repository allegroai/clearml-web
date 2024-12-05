import {ChangeDetectionStrategy, Component, EventEmitter, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import * as actions from './select-model.actions';
import {clearTableFilter, setSelectedModels, showArchive} from './select-model.actions';
import {
  selectFrameworks,
  selectGlobalFilter, selectModels, selectNoMoreModels, selectSelectedModels, selectSelectedModelsList, selectSelectModelTableFilters, selectShowArchive, selectTableSortFields, selectTags, selectViewMode
} from './select-model.reducer';
import {combineLatest, Observable, of, Subscription} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {ColHeaderTypeEnum, ISmCol, TableSortOrderEnum} from '../shared/ui-components/data/table/table.consts';
import {SelectedModel, TableModel} from '../models/shared/models.model';
import {MODELS_TABLE_COLS, ModelsViewModesEnum} from '../models/models.consts';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {selectAllProjectsUsers, selectProjectSystemTags, selectSelectedProject, selectTablesFilterProjectsOptions} from '../core/reducers/projects.reducer';
import {User} from '~/business-logic/model/users/user';
import {SortMeta} from 'primeng/api';
import {ModelsTableComponent} from '@common/models/shared/models-table/models-table.component';
import {debounceTime, distinctUntilChanged, map, tap} from 'rxjs/operators';
import {Project} from '~/business-logic/model/projects/models';
import {getTablesFilterProjectsOptions, resetTablesFilterProjectsOptions} from '@common/core/actions/projects.actions';
import {isEqual, unionBy} from 'lodash-es';
import {compareLimitations} from '@common/shared/entity-page/footer-items/compare-footer-item';
import {addMessage} from '@common/core/actions/layout.actions';
import {MESSAGES_SEVERITY} from '@common/constants';

@Component({
  selector: 'sm-select-model',
  templateUrl: './select-model.component.html',
  styleUrls: ['./select-model.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectModelComponent implements OnInit, OnDestroy {

  public models$: Observable<SelectedModel[]>;
  public tableSortFields$: Observable<SortMeta[]>;
  public tableSortOrder$: Observable<TableSortOrderEnum>;
  public noMoreModels$: Observable<boolean>;
  public tableFilters$: Observable<{ [s: string]: FilterMetadata }>;
  public searchValue$: Observable<string>;
  public selectedModels$: Observable<Array<TableModel>>;
  public viewMode$: Observable<ModelsViewModesEnum>;
  public users$: Observable<Array<User>>;
  public tags$: Observable<string[]>;
  public systemTags$: Observable<string[]>;
  public tableCols = MODELS_TABLE_COLS;
  public selectedProject$: Observable<Project>;
  public projectsOptions$: Observable<Project[]>;
  public frameworks$: Observable<string[]>;
  private subs = new Subscription();

  public selectedProject: Project;
  private selectedModels: Array<SelectedModel>;
  public tableCols$: Observable<ISmCol[]>;
  public showArchive$: Observable<boolean>;

  constructor(private store: Store,
              public dialogRef: MatDialogRef<ConfirmDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {
                selectionMode: 'multiple' | 'single' | null;
                selectedModels: string[];
                header: string;
                hideShowArchived: boolean;
              }) {
    // this.models$ = this.store.select(selectModelsList);
    this.models$ = combineLatest([
      this.store.select(selectModels),
      this.store.select(selectSelectedModelsList),
    ]).pipe(
      map(([models, selectedModels]) => unionBy(selectedModels, models, 'id')),
      map(models => models?.map(model => ({...model, system_tags: model.system_tags?.map((t => t.replace('archive', ' archive')))})))
    );
    this.tableSortFields$ = this.store.select(selectTableSortFields);
    this.tableFilters$ = this.store.select(selectSelectModelTableFilters);
    this.selectedModels$ = this.store.select(selectSelectedModels).pipe(tap(models => this.selectedModels = models));
    this.viewMode$ = this.store.select(selectViewMode);
    this.searchValue$ = this.store.select(selectGlobalFilter);
    this.noMoreModels$ = this.store.select(selectNoMoreModels);
    this.showArchive$ = this.store.select(selectShowArchive);
    this.users$ = this.store.select(selectAllProjectsUsers);
    this.tags$ = this.store.select(selectTags);
    this.systemTags$ = this.store.select(selectProjectSystemTags);
    this.subs.add(this.store.select(selectSelectedProject).pipe(debounceTime(100))
      .subscribe(selectedProject => {
        this.selectedProject = selectedProject;
        if (selectedProject?.id !== '*') {
          this.store.dispatch(actions.tableFilterChanged({col: {id: 'project.name'}, value: [selectedProject.id]}));
        }
      }));
    this.frameworks$ = this.store.select(selectFrameworks);

    this.projectsOptions$ = this.store.select(selectTablesFilterProjectsOptions);

    this.tableCols$ = of(this.tableCols)
      .pipe(
        distinctUntilChanged((a, b) => isEqual(a, b)),
        map(cols => cols.filter(col => (!col.hidden || col.id === 'project.name')).map(col => ({
            ...col,
            hidden: false,
            headerType: col.headerType === ColHeaderTypeEnum.checkBox ? ColHeaderTypeEnum.title : col.headerType,
            ...(col.id === 'project.name' && {
              getter: 'project',
              filterable: true,
              searchableFilter: true,
              sortable: false,
              headerType: ColHeaderTypeEnum.sortFilter,
            }),
          })
        )));
  }

  @ViewChild(ModelsTableComponent) table: ModelsTableComponent;

  ngOnInit() {
    this.store.dispatch(resetTablesFilterProjectsOptions());
    this.store.dispatch(actions.getNextModels());
    this.store.dispatch(actions.getFrameworks());
    this.store.dispatch(actions.getTags());
    this.data.selectedModels && this.store.dispatch(actions.getSelectedModels({selectedIds: this.data.selectedModels}));
    window.setTimeout(() => this.table.table.rowRightClick = new EventEmitter());
  }

  ngOnDestroy(): void {
    this.store.dispatch(resetTablesFilterProjectsOptions());
    this.store.dispatch(actions.resetSelectModelState({fullReset: false}));
    this.subs.unsubscribe();
  }

  closeDialog(modelId: string) {
    if (modelId) {
      return this.dialogRef.close(modelId);
    }
    return this.dialogRef.close(null);
  }

  closeDialogMultiple() {
    return this.dialogRef.close(this.selectedModels.map(model => model.id));
  }

  getNextModels() {
    this.store.dispatch(actions.getNextModels());
  }

  sortedChanged(sort: { isShift: boolean; colId: ISmCol['id'] }) {
    this.store.dispatch(actions.tableSortChanged({colId: sort.colId, isShift: sort.isShift}));
  }

  filterChanged(filter: { col: ISmCol; value: string }) {
    this.store.dispatch(actions.tableFilterChanged({col: filter.col, value: filter.value}));
  }

  onSearchValueChanged(value: string) {
    this.store.dispatch(actions.globalFilterChanged({filter: value}));
  }

  modelSelectionChanged(event: { model: SelectedModel }) {
    if (this.data.selectionMode !== 'multiple') {
      this.closeDialog(event.model?.id);
    }
  }

  modelsSelectionChanged(models: SelectedModel[]) {
    if (this.data.selectionMode !== 'multiple') {
      return;
    }
    if (models.length === 0) {
      this.store.dispatch(addMessage(MESSAGES_SEVERITY.WARN, 'Compare module should include at least one model'));
      return;
    }
    if (models.length <= compareLimitations) {
      this.store.dispatch(setSelectedModels({models}));
    } else {
      this.store.dispatch(addMessage(MESSAGES_SEVERITY.WARN, compareLimitations + ' or fewer models can be compared'));
    }
  }

  filterSearchChanged({value}: { colId: string; value: { value: string; loadMore?: boolean } }) {
    !value.loadMore && this.store.dispatch(resetTablesFilterProjectsOptions());
    this.store.dispatch(getTablesFilterProjectsOptions({searchString: value.value || '', loadMore: value.loadMore}));
  }

  clearFilters() {
    this.store.dispatch(clearTableFilter());
  }

  showArchives($event: boolean) {
    this.store.dispatch(showArchive({showArchive: $event}));
  }
}
