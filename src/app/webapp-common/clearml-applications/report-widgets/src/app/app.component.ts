import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {filter, map, switchMap, take} from 'rxjs/operators';
import {Environment} from '../environments/base';
import {getPlot, getSample, getScalar, reportsPlotlyReady} from './app.actions';
import {ReportsApiMultiplotsResponse, selectPlotData, selectReportsPlotlyReady, selectSampleData, selectSignIsNeeded, State} from './app.reducer';
import {ExtFrame} from '@common/shared/single-graph/plotly-graph-base';
import {DebugSample} from '@common/shared/debug-sample/debug-sample.reducer';
import {getSignedUrl, setS3Credentials} from '@common/core/actions/common-auth.actions';
import {ConfigurationService} from '@common/shared/services/configuration.service';
import {_mergeVariants, convertMultiPlots, mergeMultiMetricsGroupedVariant, prepareMultiPlots, tryParseJson} from '@common/tasks/tasks.utils';
import {selectSignedUrl} from '@common/core/reducers/common-auth-reducer';
import {loadExternalLibrary} from '@common/shared/utils/load-external-library';
import {ImageViewerComponent} from '@common/shared/debug-sample/image-viewer/image-viewer.component';
import {cloneDeep} from 'lodash/fp';
import {MetricsPlotEvent} from '~/business-logic/model/events/metricsPlotEvent';
import {SingleGraphComponent} from '@common/shared/single-graph/single-graph.component';
import {setCurrentDebugImage} from '@common/shared/debug-sample/debug-sample.actions';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  title = 'report-widgets';
  public plotData: ExtFrame;
  public frame: DebugSample;
  public plotLoaded: boolean;
  private environment: Environment;
  public activated: boolean = false;
  private searchParams: URLSearchParams;
  public type: string;
  public singleGraphHeight;
  public hideMaximize: 'show' | 'hide' | 'disabled' = 'show';
  public signIsNeeded: Observable<boolean>;

  @ViewChild(SingleGraphComponent) 'singleGraph': SingleGraphComponent;

  constructor(
    private store: Store<State>,
    private configService: ConfigurationService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef) {
    this.configService.globalEnvironmentObservable.subscribe(env => {
      this.environment = env;
    });
    this.signIsNeeded = store.select(selectSignIsNeeded);
    this.searchParams = new URLSearchParams(window.location.search);
    this.type = this.searchParams.get('type');
    this.singleGraphHeight = window.innerHeight;

    try {
      const lala = JSON.parse(localStorage.getItem('_saved_state_'));
      this.store.dispatch(setS3Credentials(lala.auth.s3BucketCredentials));
    } catch (e) {
      console.log(e);
    }

  }

  ngOnInit(): void {
    try {
      if (!(window.top as any).holdIframe) {
        this.activate();
      }
    } catch (e) {
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
          const {merged, parsingError} = prepareMultiPlots(metricsPlots);
          const newGraphs = convertMultiPlots(merged);
          this.plotData = Object.values(newGraphs)[0]?.[0];
        }
        this.plotLoaded = true;
        this.cdr.detectChanges();
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
        this.plotData = Object.values(mergeMultiMetricsGroupedVariant(metrics))?.[0]?.[0];
        this.cdr.detectChanges();
      });
  }

  private getSample() {
    this.store.select(selectSampleData)
      .pipe(filter(sample => !!sample))
      .subscribe(sample => {
        this.store.dispatch(getSignedUrl({url: sample.url}));
        this.store.select(selectSignedUrl(sample.url))
          .pipe(
            filter(signed => !!signed?.signed),
            map(({signed: signedUrl}) => signedUrl),
            take(1)
          ).subscribe(() => {
          this.frame = sample;
          this.activated = true;
          this.cdr.detectChanges();
        });

      });
  }

  activate = () => {
    this.type !== 'sample' && loadExternalLibrary(this.store, this.environment.plotlyURL, reportsPlotlyReady);
    const queryParams = {
      tasks: this.searchParams.getAll('tasks'),
      metrics: this.searchParams.getAll('metrics'),
      variants: this.searchParams.getAll('variants'),
      iterations: this.searchParams.getAll('iterations').map(iteration => parseInt(iteration, 10)),
      company: this.searchParams.get('company') || '',
    };

    switch (this.type) {
      case 'plot':
        this.store.dispatch(getPlot(queryParams));
        break;
      case 'scalar':
        this.store.dispatch(getScalar(queryParams));
        break;
      case 'sample':
        this.store.dispatch(getSample(queryParams));
    }
    this.activated = true;
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

}
