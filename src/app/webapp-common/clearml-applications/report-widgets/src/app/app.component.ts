import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {filter, map, switchMap, take} from 'rxjs/operators';
import {Environment} from '../environments/base';
import {getParcoords, getPlot, getSample, getScalar, getSingleValues, reportsPlotlyReady} from './app.actions';
import {
  ReportsApiMultiplotsResponse,
  selectNoPermissions,
  selectParallelCoordinateExperiments,
  selectPlotData,
  selectReportsPlotlyReady,
  selectSampleData,
  selectSignIsNeeded,
  selectSingleValuesData,
  selectTaskData
} from './app.reducer';
import {ExtFrame} from '@common/shared/single-graph/plotly-graph-base';
import {DebugSample} from '@common/shared/debug-sample/debug-sample.reducer';
import {getSignedUrl, setS3Credentials} from '@common/core/actions/common-auth.actions';
import {ConfigurationService} from '@common/shared/services/configuration.service';
import {_mergeVariants, convertMultiPlots, mergeMultiMetricsGroupedVariant, prepareMultiPlots, tryParseJson} from '@common/tasks/tasks.utils';
import {selectSignedUrl} from '@common/core/reducers/common-auth-reducer';
import {loadExternalLibrary} from '@common/shared/utils/load-external-library';
import {ImageViewerComponent} from '@common/shared/debug-sample/image-viewer/image-viewer.component';
import {cloneDeep, get} from 'lodash-es';
import {MetricsPlotEvent} from '~/business-logic/model/events/metricsPlotEvent';
import {SingleGraphComponent} from '@common/shared/single-graph/single-graph.component';
import {setCurrentDebugImage} from '@common/shared/debug-sample/debug-sample.actions';
import {isFileserverUrl} from '~/shared/utils/url';
import {MetricValueType, SelectedMetric} from '@common/experiments-compare/experiments-compare.constants';
import {ExtraTask} from '@common/experiments-compare/dumbs/parallel-coordinates-graph/parallel-coordinates-graph.component';
import {EventsGetTaskSingleValueMetricsResponseValues} from '~/business-logic/model/events/eventsGetTaskSingleValueMetricsResponseValues';
import {ScalarKeyEnum} from '~/business-logic/model/reports/scalarKeyEnum';


type WidgetTypes = 'plot' | 'scalar' | 'sample' | 'parcoords' | 'single';

@Component({
  selector: 'sm-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  title = 'report-widgets';
  public plotData: ExtFrame;
  public frame: DebugSample;
  public parcoords: any;
  public plotLoaded: boolean;
  private environment: Environment;
  public activated: boolean = false;
  private searchParams: URLSearchParams;
  private otherSearchParams: URLSearchParams;
  public type: WidgetTypes;
  public singleGraphHeight;
  public hideMaximize: 'show' | 'hide' | 'disabled' = 'show';
  public signIsNeeded$: Observable<boolean>;
  public noPermissions$: Observable<boolean>;
  public isDarkTheme: boolean;
  public externalTool: boolean = false;
  public parcoordsData: { experiments: ExtraTask[]; params: string[]; metric: SelectedMetric; valueType: MetricValueType };
  @ViewChild(SingleGraphComponent) 'singleGraph': SingleGraphComponent;
  public singleValueData: EventsGetTaskSingleValueMetricsResponseValues[];
  public webappLink: string;
  public readonly xaxis: ScalarKeyEnum;

  @HostListener('window:resize')
  onResize() {
    this.singleGraph?.redrawPlot();
  }

  constructor(
    private store: Store,
    private configService: ConfigurationService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef) {
    this.configService.globalEnvironmentObservable.subscribe(env => {
      this.environment = env;
    });
    this.signIsNeeded$ = store.select(selectSignIsNeeded);
    this.noPermissions$ = store.select(selectNoPermissions);
    this.searchParams = new URLSearchParams(window.location.search);
    this.type = this.searchParams.get('type') as WidgetTypes;
    this.webappLink = this.buildSourceLink(this.searchParams, '*', null);
    this.singleGraphHeight = window.innerHeight;
    this.otherSearchParams = this.getOtherSearchParams();
    this.isDarkTheme = !this.searchParams.get('light');
    this.xaxis = this.searchParams.get('xaxis') as ScalarKeyEnum;

    try {
      const data = JSON.parse(localStorage.getItem('_saved_state_'));
      data.auth && this.store.dispatch(setS3Credentials(data.auth.s3BucketCredentials));
    } catch (e) {
      console.log(e);
    }

  }

  private getOtherSearchParams() {
    const paramsToRemove = ['light', 'type', 'tasks', 'models', 'objects', 'objectType', 'metrics', 'variants', 'iterations', 'company', 'value_type'];
    const otherSearchParams = new URLSearchParams(window.location.search);
    paramsToRemove.forEach(key => {
      otherSearchParams.delete(key);
    });
    return otherSearchParams;
  }

  ngOnInit(): void {
    try {
      if (!(window.top as any).holdIframe) {
        this.activate();
      }
    } catch (e) {
      this.externalTool = true;
      this.hideMaximize = 'hide';
      console.log('no-access-to-parent-window');
      this.activate();
    }

    switch (this.type) {
      case 'plot':
        this.getPlotData();
        break;
      case 'scalar':
        this.getScalars();
        break;
      case 'sample':
        this.getSample();
        break;
      case 'parcoords':
        this.getParallelCoordinate();
        break;
      case 'single':
        this.getSingleValues();
    }

    window.addEventListener('message', (e) => {
      if (e.data == 'renderPlot') {
        this.activate();
      } else if (e.data == 'resizePlot' && this.plotLoaded) {
        this.singleGraph?.redrawPlot();
      } else if (e.data == 'disableMaximize' && this.hideMaximize !== 'hide') {
        this.hideMaximize = 'disabled';
      }
    });

    this.store.select(selectTaskData)
      .pipe(
        filter(taskData => !!taskData),
        take(1))
      .subscribe(({sourceProject, sourceTasks, appId}) => {
        this.webappLink = appId ? this.buildAppLink(sourceTasks, appId) : this.buildSourceLink(this.searchParams, sourceProject, sourceTasks);
        this.cdr.detectChanges();
      });
  }

  /// Merging all variants of same metric to same graph. (single experiment)
  mergeVariants = (plots: ReportsApiMultiplotsResponse): { [metric: string]: any } => {
    let previousPlotIsMergable = true;
    return (Object.values(plots) as any).reduce((groupedPlots, pplot) => {
      Object.values(pplot).forEach((exp) => {
        (Object.values(Object.values(exp)[0])[0] as { name: string; plots: Array<MetricsPlotEvent> }).plots.forEach((plot, index) => {
          const metric = plot.metric;
          groupedPlots[metric] = cloneDeep(groupedPlots[metric]) || null;
          const plotParsed = tryParseJson(plot.plot_str);
          if (groupedPlots[metric] && ['scatter', 'bar'].includes(plotParsed?.data?.[0]?.type) && previousPlotIsMergable) {
            groupedPlots[metric].plotParsed = {...groupedPlots[metric].plotParsed, data: _mergeVariants(groupedPlots[metric].plotParsed.data, plotParsed.data)};
          } else {
            groupedPlots[metric] = {...plot, plotParsed};
          }
          previousPlotIsMergable = index > -1 || (index === -1 && ['scatter', 'bar'].includes(plotParsed.data[0]?.type));
        });
      });
      return groupedPlots;
    }, {});
  };

  private getPlotData() {
    this.store.select(selectReportsPlotlyReady).pipe(
      filter(ready => !!ready),
      switchMap(() => this.store.select(selectPlotData)),
      filter(plot => !!plot),
      take(1))
      .subscribe((metricsPlots) => {
        this.plotLoaded = true;
        if (this.isSingleExperiment(metricsPlots)) {
          const merged = this.mergeVariants(metricsPlots as ReportsApiMultiplotsResponse);
          this.plotData = Object.values(merged)[0].plotParsed;
        } else {
          const {merged,} = prepareMultiPlots(metricsPlots);
          const newGraphs = convertMultiPlots(merged);
          const originalObject = this.searchParams.get('objects');
          const series = this.searchParams.get('series');
          this.plotData = Object.values(newGraphs)[0]?.find(a => originalObject === (a.task ?? a.data[0].task)) ??
            Object.values(newGraphs)[0].find(a => (a.data[0] as any).seriesName === series) ??
            Object.values(newGraphs)[0]?.[0];
        }


        if ((this.plotData?.layout?.images?.length ?? 0) > 0) {
          this.plotData.layout.images.forEach((image: Plotly.Image) => {
              this.store.dispatch(getSignedUrl({
                url: image.source,
                config: {skipFileServer: false, skipLocalFile: false}
              }));
              this.store.select(selectSignedUrl(image.source))
                .pipe(
                  filter(signed => !!signed?.signed),
                  map(({signed: signedUrl}) => signedUrl),
                  take(1)
                ).subscribe(url => {
                image.source = url;
                this.plotLoaded = true;
                this.cdr.detectChanges();
              });
            }
          );
        } else {
          this.plotLoaded = true;
          this.cdr.detectChanges();
        }


      });
  };

  private isSingleExperiment(metricsPlots: any) {
    try {
      return Object.keys(Object.values(Object.values(metricsPlots)[0])[0]).length === 1;
    } catch (e) {
      return false;
    }
  }

  private getScalars() {
    this.store.select(selectReportsPlotlyReady).pipe(
      filter(ready => !!ready),
      switchMap(() => this.store.select(selectPlotData)),
      filter(plot => !!plot),
      take(1))
      .subscribe(metrics => {
        this.plotLoaded = true;

        const lala = [ScalarKeyEnum.IsoTime, ScalarKeyEnum.Timestamp].includes(this.xaxis) ? this.calcXaxis(metrics) : metrics;

        this.plotData = Object.values(mergeMultiMetricsGroupedVariant(lala))?.[0]?.[0];
        this.cdr.detectChanges();
      });
  }

  private getParallelCoordinate() {
    this.store.select(selectReportsPlotlyReady).pipe(
      filter(ready => !!ready),
      switchMap(() => this.store.select(selectParallelCoordinateExperiments)),
      filter(experiments => !!experiments),
      take(1))
      .subscribe(experiments => {
        this.parcoordsData = {
          experiments,
          valueType: this.searchParams.get('value_type') as MetricValueType,
          metric: {path: this.searchParams.get('metrics'), name: this.findMetricName(this.searchParams.get('metrics'), experiments)},
          params: this.searchParams.getAll('variants')
        };
        this.cdr.detectChanges();
      });
  }


  private getSample() {
    this.store.select(selectSampleData)
      .pipe(filter(sample => !!sample))
      .subscribe(sample => {
        const url = new URL(sample.url);
        if (isFileserverUrl(sample.url) && this.searchParams.get('company')) {
          url.searchParams.append('tenant', this.searchParams.get('company'));
        }
        this.store.dispatch(getSignedUrl({url: url.toString()}));
        this.store.select(selectSignedUrl(url.toString()))
          .pipe(
            filter(signed => !!signed?.signed),
            map(({signed: signedUrl}) => signedUrl),
            take(1)
          ).subscribe((signedUrl) => {
          this.frame = {...sample, url: signedUrl};
          this.activated = true;
          this.cdr.detectChanges();
        });

      });
  }

  private getSingleValues() {
    this.store.select(selectSingleValuesData)
      .pipe(
        filter(singleValueData => !!singleValueData),
        take(1)
      ).subscribe(singleValueData => {
      this.singleValueData = singleValueData.values;
      this.cdr.detectChanges();
    });
  }

  activate = async () => {
    this.activated = true;
    await this.waitForVisibility();
    this.singleGraphHeight = window.innerHeight;
    !['sample', 'single'].includes(this.type) && loadExternalLibrary(this.store, this.environment.plotlyURL, reportsPlotlyReady);
    const models = this.searchParams.has('models') || this.searchParams.get('objectType') === 'model';
    const objects = this.searchParams.getAll('objects');
    const queryParams = {
      tasks: objects.length > 0 ? objects : this.searchParams.getAll('tasks'),
      metrics: this.searchParams.getAll('metrics'),
      variants: this.searchParams.getAll('variants'),
      iterations: this.searchParams.getAll('iterations').map(iteration => parseInt(iteration, 10)),
      company: this.searchParams.get('company') || '',
      xaxis: this.searchParams.get('xaxis') || '',
      models
    };

    switch (this.type) {
      case 'plot':
        this.store.dispatch(getPlot({...queryParams, otherSearchParams: this.otherSearchParams}));
        break;
      case 'scalar':
        this.store.dispatch(getScalar({...queryParams, otherSearchParams: this.otherSearchParams}));
        break;
      case 'sample':
        this.store.dispatch(getSample({...queryParams, otherSearchParams: this.otherSearchParams}));
        break;
      case 'parcoords':
        this.store.dispatch(getParcoords({...queryParams, otherSearchParams: this.otherSearchParams}));
        break;
      case 'single':
        this.store.dispatch(getSingleValues({...queryParams, otherSearchParams: this.otherSearchParams}));
        break;
    }
  };


  loadStyle(styleName: string) {
    const head = document.getElementsByTagName('head')[0];

    const themeLink = document.getElementById(
      'client-theme'
    ) as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = styleName;
    } else {
      const style = document.createElement('link');
      style.id = 'client-theme';
      style.rel = 'stylesheet';
      style.href = `${styleName}`;

      head.appendChild(style);
    }
  }

  maximize() {
    this.loadStyle('trains-icons.css');
    window.top.postMessage({
      maximizing: true,
      name: window.name,
      src: window.location.href
    }, '*');
  }

  sampleClicked({src}) {
    this.store.dispatch(setCurrentDebugImage({event: this.frame}));
    this.maximize();
    this.dialog.open(ImageViewerComponent, {
      data: {
        url: src,
        withoutNavigation: true
      },
      panelClass: ['image-viewer-dialog'],
      height: '100%',
      maxHeight: 'auto',
      width: '100%',
      maxWidth: 'auto'
    }).beforeClosed().subscribe(() => this.maximize());
  }

  private findMetricName(metric: string, experiments: ExtraTask[]) {
    const experimentWithCurrentMetric = experiments.find(exp => get(exp.last_metrics, metric));
    const lastMetric = get(experimentWithCurrentMetric.last_metrics, metric) as ExtraTask['last_metrics'];
    return `${lastMetric.metric}/${lastMetric.variant}`;
  }

  private buildSourceLink(searchParams: URLSearchParams, project: string, tasks: string[]): string {
    const isModels = searchParams.has('models') || this.searchParams.get('objectType') === 'model';
    const objects = searchParams.getAll('objects');
    const variants = searchParams.getAll('variants');
    const metricPath = searchParams.get('metrics') || '';
    let entityIds = objects.length > 0 ? objects : searchParams.getAll(isModels ? 'models' : 'tasks');
    if (entityIds.length === 0 && tasks?.length > 0) {
      entityIds = tasks;
    }
    const isCompare = entityIds.length > 1;
    let url = `${window.location.origin.replace('4201', '4200')}/projects/${project ?? '*'}/`;
    if (isCompare) {
      url += `${isModels ? 'compare-models;ids=' : 'compare-experiments;ids='}${entityIds.join(',')}/
${this.getComparePath(this.type)}?metricPath=${metricPath}&metricName=lala${variants.map(par => `&params=${par}`).join('')}`;
    } else {
      url += `${isModels ? 'models/' : 'experiments/'}${entityIds}/${this.getOutputPath(isModels, this.type)}`;
    }
    return url;
  }

  private getOutputPath(isModels: boolean, type: WidgetTypes) {
    if (isModels) {
      switch (type) {
        case 'single':
        case 'scalar':
          return 'scalars';
        case 'plot':
          return 'plots';
      }
    } else {
      switch (type) {
        case 'single':
        case 'scalar':
          return 'info-output/metrics/scalar';
        case 'plot':
          return 'info-output/metrics/plots';
        case 'sample':
          return 'info-output/debugImages';
      }
    }
  }

  private getComparePath(type: WidgetTypes) {
    switch (type) {
      case 'single':
      case 'scalar':
        return 'scalars/graph';
      case 'plot':
        return 'metrics-plots';
      case 'parcoords':
        return 'hyper-params/graph';
      case 'sample':
        return 'debug-images';
    }
  }

  private buildAppLink(sourceTasks: string[], appId) {
    const isAutoscaler = appId.includes('autoscaler');
    return `${window.location.origin.replace('4201', '4200')}/${isAutoscaler ? 'workers-and-queues/autoscalers' : 'applications'}/${appId}/info;experimentId=${sourceTasks[0]}?instancesFilter=All`;
  }

  private waitForVisibility(): Promise<boolean> {
    return new Promise(resolve => {
      if (window.innerHeight > 0) {
        return resolve(true);
      }

      const observer = new IntersectionObserver(entities => {
        if (entities[0].intersectionRatio > 0) {
          resolve(true);
          observer.disconnect();
        }
      });

      observer.observe(document.body);
    });
  }

  private calcXaxis(metrics: MetricsPlotEvent[] | ReportsApiMultiplotsResponse) {
    return Object.keys(metrics).reduce((groupAcc, groupName) => {
      const group = metrics[groupName];
      groupAcc[groupName] = Object.keys(group).reduce((graphAcc, graphName) => {
        const expGraph = group[graphName];
        graphAcc[graphName] = {};
        Object.keys(expGraph).reduce((graphAcc2, exp) => {
          const graph = expGraph[exp];
          return graphAcc[graphName][exp] = {...graph, x: graph.x.map(ts => new Date(ts))};
        }, {});
        return graphAcc;
      }, {});
      return groupAcc;
    }, {});
  }
}

