import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActionCreator, Store} from '@ngrx/store';
import {combineLatest, Observable, of, Subject, Subscription} from 'rxjs';
import {debounceTime, filter, map, take, takeUntil, throttleTime} from 'rxjs/operators';
import {Project} from '~/business-logic/model/projects/project';
import {isReadOnly} from '../utils/shared-utils';
import {selectSelectedProject} from '../../core/reducers/projects.reducer';
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

@Component({
  selector: 'sm-base-entity-page',
  template: ''
})
export abstract class BaseEntityPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private dragSub: Subscription;
  protected selectedProject$: Observable<Project>;
  protected showInfoSub: Subscription;
  protected setSplitSizeAction: any;
  public selectedExperiments: ITableExperiment[];
  protected addTag: ActionCreator<string, any>;
  public projectId: string;
  public isExampleProject: boolean;
  public selectSplitSize$?: Observable<number>;
  public infoDisabled: boolean;
  public splitInitialSize: number;
  public minimizedView: boolean;
  public footerItems = [];
  public footerState$: Observable<IFooterState<any>>;
  private destroy$ = new Subject();

  @ViewChild('split') split: SplitComponent;

  abstract onFooterHandler({emitValue, item}): void;
  abstract getSelectedEntities();
  abstract afterArchiveChanged();
  protected abstract getParamId(params);

  protected constructor(
    protected store: Store,
    protected route: ActivatedRoute,
    protected router: Router,
    protected dialog: MatDialog
  ) {
    this.selectedProject$ = this.store.select(selectSelectedProject);
    this.selectedProject$.pipe(filter(p => !!p), take(1)).subscribe((project: Project) => {
      this.isExampleProject = isReadOnly(project);
    });
  }

  ngOnInit() {
    this.selectSplitSize$?.pipe(filter(x => !!x), take(1))
      .subscribe(x => this.splitInitialSize = x);

    this.showInfoSub = this.store.select(selectRouterParams).subscribe(
      params => {
        const minimized = !!this.getParamId(params);
        if (this.split && this.minimizedView === true && !minimized) {
          this.splitInitialSize = this.split.getVisibleAreaSizes()[1] as number;
        }
        this.minimizedView = minimized;
      }
    );
  }

  ngAfterViewInit() {
    if (this.setSplitSizeAction) {
      this.dragSub = this.split.dragProgress$.pipe(throttleTime(100))
        .subscribe((progress) => this.store.dispatch(this.setSplitSizeAction({splitSize: progress.sizes[1] as number})));
    }
  }

  ngOnDestroy(): void {
    this.dragSub?.unsubscribe();
    this.showInfoSub?.unsubscribe();
    this.footerItems = [];
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  closePanel(queryParams?: Params) {
    window.setTimeout(() => this.infoDisabled = false);
    return this.router.navigate(this.minimizedView ? [{}]: [], {relativeTo: this.route, queryParamsHandling: 'merge', queryParams});
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
      filter(({selected, data}) => !!selected && !!data),
      //shareReplay()
    );
  }

  archivedChanged(isArchived: boolean) {
    const navigate = () => {
      return this.closePanel({archive: isArchived || null}).then(() => {
        this.afterArchiveChanged();
        this.store.dispatch(resetProjectSelection());
      });
    };

    if (this.getSelectedEntities().length > 0) {
      const archiveDialog: MatDialogRef<any> = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Are you sure?',
          body: 'Navigating between "Live" and "Archive" will deselect your selected data views.',
          yes: 'Proceed',
          no: 'Back',
          iconClass: ''
        }
      });

      archiveDialog.afterClosed().subscribe((confirmed) => {
        if (confirmed) {
          navigate();
        }
      });
    } else {
      navigate();
    }
  }

  updateUrl (queryParams: Params) {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams
    })
  }

}
