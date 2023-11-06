import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {selectGlobalLegendData, selectShowGlobalLegend} from './reducers';
import {combineLatestWith, distinctUntilChanged, filter, withLatestFrom} from 'rxjs/operators';
import {resetSelectCompareHeader, setShowGlobalLegend} from './actions/compare-header.actions';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {getCompanyTags, setBreadcrumbsOptions, setSelectedProject} from '@common/core/actions/projects.actions';
import {selectSelectedProject} from '@common/core/reducers/projects.reducer';
import {Project} from '~/business-logic/model/projects/project';
import {TitleCasePipe} from '@angular/common';
import {resetSelectModelState} from '@common/select-model/select-model.actions';
import {selectProjectType} from '~/core/reducers/view.reducer';
import {ALL_PROJECTS_OBJECT} from '@common/core/effects/projects.effects';
import {trackById} from '@common/shared/utils/forms-track-by';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {getGlobalLegendData} from '@common/experiments-compare/actions/experiments-compare-charts.actions';
import {rgbList2Hex} from '@common/shared/services/color-hash/color-hash.utils';
import {ColorHashService} from '@common/shared/services/color-hash/color-hash.service';
import {SelectModelComponent} from '@common/select-model/select-model.component';
import {SelectExperimentsForCompareComponent} from '@common/experiments-compare/containers/select-experiments-for-compare/select-experiments-for-compare.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'sm-experiments-compare',
  templateUrl: './experiments-compare.component.html',
  styleUrls: ['./experiments-compare.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentsCompareComponent implements OnInit, OnDestroy {
  protected readonly trackById = trackById;
  private subs = new Subscription();
  public entityType: EntityTypeEnum;
  public entityTypeEnum = EntityTypeEnum;
  private selectedProject$: Observable<Project>;
  private readonly modelsFeature: boolean;
  public showGlobalLegend$: Observable<boolean>;
  public globalLegendData$: Observable<{ name: string; tags: string[]; systemTags: string[]; id: string, project: {id: string} }[]>;
  public experimentsColor: { [p: string]: string };
  private ids: string[];
  public duplicateNamesObject: {[name: string]: boolean};

  constructor(private store: Store,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private titleCasePipe: TitleCasePipe,
              private colorHash: ColorHashService,
              private dialog: MatDialog,
              private cdr: ChangeDetectorRef) {
    // updating URL with store query params
    this.selectedProject$ = this.store.select(selectSelectedProject);
    this.entityType = this.activatedRoute.snapshot.data.entityType;
    this.modelsFeature = this.activatedRoute.snapshot.data?.setAllProject;
    this.showGlobalLegend$ = this.store.select(selectShowGlobalLegend);
    this.globalLegendData$ = this.store.select(selectGlobalLegendData);
    if (this.modelsFeature) {
      this.store.dispatch(getCompanyTags());
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.store.dispatch(resetSelectCompareHeader({fullReset: true}));
    this.store.dispatch(resetSelectModelState({fullReset: true}));
  }

  ngOnInit(): void {
    this.subs.add(this.selectedProject$.pipe(filter(selectedProject => (this.modelsFeature && !selectedProject))).subscribe(() =>
      this.store.dispatch(setSelectedProject({project: ALL_PROJECTS_OBJECT}))
    ));

    this.subs.add(this.store.select(selectRouterParams).pipe(
      filter(params => !!params.ids),
      distinctUntilChanged()
    ).subscribe(params => {
      this.ids = params.ids.split(',');
      this.store.dispatch(getGlobalLegendData({ids: params.ids.split(','), entity: this.entityType}));
    }));

    this.subs.add(this.globalLegendData$.pipe(
      combineLatestWith(this.colorHash.getColorsObservable()),
      filter(([entities]) => !!entities),
      distinctUntilChanged()
    ).subscribe(([entities]) => {
      this.experimentsColor = entities?.reduce((acc, exp) => {
        acc[exp.id] = rgbList2Hex(this.colorHash.initColor(`${exp.name}-${exp.id}`));
        return acc;
      }, {} as { [id: string]: string });

      this.duplicateNamesObject = entities.reduce((acc, legendItem) => {
        const experimentName = legendItem.name;
        acc[experimentName] = acc[experimentName] !== undefined;
        return acc;
      }, {} as { [name: string]: boolean });
      this.cdr.detectChanges();
    }));

    this.setupBreadcrumbsOptions();
  }

  setupBreadcrumbsOptions() {
    this.subs.add(this.selectedProject$.pipe(
      withLatestFrom(this.store.select(selectProjectType))
    ).subscribe(([selectedProject, projectType]) => {
      const projectTypeBasePath = {
        projects: 'projects',
        datasets: 'datasets/simple',
        pipelines: 'pipelines'
      };
      if (this.modelsFeature) {
        this.store.dispatch(setBreadcrumbsOptions({
          breadcrumbOptions: {
            showProjects: false,
            featureBreadcrumb: {name: 'Models', url: 'models'},
            subFeatureBreadcrumb: {
              name: `Compare ${this.titleCasePipe.transform(this.entityType)}s`
            },
          }
        }));
      } else {
        this.store.dispatch(setBreadcrumbsOptions({
          breadcrumbOptions: {
            showProjects: !!selectedProject,
            featureBreadcrumb: {
              name: this.titleCasePipe.transform(projectType),
              url: projectType
            },
            subFeatureBreadcrumb: {
              name: `Compare ${this.titleCasePipe.transform(this.entityType)}s`
            },
            projectsOptions: {
              basePath: projectTypeBasePath[projectType],
              filterBaseNameWith: null,
              compareModule: null,
              showSelectedProject: selectedProject && selectedProject?.id !== '*',
              ...(selectedProject && {
                selectedProjectBreadcrumb: {
                  name: selectedProject?.id === '*' ? `All ${this.titleCasePipe.transform(this.entityType)}s` : selectedProject?.basename,
                  url: `${projectTypeBasePath[projectType]}/${selectedProject?.id}/${this.entityType === 'model' ? 'model' : 'experiment'}s`
                }
              })
            }
          }
        }));
      }
    }));
  }

  removeExperiment(exp: { name: string; tags: string[]; id: string }) {
    const newParams = this.ids.filter(id => id !== exp.id).join();
    this.router.navigateByUrl(this.router.url.replace(this.ids.toString(), newParams));
  }

  closeLegend() {
    this.store.dispatch(setShowGlobalLegend());
  }

  getExperimentNameForColor(experiment): string {
    return `${experiment.name}-${experiment.id}`;
  }

  openAddExperimentSearch() {
    if (this.entityType === EntityTypeEnum.model) {
      const selectedIds = this.ids ?? [];
      this.dialog.open(SelectModelComponent, {
        data: {
          selectionMode: 'multiple',
          selectedModels: selectedIds,
          header: 'Select compared model'
        },
        height: '94vh',
        width: '98%',
        maxWidth: '100%'
      }).afterClosed().pipe(filter(ids => !!ids)).subscribe(ids => this.updateUrl(ids));
    } else {
      this.dialog.open(SelectExperimentsForCompareComponent, {
        data: {entityType: this.entityType},
        height: '94vh',
        width: '98%',
        maxWidth: '100%'
      }).afterClosed().pipe(filter(ids => !!ids)).subscribe(ids => this.updateUrl(ids));
    }
  }

  updateUrl(ids: string[]) {
    this.router.navigate(
      [{ids}, ...this.activatedRoute.firstChild?.snapshot.url.map(segment => segment.path)],
      {
        queryParamsHandling: 'preserve',
        relativeTo: this.activatedRoute,
      });
  }

  buildUrl(target: { name: string; tags: string[]; systemTags: string[], id: string, project: {id: string} }) {
    const projectOrPipeline = this.activatedRoute.root.firstChild.routeConfig.path.replace('datasets', 'datasets/simple/');
    const targetEntity = this.activatedRoute.snapshot.parent.data.entityType === EntityTypeEnum.model ? EntityTypeEnum.model : EntityTypeEnum.experiment;
    return [`/${projectOrPipeline}`, target.project?.id || '*', `${targetEntity}s`, target.id];
  }
}
