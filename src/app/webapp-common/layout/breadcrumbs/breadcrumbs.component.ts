import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectRouterConfig, selectRouterQueryParams} from '../../core/reducers/router-reducer';
import {debounceTime, filter, withLatestFrom} from 'rxjs/operators';
import {ActivatedRoute, NavigationStart, Router, RouterLink} from '@angular/router';
import {combineLatest, fromEvent, Observable, Subscription} from 'rxjs';
import {addMessage} from '../../core/actions/layout.actions';
import {ConfigurationService} from '../../shared/services/configuration.service';
import {
  GetCurrentUserResponseUserObjectCompany
} from '~/business-logic/model/users/getCurrentUserResponseUserObjectCompany';
import {
  selectDefaultNestedModeForFeature,
  selectIsDeepMode,
  selectProjectAncestors,
  selectSelectedProject,
  selectSelectedProjectId,
  selectShowHiddenUserSelection
} from '../../core/reducers/projects.reducer';
import {selectIsSearching} from '../../common-search/common-search.reducer';
import {MESSAGES_SEVERITY} from '@common/constants';
import {setBreadcrumbs} from '@common/core/actions/router.actions';
import {selectBreadcrumbs} from '@common/core/reducers/view.reducer';
import {routeConfToProjectType} from '~/features/projects/projects-page.utils';
import {isExample} from '@common/shared/utils/shared-utils';
import {MatMenuModule} from '@angular/material/menu';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {NgForOf, NgIf, TitleCasePipe} from '@angular/common';
import {
  ShowTooltipIfEllipsisDirective
} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';
import {ClipboardModule} from 'ngx-clipboard';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';

export enum CrumbTypeEnum {
  Workspace = 'Workspace',
  Feature = 'Feature',
  Project = 'Project',
  SubFeature = 'SubFeature',
}

export interface IBreadcrumbsLink {
  name?: string;
  url?: string;
  subCrumbs?: { name: string; url: string; hidden?: boolean }[];
  isProject?: boolean;
  type?: CrumbTypeEnum;
  hidden?: boolean;
  collapsable?: boolean;
  example?: boolean;
}

@Component({
  selector: 'sm-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatMenuModule,
    TooltipDirective,
    NgForOf,
    ShowTooltipIfEllipsisDirective,
    ClipboardModule,
    RouterLink,
    NgIf,
    ClickStopPropagationDirective
  ],
  standalone: true
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  public breadcrumbs: IBreadcrumbsLink[][] = [];
  public currentUrl: string;
  public showShareButton: boolean = false;
  public isCommunity: boolean;
  public archive: boolean;
  public workspaceNeutral: boolean;
  public isDeep: boolean;
  public subProjectsMenuIsOpen: boolean;
  public lastSegment: string;
  public shouldCollapse: boolean;
  private sub = new Subscription();
  private isSearching$ = this.store.select(selectIsSearching);

  @Input() activeWorkspace: GetCurrentUserResponseUserObjectCompany;
  @ViewChild('container') private breadCrumbsContainer: ElementRef;
  private expandedSize: number;
  public breadcrumbs$: Observable<IBreadcrumbsLink[][]>;
  public showHidden: boolean;
  public projectFeature: boolean;

  constructor(
    private store: Store<any>,
    public route: ActivatedRoute,
    private router: Router,
    private configService: ConfigurationService,
    private cd: ChangeDetectorRef,
    private ref: ElementRef,
    private titleCasePipe: TitleCasePipe
  ) {
    this.breadcrumbs$ = this.store.select(selectBreadcrumbs);
  }

  ngOnInit() {
    this.sub.add(fromEvent(window, 'resize')
      .pipe(debounceTime(100))
      .subscribe(() => {
        this.calcOverflowing();
        this.cd.detectChanges();
      })
    );

    this.sub.add(this.breadcrumbs$.subscribe(breadcrumbs => {
      this.breadcrumbs = breadcrumbs.map(breadcrumbsGroup => breadcrumbsGroup.filter(breadcrumb => (!breadcrumb.hidden) || (this.showHidden && this.projectFeature))).filter(breadcrumbsGroup => breadcrumbsGroup.length > 0);
      this.cd.detectChanges();
    }));

    this.sub.add(this.breadcrumbs$.pipe(debounceTime(300)).subscribe(() => {
      this.calcOverflowing();
      this.cd.detectChanges();

    }));

    this.sub.add(this.isSearching$.pipe(debounceTime(300)).subscribe(() => {
        if (!this.shouldCollapse) {
          this.calcOverflowing();
          this.cd.detectChanges();
        }
      })
    );

    this.sub.add(this.configService.globalEnvironmentObservable.subscribe(env => this.isCommunity = env.communityServer));

    this.sub.add(this.store.select(selectIsDeepMode).subscribe(isDeep => {
        this.isDeep = isDeep;
        this.cd.detectChanges();
      })
    );
    this.sub.add(this.store.select(selectRouterConfig).subscribe(config => {
      let route = this.route.snapshot;
      while (route.firstChild) {
        route = route.firstChild;
      }
      !config?.includes(':projectId') && route?.data?.staticBreadcrumb && this.store.dispatch(setBreadcrumbs({
        breadcrumbs: route?.data?.staticBreadcrumb
      }));
    }));

    this.sub.add(this.router.events
      .pipe(
        filter(event => event instanceof NavigationStart),
        withLatestFrom(this.store.select(selectSelectedProjectId)),
        filter(([event, projectId]) => projectId && !(event as any)?.url?.includes(projectId))
      )
      .subscribe(
        () => {
          this.store.dispatch(setBreadcrumbs({breadcrumbs: [[]]}));
        }));

    this.sub.add(combineLatest([
        this.store.select(selectRouterConfig),
        this.store.select(selectRouterQueryParams),
        this.store.select(selectShowHiddenUserSelection),
        this.store.select(selectProjectAncestors),
        this.store.select(selectSelectedProject),
        this.store.select(selectDefaultNestedModeForFeature)
      ]).pipe(
        debounceTime(200),
      ).subscribe(([config, params, showHidden, projectAncestors, selectedProject, nestedModeForFeature]) => {
        const compareNameMap = {
          projects: 'Experiments',
          datasets: 'Versions',
          pipelines: 'Runs'
        };
        this.showHidden = showHidden;
        this.projectFeature = config?.[0] === 'projects';
        const nestedDatasets = ['simple', 'hyper'].includes(config?.[1]);
        const isCompareExperiments = config?.includes('compare-experiments');
        const isCompareModels = config?.includes('compare-models');
        const isDeep = params?.deep === 'true';
        const isPipelinesControllers = config?.[0] === 'pipelines' && config?.[2]?.includes('experiments');
        const isSimpleDatasetsTasksView = config?.[0] === 'datasets' && config?.[3]?.includes('experiments');
        !!config && config.includes(':projectId') && (projectAncestors !== null || selectedProject?.id === '*')
        && this.resetShouldCollapse() && this.store.dispatch(setBreadcrumbs({
          breadcrumbs: [[{
            name: config[0].toUpperCase(),
            url: nestedModeForFeature[routeConfToProjectType(config)] ? `${config[0]}/${nestedDatasets ? config[1] + '/' : ''}/*/projects` : config[0],
            type: CrumbTypeEnum.Feature
          }],
            ...(projectAncestors?.length > 0 ? [projectAncestors?.filter(ancestor => (this.projectFeature || !['.datasets', '.pipelines', '.reports'].includes(ancestor.basename)))
              .map(ancestor => ({
                name: ancestor.basename,
                example: isExample(ancestor),
                url: `${config[0]}/${nestedDatasets ? config[1] + '/' : ''}${ancestor.id}/projects`,
                type: CrumbTypeEnum.Project,
                hidden: ancestor.hidden,
                collapsable: true
              }))] : []),
            ...(!!selectedProject && (!['.datasets', '.pipelines', '.reports'].includes(selectedProject.basename) || config[0] === 'projects') && (selectedProject.id !== '*' || (selectedProject.id === '*' && config[0] === 'projects')) ? [[{
              name: selectedProject.id === '*' && config[0] === 'projects' ? `All ${isCompareExperiments ? 'Experiments' : isCompareModels ? 'Models' : this.titleCasePipe.transform(config[2])}` : selectedProject.basename,
              example: isExample(selectedProject),
              type: CrumbTypeEnum.Project,
              hidden: selectedProject.hidden && !isSimpleDatasetsTasksView && !isPipelinesControllers,
              url: `${config[0]}/${nestedDatasets ? config[1] + '/' : ''}${selectedProject.id}/${isCompareExperiments ? 'experiments' : isCompareModels ? 'models' : 'projects'}`,
            }]] : []),
            ...((isDeep && selectedProject.id !== '*') ? [[{
              name: `All ${this.titleCasePipe.transform(config[2])}`,
              type: CrumbTypeEnum.SubFeature
            }]] : []),
            ...(isCompareExperiments ? [[{
              name: `Compare ${compareNameMap[config[0]]}`,
              type: CrumbTypeEnum.SubFeature
            }]] : []),
            ...(isCompareModels ? [[{
              name: `Compare Models`,
              type: CrumbTypeEnum.SubFeature
            }]] : []),
          ]
        }));
        this.archive = !!params?.archive;
        let route = this.route.snapshot;
        let hide = false;
        while (route.firstChild) {
          route = route.firstChild;
          if (route.data.workspaceNeutral !== undefined) {
            hide = route.data.workspaceNeutral;
          }
        }
        this.lastSegment = route.parent?.url[0]?.path;
        this.workspaceNeutral = hide;
        this.cd.detectChanges();
      })
    );
  }

  private calcOverflowing() {
    if (!this.shouldCollapse) {
      this.expandedSize = this.breadCrumbsContainer?.nativeElement.scrollWidth;
    }
    this.shouldCollapse = this.ref?.nativeElement.clientWidth < this.expandedSize;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  openShareModal() {
    this.currentUrl = window.location.href;
  }

  copyToClipboardSuccess() {
    this.store.dispatch(addMessage(MESSAGES_SEVERITY.SUCCESS, 'URL copied successfully'));
  }


  subProjectsMenuOpened(b: boolean) {
    this.subProjectsMenuIsOpen = b;
  }

  private resetShouldCollapse() {
    this.shouldCollapse = false;
    return true;
  }
}
