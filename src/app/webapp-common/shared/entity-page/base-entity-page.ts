import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActionCreator, Store} from '@ngrx/store';
import {combineLatest, Observable, of, Subject, Subscription} from 'rxjs';
import {
  debounceTime,
  filter,
  map,
  take,
  takeUntil,
  tap,
  throttleTime,
  withLatestFrom
} from 'rxjs/operators';
import {Project} from '~/business-logic/model/projects/project';
import {
  selectAllProjectsUsers,
  selectProjectUsers,
  selectRootProjects,
  selectSelectedProject
} from '../../core/reducers/projects.reducer';
import {IOutputData} from 'angular-split/lib/interface';
import {SplitComponent} from 'angular-split';
import {selectRouterParams} from '../../core/reducers/router-reducer';
import {ITableExperiment} from '../../experiments/shared/common-experiment-model.model';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {IFooterState} from './footer-items/footer-items.models';
import {
  CountAvailableAndIsDisableSelectedFiltered,
  selectionAllHasExample,
  selectionAllIsArchive,
  selectionExamplesCount,
  selectionHasExample
} from './items.utils';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {resetProjectSelection} from '@common/core/actions/projects.actions';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {RefreshService} from '@common/core/services/refresh.service';
import {selectTableModeAwareness} from '@common/projects/common-projects.reducer';
import {setTableModeAwareness} from '@common/projects/common-projects.actions';
import {User} from '~/business-logic/model/users/user';
import {neverShowPopupAgain} from '../../core/actions/layout.actions';
import {selectNeverShowPopups} from '../../core/reducers/view.reducer';
import {SmSyncStateSelectorService} from '../../core/services/sync-state-selector.service';
import {isReadOnly} from '@common/shared/utils/is-read-only';

@Component({
  selector: 'sm-base-entity-page',
  template: ''
})
export abstract class BaseEntityPageComponent implements OnInit, AfterViewInit, OnDestroy {
  public selectedProject$: Observable<Project>;
  protected setSplitSizeAction: any;
  protected addTag: ActionCreator<string, any>;
  protected abstract setTableModeAction: ActionCreator<string, any>;
  public shouldOpenDetails = false;
  protected sub = new Subscription();
  public selectedExperiments: ITableExperiment[];
  public projectId: string;
  public isExampleProject: boolean;
  public selectSplitSize$?: Observable<number>;
  public infoDisabled: boolean;
  public splitInitialSize: number;
  public minimizedView: boolean;
  public footerItems = [];
  public footerState$: Observable<IFooterState<any>>;
  public tableModeAwareness$: Observable<boolean>;
  private tableModeAwareness: boolean;
  private destroy$ = new Subject();
  public users$: Observable<User[]>;
  public projectsOptions$: Observable<Project[]>;

  @ViewChild('split') split: SplitComponent;
  protected abstract inEditMode$: Observable<boolean>;

  abstract onFooterHandler({emitValue, item}): void;

  abstract getSelectedEntities();

  abstract afterArchiveChanged();

  protected abstract getParamId(params);

  abstract refreshList(auto: boolean);


  get selectedProject() {
    return this.route.parent.snapshot.params.projectId;
  }

  protected constructor(
    protected store: Store,
    protected route: ActivatedRoute,
    protected router: Router,
    protected dialog: MatDialog,
    protected refresh: RefreshService,
    protected syncSelector: SmSyncStateSelectorService,
  ) {
    this.users$ = this.selectedProject === '*' ? this.store.select(selectAllProjectsUsers) : this.store.select(selectProjectUsers);
    this.selectedProject$ = this.store.select(selectSelectedProject);
    this.selectedProject$.pipe(filter(p => !!p), take(1)).subscribe((project: Project) => {
      this.isExampleProject = isReadOnly(project);
    });
    this.projectsOptions$ = combineLatest([
      this.selectedProject$.pipe(filter(p => !!p?.id)),
      this.store.select(selectRootProjects).pipe(filter(p => p !== null)),
    ]).pipe(map(([selectedProject, rootProjects]) => {
      if (selectedProject?.id === '*') {
        return rootProjects;
      } else {
        return [selectedProject].concat(selectedProject?.sub_projects ?? []);
      }
    }));

    this.tableModeAwareness$ = store.select(selectTableModeAwareness)
      .pipe(
        filter(featuresAwareness => featuresAwareness !== null && featuresAwareness !== undefined),
        tap(aware => this.tableModeAwareness = aware)
      );
  }

  ngOnInit() {
    this.selectSplitSize$?.pipe(filter(x => !!x), take(1))
      .subscribe(x => this.splitInitialSize = x);

    this.sub.add(this.store.select(selectRouterParams).subscribe(
      params => {
        const minimized = !!this.getParamId(params);
        if (this.split && this.minimizedView === true && !minimized) {
          this.splitInitialSize = this.split.getVisibleAreaSizes()[1] as number;
        }
        this.minimizedView = minimized;
      }
    ));

    this.sub.add(this.refresh.tick
      .pipe(
        withLatestFrom(this.inEditMode$),
        filter(([, edit]) => !edit),
        map(([auto]) => auto)
      )
      .subscribe(auto => this.refreshList(auto === null))
    );
  }

  ngAfterViewInit() {
    if (this.setSplitSizeAction) {
      this.sub.add(this.split.dragProgress$.pipe(throttleTime(100))
        .subscribe((progress) => this.store.dispatch(this.setSplitSizeAction({splitSize: progress.sizes[1] as number})))
      );
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.footerItems = [];
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  closePanel(queryParams?: Params) {
    window.setTimeout(() => this.infoDisabled = false);
    this.store.dispatch(this.setTableModeAction({mode: 'table'}));
    return this.router.navigate(this.minimizedView ? [{}] : [], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams
    });
  }

  splitSizeChange(event: IOutputData) {
    if (this.setSplitSizeAction) {
      this.store.dispatch(this.setSplitSizeAction({splitSize: event.sizes[1] as number}));
    }
    this.infoDisabled = false;
  }

  disableInfoPanel() {
    this.infoDisabled = true;
  }

  clickOnSplit() {
    this.infoDisabled = false;
  }

  tableModeUserAware() {
    if (this.tableModeAwareness === true) {
      this.store.dispatch(setTableModeAwareness({awareness: false}));
    }
  }

  tagSelected({tags, emitValue}, entitiesType: 'models' | 'experiments' | 'dataviews') {
    this.store.dispatch(this.addTag({
      tag: tags,
      [entitiesType]: emitValue
    }));
  }

  createFooterItems(config: {
    entitiesType: EntityTypeEnum;
    selected$: Observable<Array<any>>;
    showAllSelectedIsActive$: Observable<boolean>;
    data$?: Observable<Record<string, CountAvailableAndIsDisableSelectedFiltered>>;
    tags$?: Observable<string[]>;
    companyTags$?: Observable<string[]>;
    projectTags$?: Observable<string[]>;
    tagsFilterByProject$?: Observable<boolean>;
  }) {
    this.footerState$ = this.createFooterState(
      config.selected$,
      config.data$,
      config.showAllSelectedIsActive$,
      config.companyTags$,
      config.projectTags$,
      config.tagsFilterByProject$
    );
  }

  createFooterState<T = any>(
    selected$: Observable<Array<any>>,
    data$?: Observable<Record<string, CountAvailableAndIsDisableSelectedFiltered>>,
    showAllSelectedIsActive$?: Observable<boolean>,
    companyTags$?: Observable<string[]>,
    projectTags$?: Observable<string[]>,
    tagsFilterByProject$?: Observable<boolean>
  ): Observable<IFooterState<T>> {
    data$ = data$ || of({});
    projectTags$ = projectTags$ || of([]);
    companyTags$ = companyTags$ || of([]);
    tagsFilterByProject$ = tagsFilterByProject$ || of(true);
    return combineLatest(
      [
        selected$,
        data$,
        showAllSelectedIsActive$,
        companyTags$,
        projectTags$,
        tagsFilterByProject$
      ]
    ).pipe(
      takeUntil(this.destroy$),
      debounceTime(100),
      filter(([selected]) => selected.length > 1),
      map(([selected, data, showAllSelectedIsActive, companyTags, projectTags, tagsFilterByProject]) => {
          const _selectionAllHasExample = selectionAllHasExample(selected);
          const _selectionHasExample = selectionHasExample(selected);
          const _selectionExamplesCount = selectionExamplesCount(selected);
          const isArchive = selectionAllIsArchive(selected);
          return {
            selectionHasExample: _selectionHasExample,
            selectionAllHasExample: _selectionAllHasExample,
            selectionIsOnlyExamples: _selectionExamplesCount.length === selected.length,
            selected,
            selectionAllIsArchive: isArchive,
            data,
            showAllSelectedIsActive,
            companyTags,
            projectTags,
            tagsFilterByProject
          };
        }
      ),
      filter(({selected, data}) => !!selected && !!data)
    );
  }

  archivedChanged(isArchived: boolean) {
    const navigate = () => this.closePanel({archive: isArchived || null}).then(() => {
      this.afterArchiveChanged();
      this.store.dispatch(resetProjectSelection());
    });
    if (this.getSelectedEntities().length > 0 && !this.syncSelector.selectSync(selectNeverShowPopups)?.includes('go-to-archive')) {
      const archiveDialog: MatDialogRef<any> = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Are you sure?',
          body: 'Navigating between "Live" and "Archive" will deselect your selected data views.',
          yes: 'Proceed',
          no: 'Back',
          iconClass: '',
          showNeverShowAgain: true
        }
      });

      archiveDialog.afterClosed().subscribe((confirmed) => {
        if (confirmed) {
          navigate();
          if (confirmed.neverShowAgain) {
            this.store.dispatch(neverShowPopupAgain({popupId: 'go-to-archive'}));
          }
        }
      });
    } else {
      navigate();
    }
  }

  updateUrl(queryParams: Params) {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams
    });
  }
}
