import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {selectExperimentInfoHistograms, selectExperimentMetricsSearchTerm, selectIsExperimentInProgress, selectSelectedExperimentSettings, selectSelectedSettingsHiddenScalar, selectSelectedSettingsSmoothWeight, selectSelectedSettingsxAxisType, selectShowSettings, selectSplitSize} from '../../reducers';
import {Observable, Subscription} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {SelectableListItem} from '../../../shared/ui-components/data/selectable-list/selectable-list.model';
import {distinctUntilChanged, filter, map} from 'rxjs/operators';
import {selectRouterParams} from '../../../core/reducers/router-reducer';
import {scrollToElement} from '../../../shared/utils/shared-utils';
import {ActivatedRoute,  Router} from '@angular/router';
import {of} from 'rxjs';
import {IExperimentInfoState} from '../../../../features/experiments/reducers/experiment-info.reducer';
import {ExperimentScalarRequested, ResetExperimentMetrics, SetExperimentMetricsSearchTerm, SetExperimentSettings} from '../../actions/common-experiment-output.actions';
import {ExperimentGraph} from '../../../tasks/tasks.model';
import {convertScalars, sortMetricsList} from '../../../tasks/tasks.utils';
import {ScalarKeyEnum} from '../../../../business-logic/model/events/scalarKeyEnum';
import {selectSelectedExperiment} from '../../../../features/experiments/reducers';


@Component({
  selector   : 'sm-experiment-output-scalars',
  templateUrl: './experiment-output-scalars.component.html',
  styleUrls  : ['./experiment-output-scalars.component.scss']
})
export class ExperimentOutputScalarsComponent implements OnInit, OnDestroy {
  public scalarList: Array<SelectableListItem> = [];
  public selectedGraph: string                 = null;

  private scalarSubscription: Subscription;
  private settingsSubscription: Subscription;
  private paramsSubscription: Subscription;
  private experimentId: string;
  private routerParams$: Observable<any>;
  private selectedExperimentId$: Observable<any>;
  public refreshDisabled: boolean;
  public listOfHidden: Observable<Array<any>>;
  public scalars$: any;
  public experimentSettings$: Observable<any>;
  public searchTerm$: Observable<string>;
  public minimized: boolean       = false;
  public graphs: {[key: string]: ExperimentGraph};
  public selectIsExperimentPendingRunning: Observable<boolean>;
  public smoothWeight$: Observable<number>;
  public showSettingsBar: boolean = false;
  public xAxisType$: Observable<string>;
  private xAxisSub: Subscription;
  private selectedExperimentSubscription: Subscription;
  private showSettingsSub: Subscription;
  public splitSize$: Observable<number>;


  constructor(private store: Store<IExperimentInfoState>, private router: Router, private activeRoute: ActivatedRoute, private changeDetection: ChangeDetectorRef) {
    this.searchTerm$ = this.store.pipe(select(selectExperimentMetricsSearchTerm));
    this.splitSize$ = this.store.pipe(select(selectSplitSize));

    this.scalars$     = this.store.pipe(
      select(selectExperimentInfoHistograms),
      filter((metrics) => !!metrics),
      distinctUntilChanged()
    );

    this.experimentSettings$ = this.store.pipe(
      select(selectSelectedExperimentSettings),
      filter(settings => !!settings),
      map(settings => settings ? settings.selectedScalar : null),
      distinctUntilChanged()
    );
    this.smoothWeight$       = this.store.select(selectSelectedSettingsSmoothWeight);
    this.xAxisType$          = this.store.select(selectSelectedSettingsxAxisType);

    this.routerParams$                    = this.store.pipe(
      select(selectRouterParams),
      filter(params => !!params.experimentId),
      distinctUntilChanged()
    );
    this.selectIsExperimentPendingRunning = this.store.pipe(
      select(selectIsExperimentInProgress)
    );
    this.selectedExperimentId$            = this.store.pipe(
      select(selectRouterParams),
      filter(params => !!params.experimentId),
      distinctUntilChanged()
    );
    this.xAxisSub = this.xAxisType$
      .pipe(filter((axis) => !!axis))
      .subscribe(() => this.store.dispatch(new ExperimentScalarRequested(this.experimentId)));
    this.showSettingsSub = this.store.select(selectShowSettings)
      .subscribe((show) => this.showSettingsBar = show);
  }

  ngOnInit() {
    this.minimized          = this.activeRoute.snapshot.routeConfig.data.minimized;
    this.listOfHidden       = this.minimized ? of([]) : this.store.pipe(select(selectSelectedSettingsHiddenScalar));
    this.selectedExperimentSubscription   = this.store.select(selectSelectedExperiment)
      .pipe(
        filter(experiment => !!experiment),
        distinctUntilChanged()
      )
      .subscribe(experiment => {
        this.refresh();
      });
    this.scalarSubscription = this.scalars$
      .subscribe(scalars => {
        this.refreshDisabled = false;
        this.scalarList      = this.prepareScalarList(scalars);
        this.graphs          = convertScalars(scalars);
        this.changeDetection.detectChanges();
      });

    this.settingsSubscription = this.experimentSettings$
      .subscribe((selectedScalar) => {
        this.selectedGraph = selectedScalar;
        scrollToElement(this.selectedGraph);
      });

    this.paramsSubscription = this.routerParams$
      .subscribe(params => {
        if (!this.experimentId || this.experimentId != params.experimentId) {
          this.graphs = undefined;
          this.resetMetrics();

          this.store.dispatch(new ExperimentScalarRequested(params.experimentId));
          this.store.dispatch(new SetExperimentMetricsSearchTerm({searchTerm: ''}));
        }
        this.experimentId = params.experimentId;
      });
  }

  ngOnDestroy() {
    this.scalarSubscription.unsubscribe();
    this.settingsSubscription.unsubscribe();
    this.paramsSubscription.unsubscribe();
    this.xAxisSub.unsubscribe();
    this.selectedExperimentSubscription.unsubscribe();
    this.showSettingsSub.unsubscribe();
    this.resetMetrics();
  }

  private prepareScalarList(metricsScalar: Array<string>): Array<SelectableListItem> {
    const list       = metricsScalar ? Object.keys(metricsScalar) : [];
    const sortedList = sortMetricsList(list);
    return sortedList.map((item) => ({name: item, value: item}));
  }

  metricSelected(id) {
    this.store.dispatch(new SetExperimentSettings({id: this.experimentId, changes: {selectedScalar: id}}));
  }


  hiddenListChanged(hiddenList) {
    this.store.dispatch(new SetExperimentSettings({id: this.experimentId, changes: {hiddenMetricsScalar: hiddenList}}));
  }

  refresh() {
    if (!this.refreshDisabled) {
      this.refreshDisabled = true;
      this.store.dispatch(new ExperimentScalarRequested(this.experimentId));
    }
  }

  searchTermChanged(searchTerm: string) {
    this.store.dispatch(new SetExperimentMetricsSearchTerm({searchTerm: searchTerm}));
  }

  resetMetrics() {
    this.store.dispatch(new ResetExperimentMetrics());
  }

  changeSmoothness($event: any) {
    this.store.dispatch(new SetExperimentSettings({id: this.experimentId, changes: {smoothWeight: $event}}));
  }

  changeXAxisType($event: ScalarKeyEnum) {
    this.store.dispatch(new SetExperimentSettings({id: this.experimentId, changes: {xAxisType: $event}}));
  }

  toggleSettingsBar() {
    this.showSettingsBar = !this.showSettingsBar;
  }
}
