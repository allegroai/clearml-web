import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {experimentListUpdated} from '../../actions/experiments-compare-details.actions';
import {selectExperimentsDetails} from '../../reducers';
import {filter, take, tap} from 'rxjs/operators';
import {ExperimentCompareTree, IExperimentDetail} from '~/features/experiments-compare/experiments-compare-models';
import {
  convertConfigurationFromExperiments,
  convertContainerScriptFromExperiments,
  convertExperimentsArrays,
  convertNetworkDesignFromExperiments,
  getAllKeysEmptyObject,
  isDetailsConverted
} from '../../jsonToDiffConvertor';
import {ExperimentCompareBase} from '../experiment-compare-base';
import {ActivatedRoute, Router} from '@angular/router';
import {ExperimentInfoState} from '~/features/experiments/reducers/experiment-info.reducer';
import {ConfigurationItem} from '~/business-logic/model/tasks/configurationItem';
import {RefreshService} from '@common/core/services/refresh.service';
import {LIMITED_VIEW_LIMIT} from '@common/experiments-compare/experiments-compare.constants';

@Component({
  selector: 'sm-experiment-compare-details',
  templateUrl: './experiment-compare-details.component.html',
  styleUrls: ['./experiment-compare-details.component.scss', '../../cdk-drag.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentCompareDetailsComponent extends ExperimentCompareBase implements OnInit, AfterViewInit {
  public showEllipsis: boolean = true;
  public nativeWidth = 410;

  private treeCardBody: HTMLDivElement;
  @ViewChildren('treeCardBody') treeCardBodies: QueryList<ElementRef<HTMLDivElement>>;

  @HostListener('window:resize')
  afterResize() {
    window.setTimeout(() => {
      this.nativeWidth = Math.max(this.treeCardBody.getBoundingClientRect().width, 410);
      this.cdr.detectChanges();
    });
  }

  constructor(
    public router: Router,
    public store: Store<ExperimentInfoState>,
    public changeDetection: ChangeDetectorRef,
    public activeRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public refresh: RefreshService
  ) {
    super(router, store, changeDetection, activeRoute, refresh);
  }

  experiments$ = this.store.pipe(select(selectExperimentsDetails));

  ngOnInit() {
    this.onInit();
    this.routerParamsSubscription = this.taskIds$.subscribe((experimentIds) => {
        this.store.dispatch(experimentListUpdated({ids: experimentIds.slice(0, LIMITED_VIEW_LIMIT)}));
      }
    );

    this.experimentsSubscription = this.experiments$.pipe(
      filter(experiments => !!experiments && experiments.length > 0),
      tap(experiments => {
        this.extractTags(experiments);
      }),
    ).subscribe(experiments => {
      this.originalExperiments = experiments.reduce((acc, exp) => {
        acc[exp.id] = isDetailsConverted(exp) ? this.originalExperiments[exp.id] : exp;
        return acc;
      }, {} as { [id: string]: ConfigurationItem });
      experiments = Object.values(this.originalExperiments).map(experiment => convertExperimentsArrays(experiment, this.originalExperiments[experiments[0].id], experiments));
      experiments = convertConfigurationFromExperiments(experiments, this.originalExperiments);
      experiments = convertNetworkDesignFromExperiments(experiments, this.originalExperiments);
      experiments = convertContainerScriptFromExperiments(experiments, this.originalExperiments);

      this.resetComponentState(experiments);
      this.calculateTree(experiments);
    });
  }


  ngAfterViewInit() {
    this.treeCardBodies.changes
      .pipe(filter(list => list.first), take(1))
      .subscribe((list: QueryList<ElementRef<HTMLDivElement>>) => {
        this.treeCardBody = list.first.nativeElement;
        this.nativeWidth = Math.max(this.treeCardBody.getBoundingClientRect().width, 410);
      });
  }

  buildCompareTree(experiments: Array<IExperimentDetail>, hasDataFeature?: boolean): ExperimentCompareTree {
    const mergedExperiment = getAllKeysEmptyObject(experiments);
    return experiments
      .reduce((acc, cur) => {
        acc[cur.id] = this.buildExperimentTree(cur, this.baseExperiment, mergedExperiment, hasDataFeature);

        return acc;
      }, {} as ExperimentCompareTree);
  }

  toggleEllipsis() {
    this.showEllipsis = !this.showEllipsis;
  }
}
