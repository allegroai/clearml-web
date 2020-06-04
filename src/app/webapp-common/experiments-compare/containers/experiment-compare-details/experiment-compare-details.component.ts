import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {IExperimentInfoState} from '../../../../features/experiments/reducers/experiment-info.reducer';
import {selectRouterParams} from '../../../core/reducers/router-reducer';
import {get, has, isEqual, isEmpty} from 'lodash/fp';
import * as detailsActions from '../../actions/experiments-compare-details.actions';
import {Subscription} from 'rxjs';
import {selectExperimentsDetails, selectHideIdenticalFields, selectRefreshing} from '../../reducers';
import {filter, map, tap} from 'rxjs/operators';
import {ActiveLoader, AddMessage, DeactiveLoader} from '../../../core/actions/layout.actions';
import {CompareCardListComponent} from '../../dumbs/compare-card-list/compare-card-list.component';
import {
  ExperimentCompareTree, ExperimentCompareTreeSection, IExperimentDetail
} from '../../../../features/experiments-compare/experiments-compare-models';
import {ExperimentCompareDetailsBase} from '../../../../features/experiments-compare/experiments-compare-details.base';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {refetchExperimentRequested} from '../../actions/compare-header.actions';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {TreeNode, TreeNodeMetadata} from '../../shared/experiments-compare-details.model';
import {treeBuilderService} from '../../services/tree-builder.service';
import {convertExperimentsArrays, createDiffObjectDetails, getAllKeysEmptyObject} from '../../jsonToDiffConvertor';

export type nextDiffDirectionEnum = 'down' | 'up';

export interface FlatNode {
  data: any;
  metaData: TreeNodeMetadata;
  level: number;
  parent: TreeNode<any>;
  hasChildren: boolean;
}

@Component({
  selector: 'sm-experiment-compare-details',
  templateUrl: './experiment-compare-details.component.html',
  styleUrls: ['./experiment-compare-details.component.scss', '../../cdk-drag.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentCompareDetailsComponent extends ExperimentCompareDetailsBase implements OnInit, OnDestroy {


  private paramsSubscription: Subscription;
  private experimentsSubscription: Subscription;
  private hideIdenticalFieldsSub: Subscription;
  private refreshingSubscription: Subscription;
  // private searchStringSub: Subscription;

  public tree: ExperimentCompareTree = {};
  public experiments: Array<IExperimentDetail>;
  private allPathsDiffs: any = {};
  public selectedPath: string = null;
  private selectedPathIndex: number = -1;
  private onlyDiffsPaths: string[];
  private taskIds: string;
  public allPaths: any = {};
  public calculatingTree: boolean;
  public hideIdenticalFields = false;
  public experimentsDataControl: { [key: string]: [MatTreeFlatDataSource<TreeNode<any>, FlatNode>, FlatTreeControl<FlatNode>] } = {};
  public compareTabPage: string;
  public foundPaths: string[] = [];
  public foundIndex: number = 0;
  public searchText = '';
  private experimentsDataSources: { [id: string]: { all: any; onlyDiffs: any } } = {};
  private previousOpenPaths: string[] = [];
  private scrollSubscription: Subscription[];
  private timeoutIndex: NodeJS.Timeout;
  private originalScrolledElement: EventTarget;
  public experimentTags: {[experimentId: string]: string[]} = {};

  get baseExperiment(): IExperimentDetail {
    return get('[0]', this.experiments);
  }

  @ViewChild('cardList', {static: true}) cardList: CompareCardListComponent;
  @ViewChildren('virtualScrollRef') virtualScrollRef: QueryList<CdkVirtualScrollViewport>;

  constructor(private router: Router,
              private store: Store<IExperimentInfoState>,
              private changeDetection: ChangeDetectorRef,
              private activeRoute: ActivatedRoute) {
    super();
  }

  ngOnInit() {
    this.hideIdenticalFieldsSub = this.store.select(selectHideIdenticalFields).subscribe(hide => {
      this.hideIdenticalFields = hide;

      Object.keys(this.experimentsDataControl).forEach(id => {
        const [dataSource, treeControl] = this.experimentsDataControl[id];
        const expandedPaths = treeControl.expansionModel.selected.map(node => node.data.path);
        dataSource.data = this.experimentsDataSources[id][this.hideIdenticalFields ? 'onlyDiffs' : 'all'];
        const expandedDataNodes = treeControl.dataNodes.filter(node => node.hasChildren).filter(node => expandedPaths.includes(node.data.path));
        treeControl.expansionModel.select(...expandedDataNodes);
      });
      this.find(this.searchText);
    });

    this.compareTabPage = get('snapshot.routeConfig.data.mode', this.activeRoute);

    this.paramsSubscription = this.store.pipe(
      select(selectRouterParams),
      map(params => get('ids', params)),
      tap(taskIds => this.taskIds = taskIds),
      filter(taskIds => !!taskIds && taskIds !== this.getExperimentIdsParams(this.experiments))
    )
      .subscribe((experimentIds: string) => {
        this.store.dispatch(new detailsActions.ExperimentListUpdated(experimentIds.split(',')));
      });

    this.experimentsSubscription = this.store.pipe(select(selectExperimentsDetails))
      .pipe(
        filter(experiments => !!experiments && experiments.length > 0),
        tap(experiments => this.syncUrl(experiments, this.taskIds))
      )
      .subscribe(experiments => {
        experiments = experiments.map(({tags, ...experiment}) => {
          if (tags?.length || !this.experimentTags[experiment.id]?.length) {
            this.experimentTags[experiment.id] = tags;
          }
          return experiment;
        });
        experiments = experiments.map(experiment => convertExperimentsArrays(experiment, experiments[0], experiments));
        this.allPathsDiffs = {};
        this.onlyDiffsPaths = [];
        this.experiments = experiments;
        this.allPaths = [];
        this.previousOpenPaths = [];
        this.calculateTree(experiments);
        // this.refreshDisabled = false;
      });

    this.refreshingSubscription = this.store.pipe(select(selectRefreshing)).pipe(filter(({refreshing}) => refreshing)).subscribe(({autoRefresh}) =>
      this.store.dispatch(refetchExperimentRequested({autoRefresh})));
  }

  ngOnDestroy(): void {
    this.store.dispatch(new detailsActions.ResetState());
    this.paramsSubscription.unsubscribe();
    this.experimentsSubscription.unsubscribe();
    this.hideIdenticalFieldsSub.unsubscribe();
    this.refreshingSubscription.unsubscribe();
  }

  toggleNode(node) {
    Object.keys(this.experimentsDataControl).forEach(id => {
      const [dataSource, treeControl] = this.experimentsDataControl[id];
      const n = treeControl.dataNodes.filter(n => n.hasChildren).find(n => n.data.path === node.data.path);
      treeControl.toggle(n);
    });
  }

  calculateTree(experiments) {
    this.calculatingTree = true;
    this.store.dispatch(new ActiveLoader('CALCULATING_DIFF_TREE'));
    this.changeDetection.detectChanges();

    setTimeout(() => {
      const experimentTrees = this.compareTabPage === 'details' ? this.buildDetailsTree(experiments) : this.buildHyperParamsTree(experiments);
      this.tree = experimentTrees;
      this.ClearRemovedExperiment(experiments);

      const treeFlattener = new MatTreeFlattener<TreeNode<any>, FlatNode>(
        this.nodeTransformer,
        this.getNodeLevel,
        this.getIsNodeExpandable,
        this.getNodeChildren
      );
      const expandedsPaths = this.getExpandedPath(experimentTrees);

      Object.keys(experimentTrees).forEach(experimentID => {
        const sectionTree = experimentTrees[experimentID];
        let root = Object.keys(sectionTree).map((section: string) => sectionTree[section].children[0]);
        if (this.compareTabPage === 'hyper-params') {
          root = root[0].children;
        }
        const rootOnlyDiffs = this.filterTreeDiffs(root);
        const treeControl: FlatTreeControl<FlatNode> = new FlatTreeControl<FlatNode>(this.getNodeLevel, this.getIsNodeExpandable);
        const dataSource: MatTreeFlatDataSource<TreeNode<any>, FlatNode> = new MatTreeFlatDataSource(treeControl, treeFlattener);

        this.experimentsDataControl[experimentID] = [dataSource, treeControl];
        this.experimentsDataSources[experimentID] = {all: root, onlyDiffs: rootOnlyDiffs};
        dataSource.data = this.experimentsDataSources[experimentID][this.hideIdenticalFields ? 'onlyDiffs' : 'all'];
        this.setExpandedPaths(expandedsPaths, treeControl);
        this.selectedPath && window.setTimeout(() => this.exapndAndScrollToPath());
      });
      this.calculatingTree = false;
      this.store.dispatch(new DeactiveLoader('CALCULATING_DIFF_TREE'));
      if (!this.changeDetection['destroyed']) {
        this.changeDetection.detectChanges();
      }
      this.onlyDiffsPaths = Object.keys(this.allPathsDiffs).filter(key => !!this.allPathsDiffs[key]);
      this.syncScrollSubscription();
      if (this.searchText) {
        this.findAllOccurrences(this.searchText);
        if (this.foundIndex >= this.foundPaths.length) {
          this.foundIndex = this.foundPaths.length;
          this.findPrev();
        }
        if (this.foundPaths.length > 0 && this.foundIndex === -1) {
          this.findNext();
        }
        this.changeDetection.detectChanges();
      }
    }, 0);
  }

  private ClearRemovedExperiment(experiments) {
    const expIds = experiments.map(exp => exp.id);
    Object.keys(this.experimentsDataControl).forEach(expId => {
      if (!expIds.includes(expId)) {
        delete this.experimentsDataControl[expId];
        delete this.experimentsDataSources[expId];
      }
    });
  }

  private getExpandedPath(experimentTrees: ExperimentCompareTree) {
    let expandedsPaths = [];
    Object.keys(experimentTrees).some(experimentID => {
      if (this.experimentsDataControl[experimentID]) {
        expandedsPaths = this.experimentsDataControl[experimentID][1].expansionModel.selected.map(node => node.data.path);
        return expandedsPaths.length > 0;
      }
    });
    return expandedsPaths;
  }

  private setExpandedPaths(expandedsPaths: any[], treeControl: FlatTreeControl<FlatNode>) {
    if (expandedsPaths.length > 0) {
      const expandedDatanodes = treeControl.dataNodes.filter(node => node.hasChildren).filter(node => expandedsPaths.includes(node.data.path));
      treeControl.expansionModel.select(...expandedDatanodes);
    }
    if (this.compareTabPage !== 'details') {
      treeControl.expand(treeControl.dataNodes[0]);
    }
  }

  private syncScrollSubscription() {
    this.scrollSubscription && this.scrollSubscription.forEach(sub => sub.unsubscribe());
    this.scrollSubscription = this.virtualScrollRef.map(kk => kk.elementScrolled().subscribe((event: Event) => {
        const target = event.target as HTMLElement;
        if (!this.originalScrolledElement) {
          this.originalScrolledElement = target;
        }
        if (this.originalScrolledElement !== target) {
          return;
        }

        clearTimeout(this.timeoutIndex);
        this.timeoutIndex = setTimeout(() => this.originalScrolledElement = null, 500);
        this.virtualScrollRef.forEach(k => {
          if (k.elementRef.nativeElement !== kk.elementRef.nativeElement) {
            k.elementRef.nativeElement.scrollTo({top: target.scrollTop, left: target.scrollLeft});
          }
        });
      })
    );
  }

  goToNextDiff(direction: nextDiffDirectionEnum) {
    if (direction === 'down') {
      this.selectedPathIndex = this.onlyDiffsPaths.length - 1 > this.selectedPathIndex ? this.selectedPathIndex + 1 : 0;
    } else if (this.selectedPathIndex > 0) {
      this.selectedPathIndex -= 1;
    } else {
      this.selectedPathIndex = this.onlyDiffsPaths.length - 1;
    }
    this.selectedPath = this.onlyDiffsPaths[this.selectedPathIndex];
    this.exapndAndScrollToPath();
  }

  private exapndAndScrollToPath() {
    const openPaths = [];
    let pathPartial = '';
    const selectedPath = this.selectedPath ? this.selectedPath.split(',') : [];
    selectedPath.forEach((pathPart, index) => {
      if (index === 0) {
        pathPartial = pathPart;
      } else {
        pathPartial = pathPartial + ',' + pathPart;
      }
      openPaths.push(pathPartial);
    });
    let nodeGotExpanded = false;
    if (!isEqual(openPaths.slice(0, openPaths.length - 1), this.previousOpenPaths)) {
      Object.keys(this.experimentsDataControl).forEach(id => {
        const [dataSource, treeControl] = this.experimentsDataControl[id];
        const nodesToOpen = treeControl.dataNodes.filter(node => node.hasChildren).filter(n => {
          const currentPath = n.data.path;
          return !treeControl.isExpanded(n) && openPaths.includes(currentPath);
        });
        if (nodesToOpen.length > 0) {
          treeControl.expansionModel.select(...nodesToOpen);
          nodeGotExpanded = true;
        }
      });
    }
    this.previousOpenPaths = openPaths.slice(0, openPaths.length - 1);
    const [dataSource, treeControl] = Object.values(this.experimentsDataControl)[0];
    const selectedNodeIndex = this.findRealIndex(dataSource);
    const scrollToInPixels = (selectedNodeIndex + 1) * 28 - this.virtualScrollRef.first.getViewportSize() / 2;
    if (nodeGotExpanded) {
      // Hack to make multiple scroll work with cdk. Don't change
      window.setTimeout(() => this.virtualScrollRef.forEach(vs => vs.elementRef.nativeElement.scrollTo({top: scrollToInPixels})), 200);
      window.setTimeout(() => this.virtualScrollRef.forEach(vs => vs.elementRef.nativeElement.scrollTo({top: scrollToInPixels})), 300);
    } else {
      this.virtualScrollRef.forEach(vs => vs.elementRef.nativeElement.scrollTo({top: scrollToInPixels}));
      window.setTimeout(() => this.virtualScrollRef.forEach(vs => vs.elementRef.nativeElement.scrollTo({top: scrollToInPixels})), 0);
      // window.setTimeout(() => this.virtualScrollRef.forEach(vs => vs.elementRef.nativeElement.scrollTo({top: scrollToInPixels})), 100);
    }
  }

  public find(text: string) {
    if (text) {
      this.findAllOccurrences(text);
      this.foundIndex = -1;
      this.findNext();
    } else if (this.searchText !== text) {
      this.foundPaths = [];
      this.selectedPath = null;
    }
    this.searchText = text;
  }

  private findAllOccurrences(text) {
    text = text.toLowerCase();
    const foundPathsPerExpTemp = Object.values(this.experimentsDataControl).map(exp => exp[1].dataNodes
      .map((node, index) => {
        if (node.hasChildren) {
          if (node.data.key.includes(text)) {
            return {path: node.data.path, index};
          }
        } else if (node.data.key.replace(/(a_){0,1}hash_/, '').includes(text) || (node.data.value !== undefined && JSON.stringify(node.data.value).toLowerCase().includes(text))) {
          return {path: node.data.path, index};
        }
      })
      .filter(i => i)
    );

    const foundPathsPerExp = (foundPathsPerExpTemp as any).flat()
      .sort((a, b) => (a.index > b.index) ? 1 : -1)
      .map(found => found.path);
    this.foundPaths = Array.from(new Set((foundPathsPerExp)));
  }

  public findNext() {
    if (this.foundPaths.length === 0) {
      return;
    }
    this.foundIndex = this.foundIndex === (this.foundPaths.length - 1) ? 0 : this.foundIndex + 1;
    this.selectedPath = this.foundPaths[this.foundIndex];
    this.exapndAndScrollToPath();
  }

  public findPrev() {
    if (this.foundPaths.length === 0) {
      return;
    }
    this.foundIndex = this.foundIndex === 0 ? this.foundPaths.length - 1 : this.foundIndex - 1;
    this.selectedPath = this.foundPaths[this.foundIndex];
    this.exapndAndScrollToPath();
  }

  buildDetailsTree(experiments: Array<IExperimentDetail>): ExperimentCompareTree {
    const mergedExperiment = getAllKeysEmptyObject(experiments);
    return experiments
      .reduce((acc, cur) => {
        acc[cur.id] = this.buildExperimentTree(cur, this.baseExperiment, mergedExperiment);

        return acc;
      }, {} as ExperimentCompareTree);
  }

  buildHyperParamsTree(experiments: Array<IExperimentDetail>): ExperimentCompareTree {
    const mergedExperiment = getAllKeysEmptyObject(experiments);
    return experiments
      .reduce((acc, cur) => {
        acc[cur.id] = {
          'hyper-params': this.buildSectionTree(cur, 'parameters', mergedExperiment)
        };

        return acc;
      }, {} as ExperimentCompareTree);
  }

  buildSectionTree(experiment, section, mergedExperiment): ExperimentCompareTreeSection {
    return treeBuilderService.buildTreeFromJson(
      {[section]: mergedExperiment[section]},
      this.dataTransformer,
      this.metaDataTransformer,
      {experiment: experiment}
    );
  }

  dataTransformer = (data, key, path, extraParams: { experiment; section: string }) => {
    // TODO: get the origin experiment from the state (selectedExperiment).
    const originExperiment: any = this.baseExperiment;
    const fullPath = path.concat([key]);
    const diffObject = createDiffObjectDetails(originExperiment, extraParams.experiment, fullPath, key);
    return {...diffObject, key, path: fullPath.join(',')};
  };

  metaDataTransformer = (data, key, path, extraParams): TreeNodeMetadata => {
    // TODO: get the origin experiment from the state (selectedExperiment).
    const fullPath = path.concat([key]);
    const originExperiment: any = this.baseExperiment;
    const originObject = get(fullPath, originExperiment);
    const comparedObject = get(fullPath, extraParams.experiment);
    const keyExists = has(fullPath, extraParams.experiment);
    const isEquals = (originObject === comparedObject) || isEqual(originObject, comparedObject);
    const isPrimitive = this.isPrimitive(originObject) || originObject === undefined || originObject === null;
    const isEmptyObject = isEmpty(comparedObject) || Object.values(comparedObject).every(val => val === undefined);

    this.allPaths[fullPath] = this.allPaths[fullPath] || !isEquals;
    if (isPrimitive) {
      this.setPathDif(fullPath, isEquals, (originObject === undefined && comparedObject === undefined));
    }
    if (originObject === undefined && comparedObject && !this.isPrimitive(comparedObject)) {
      delete this.allPathsDiffs[fullPath];
    }
    return {
      classStyle: (isEquals ? '' : 'al-danger ') + (isEmptyObject ? 'al-empty-collapse ' : '') + (keyExists ? '' : 'hide-field'),
    };
  };

  isPrimitive(obj) {
    return (typeof obj === 'string' || typeof obj === 'boolean' || typeof obj === 'number');
  }

  private setPathDif(fullPath, isEquals, undefinedOriginFirstRun) {
    if (!this.allPathsDiffs[fullPath]) {
      this.allPathsDiffs[fullPath] = !isEquals;
    }
    if (undefinedOriginFirstRun && this.allPathsDiffs[fullPath] === undefined) {
      this.allPathsDiffs[fullPath] = false;
    }
  }

  experimentListChanged(experiments: Array<IExperimentDetail>) {
    this.store.dispatch(new detailsActions.SetExperiments(experiments));
  }

  private syncUrl(experiments: Array<IExperimentDetail>, urlParams: string) {
    const newParams = this.getExperimentIdsParams(experiments);
    if (newParams !== urlParams) {
      this.router.navigateByUrl(this.router.url.replace(urlParams, newParams));
    }
  }

  private getExperimentIdsParams(experiments: Array<IExperimentDetail>): string {
    return experiments ? experiments.map(e => e.id).toString() : '';
  }

  selectedPathClicked(path) {
    if (this.onlyDiffsPaths.includes(path)) {
      this.selectedPath = path;
      this.selectedPathIndex = this.onlyDiffsPaths.indexOf(this.selectedPath);
    }
  }

  keyClicked(data, event: MouseEvent) {
    const path = data.path;
    this.selectedPathClicked(path);
  }

  checkIfSelectedPath = (data: any) => this.selectedPath === (data.path);

  // checkIfFoundPathPath = (data: any) => this.foundPath === (data.path);

  checkIfIdenticalRow(data: any) {
    if (this.hideIdenticalFields && this.allPaths) {
      const currentPath = data.path;
      return !this.allPaths[currentPath];
    } else {
      return false;
    }
  }

  private filterTreeDiffs(node: any) {
    if (node.data && this.allPaths[node.data.path] === false) {
      return false;
    }
    if (Array.isArray(node)) {
      return node.map(item => this.filterTreeDiffs(item)).filter(item => !!item);
    }
    if (node.children) {
      return {...node, children: this.filterTreeDiffs(node.children)};
    }
    if (node.data) {
      return {...node, data: this.filterTreeDiffs(node.data)};
    }
    return node;
  }

  private findRealIndex(ds: MatTreeFlatDataSource<TreeNode<any>, FlatNode>) {
    return ds._expandedData.value.findIndex(node => node.data?.path === this.selectedPath);
  }

  copyIdToClipboard() {
    this.store.dispatch(new AddMessage('success', 'Copied to clipboard'));
  }

  // Function that maps a nested node to a flat node
  private nodeTransformer(node: TreeNode<any>, level: number) {
    return {
      data: node.data,
      metaData: node.metaData,
      level,
      parent: node.parent,
      hasChildren: !!node.children,
    };
  }

// Function that gets a flat node's level
  private getNodeLevel({level}: FlatNode) {
    return level;
  }

// Function that determines whether a flat node is expandable or not
  private getIsNodeExpandable({hasChildren}: FlatNode) {
    return hasChildren;
  }

// Function that returns a nested node's list of children
  private getNodeChildren(node: TreeNode<any>) {
    return node.children;
  }
}
