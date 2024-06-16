import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {selectRouterConfig, selectRouterParams} from '@common/core/reducers/router-reducer';
import {Store} from '@ngrx/store';
import * as infoActions from '../../actions/models-info.actions';
import {selectIsModelInEditMode, selectSelectedModel, selectSelectedTableModel, selectSplitSize} from '../../reducers';
import {SelectedModel} from '../../shared/models.model';
import {Observable, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, withLatestFrom} from 'rxjs/operators';
import {addMessage, setAutoRefresh} from '@common/core/actions/layout.actions';
import {selectBackdropActive} from '@common/core/reducers/view.reducer';
import {setTableMode} from '@common/models/actions/models-view.actions';
import {isReadOnly} from '@common/shared/utils/is-read-only';
import {MESSAGES_SEVERITY} from '@common/constants';
import {toggleSettings} from '@common/experiments/actions/common-experiment-output.actions';
import {Link} from '@common/shared/components/router-tab-nav-bar/router-tab-nav-bar.component';
import {selectIsSharedAndNotOwner} from '~/features/experiments/reducers';
import {RefreshService} from '@common/core/services/refresh.service';
import {getCompanyTags, setBreadcrumbsOptions, setSelectedProject} from '@common/core/actions/projects.actions';
import {selectSelectedProject} from '@common/core/reducers/projects.reducer';
import {Project} from '~/business-logic/model/projects/project';
import {ALL_PROJECTS_OBJECT} from '@common/core/effects/projects.effects';
import {ModelsInfoEffects} from '@common/models/effects/models-info.effects';
import {headerActions} from '@common/core/actions/router.actions';


@Component({
  selector: 'sm-model-info',
  templateUrl: './model-info.component.html',
  styleUrls: ['./model-info.component.scss']
})
export class ModelInfoComponent implements OnInit, OnDestroy {
  public minimized: boolean;

  public selectedModel: SelectedModel;
  private sub = new Subscription();
  public selectedModel$: Observable<SelectedModel | null>;
  public isExample: boolean;
  public backdropActive$: Observable<boolean>;
  public selectedTableModel$: Observable<SelectedModel>;
  public scalars$: Observable<boolean>;
  public splitSize$: Observable<number>;
  links = [
    {name: 'general', url: ['general']},
    {name: 'network', url: ['network']},
    {name: 'labels', url: ['labels']},
    {name: 'metadata', url: ['metadata']},
    {name: 'lineage', url: ['experiments']},
    {name: 'scalars', url: ['scalars']},
    {name: 'plots', url: ['plots']},
  ] as Link[];
  public isSharedAndNotOwner$: Observable<boolean>;
  public toMaximize: boolean;
  private isModelInEditMode$: Observable<boolean>;
  private selectedProject$: Observable<Project>;
  private modelsFeature: boolean;

  constructor(
    private router: Router,
    private store: Store,
    private route: ActivatedRoute,
    private refresh: RefreshService,
    private cdr: ChangeDetectorRef,
    private modelInfoEffect: ModelsInfoEffects
  ) {
    this.backdropActive$ = this.store.select(selectBackdropActive);
    this.selectedTableModel$ = this.store.select(selectSelectedTableModel);
    this.splitSize$ = this.store.select(selectSplitSize);
    this.isSharedAndNotOwner$ = this.store.select((selectIsSharedAndNotOwner));
    this.isModelInEditMode$ = this.store.select(selectIsModelInEditMode);
    this.selectedProject$ = this.store.select(selectSelectedProject);
    this.modelsFeature = this.route.snapshot.data?.setAllProject;
    if (this.modelsFeature) {
      this.store.dispatch(setSelectedProject({project: ALL_PROJECTS_OBJECT}));
      this.store.dispatch(getCompanyTags());
    }
    this.minimized = this.route.snapshot.firstChild?.data.minimized;
    if (!this.minimized) {
      this.setupBreadcrumbsOptions();
    }
  }

  ngOnInit() {
    this.scalars$ = this.store.select(selectRouterConfig)
      .pipe(
        filter(c => !!c),
        distinctUntilChanged(),
        map((config: string[]) => config.includes('scalars'))
      );

    this.sub.add(this.store.select(selectSelectedModel)
      .subscribe(model => {
        this.selectedModel = model;
        this.isExample = isReadOnly(model);
        this.cdr.detectChanges();
      })
    );

    this.sub.add(this.store.select(selectRouterParams)
      .pipe(
        debounceTime(150),
        map(params => params?.modelId),
        filter(modelId => !!modelId),
        distinctUntilChanged()
      )
      .subscribe(id => this.store.dispatch(infoActions.getModelInfo({id})))
    );

    this.sub.add(this.refresh.tick
      .pipe(
        withLatestFrom(this.isModelInEditMode$),
        filter(([, isModelInEditMode]) => !isModelInEditMode && !this.minimized)
      ).subscribe(([auto]) => {
        if (auto === null) {
          this.store.dispatch(infoActions.refreshModelInfo(this.selectedModel.id));
        } else {
          this.store.dispatch(infoActions.getModelInfo({id: this.selectedModel.id}));
        }
      })
    );

    this.selectedModel$ = this.store.select(selectSelectedModel)
      .pipe(filter(model => !!model));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    if (!this.toMaximize) {
      this.modelInfoEffect.previousSelectedId = null;
      this.modelInfoEffect.previousSelectedLastUpdate = null;
      this.store.dispatch(infoActions.setModelInfo({model: null}));
    }
  }

  public updateModelName(name: string) {
    if (name.trim().length > 2) {
      this.store.dispatch(infoActions.updateModelDetails({id: this.selectedModel.id, changes: {name}}));
    } else {
      this.store.dispatch(addMessage(MESSAGES_SEVERITY.ERROR, 'Name must be more than three letters long'));
    }
  }

  public getReadyStatus(ready) {
    if (ready === null) {
      return null;
    }
    return ready ? 'published' : 'created';
  }

  toggleSettingsBar() {
    this.store.dispatch(toggleSettings());
  }

  closePanel() {
    this.store.dispatch(setTableMode({mode: 'table'}));
    return this.router.navigate(['..'], {relativeTo: this.route, queryParamsHandling: 'merge'});
  }

  maximize() {
    const last = this.route.snapshot.firstChild.url[0].path;
    this.store.dispatch(headerActions.setTabs({contextMenu: null}));
    return this.router.navigate(['output', last], {relativeTo: this.route, queryParamsHandling: 'preserve'});
  }

  minimizeView() {
    const last = this.route.snapshot.firstChild.url[0].path;
    return this.router.navigate(['..', last], {relativeTo: this.route, queryParamsHandling: 'preserve'});
  }

  setAutoRefresh($event: boolean) {
    this.store.dispatch(setAutoRefresh({autoRefresh: $event}));
  }

  setupBreadcrumbsOptions() {
    this.sub.add(this.selectedProject$.pipe(
    ).subscribe((selectedProject) => {
      if (this.modelsFeature) {
        this.store.dispatch(setBreadcrumbsOptions({
          breadcrumbOptions: {
            showProjects: false,
            featureBreadcrumb: {name: 'Models'},
          }
        }));
      } else {
        this.store.dispatch(setBreadcrumbsOptions({
          breadcrumbOptions: {
            showProjects: !!selectedProject,
            featureBreadcrumb: {
              name: 'PROJECTS',
              url: 'projects'
            },
            projectsOptions: {
              basePath: 'projects',
              filterBaseNameWith: null,
              compareModule: null,
              showSelectedProject: selectedProject?.id !== '*',
              ...(selectedProject && {selectedProjectBreadcrumb: {name: selectedProject?.id === '*' ? 'All Models' : selectedProject?.basename}})
            }
          }
        }));
      }
    }));
  }
}

