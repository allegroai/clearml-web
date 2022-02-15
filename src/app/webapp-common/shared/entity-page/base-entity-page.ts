import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Action, ActionCreator, Store} from '@ngrx/store';
import {combineLatest, Observable, of, Subject, Subscription} from 'rxjs';
import {debounceTime, filter, finalize, map, shareReplay, take, takeUntil, throttleTime} from 'rxjs/operators';
import {Project} from '../../../business-logic/model/projects/project';
import {isReadOnly} from '../utils/shared-utils';
import {selectSelectedProject} from '../../core/reducers/projects.reducer';
import {IOutputData} from 'angular-split/lib/interface';
import {SplitComponent} from 'angular-split';
import {selectRouterParams} from '../../core/reducers/router-reducer';
import {ITableExperiment} from '../../experiments/shared/common-experiment-model.model';
import {EntityTypeEnum} from '../../../shared/constants/non-common-consts';
import {IFooterState} from './footer-items/footer-items.models';
import {
  CountAvailableAndIsDisableSelectedFiltered,
  selectionAllHasExample,
  selectionAllIsArchive,
  selectionExamplesCount,
  selectionHasExample
} from './items.utils';

@Component({
  selector: 'sm-base-entity-page',
  template: ''
})
export abstract class BaseEntityPage implements OnInit, AfterViewInit, OnDestroy {
  private dragSub: Subscription;
  protected selectedProject$: Observable<Project>;
  protected showInfoSub: Subscription;
  protected preventUrlUpdate = false;
  protected setSplitSizeAction: any;
  protected selectedExperiments: ITableExperiment[];
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

  abstract createFooterItems(config: {
      entitiesType?: EntityTypeEnum;
      selected$: Observable<Array<any>>;
      showAllSelectedIsActive$?: Observable<boolean>;
      tags$?: Observable<string[]>;
      companyTags$?:   Observable<string[]>;
      projectTags$?: Observable<string[]>;
      tagsFilterByProject$?: Observable<boolean>;
  }): void;
  abstract onFooterHandler({emitValue, item}): void;


  protected constructor(protected store: Store<any>) {
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
    this.destroy$.next();
    this.destroy$.complete();
  }

  dispatchAndLock(action: Action) {
    this.preventUrlUpdate = true;
    this.store.dispatch(action);
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

  protected abstract getParamId(params);

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
}
