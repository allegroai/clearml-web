import * as detailsActions from '../actions/experiments-compare-details.actions';
import * as paramsActions from '../actions/experiments-compare-params.actions';
import {ExperimentCompareTree, ExperimentCompareTreeSection, IExperimentDetail} from '../../../features/experiments-compare/experiments-compare-models';
import {get, has, isEmpty, isEqual} from 'lodash/fp';
import {treeBuilderService} from '../services/tree-builder.service';
import {isArrayOrderNotImportant} from '../jsonToDiffConvertor';
import {ExperimentParams, TreeNode, TreeNodeMetadata} from '../shared/experiments-compare-details.model';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {activeLoader, addMessage, deactivateLoader} from '../../core/actions/layout.actions';
import {ChangeDetectorRef, OnDestroy, QueryList, ViewChildren, Directive} from '@angular/core';
import {ExperimentCompareDetailsBase} from '../../../features/experiments-compare/experiments-compare-details.base';
import {ActivatedRoute, Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {IExperimentInfoState} from '../../../features/experiments/reducers/experiment-info.reducer';
import {Observable, Subscription} from 'rxjs';
import {FlatTreeControl} from '@angular/cdk/tree';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {selectRouterParams} from '../../core/reducers/router-reducer';
import {distinctUntilChanged, filter, map, tap} from 'rxjs/operators';
import {selectHideIdenticalFields, selectRefreshing} from '../reducers';
import {refetchExperimentRequested} from '../actions/compare-header.actions';
import {RENAME_MAP} from '../experiments-compare.constants';
import {selectHasDataFeature} from '../../../core/reducers/users.reducer';
import {ListRange} from '@angular/cdk/collections';

export type NextDiffDirectionEnum = 'down' | 'up';

export interface FlatNode {
  data: any;
  metaData: TreeNodeMetadata;
  level: number;
  parent: TreeNode<any>;
  hasChildren: boolean;
}

@Directive()
export abstract class ExperimentCompareBase extends ExperimentCompareDetailsBase implements OnDestroy {
  public hasDataFeature$: Observable<boolean>;
  private hasDataFeature: boolean;

  public renameMap = RENAME_MAP;
  public experiments$: Observable<any[]>;
  public taskIds$: Observable<string>;

  public routerParamsSubscription: Subscription;
  public experimentsSubscription: Subscription;
  public hideIdenticalFieldsSub: Subscription;
  public refreshingSubscription: Subscription;
  private scrollSubscription: Subscription[];

  public tree: ExperimentCompareTree = {};
  public experiments: Array<IExperimentDetail>;
  public originalExperiments: { [id: string]: IExperimentDetail | ExperimentParams } = {};
  public allPathsDiffs: any = {};
  public selectedPath: string = null;
  private selectedPathIndex: number = -1;
  public onlyDiffsPaths: string[];

  public allPaths: any = {};
  public calculatingTree: boolean;
  public hideIdenticalFields = false;
  public experimentsDataControl: { [key: string]: [MatTreeFlatDataSource<TreeNode<any>, FlatNode>, FlatTreeControl<FlatNode>, FlatNode[]] } = {};
  public compareTabPage: string;
  public foundPaths: string[] = [];
  public foundIndex: number = 0;
  public searchText = '';
  public experimentsDataSources: { [id: string]: { all: any; onlyDiffs: any } } = {};
  public previousOpenPaths: string[] = [];
  public experimentTags: { [experimentId: string]: string[] } = {};
  private timeoutIndex: number;
  private originalScrolledElement: EventTarget;
  private taskIds: string;

  get baseExperiment(): IExperimentDetail {
    return get('[0]', this.experiments);
  }

  @ViewChildren('virtualScrollRef') virtualScrollRef: QueryList<CdkVirtualScrollViewport>;


  constructor(public router: Router,
              public store: Store<IExperimentInfoState>,
              public changeDetection: ChangeDetectorRef,
              public activeRoute: ActivatedRoute) {
    super();
    this.hasDataFeature$ = this.store.pipe(select(selectHasDataFeature));

    this.taskIds$ = this.store.pipe(
      select(selectRouterParams),
      map(params => get('ids', params)),
      distinctUntilChanged(),
      tap(taskIds => this.taskIds = taskIds),
      filter(taskIds => !!taskIds && taskIds !== this.getExperimentIdsParams(this.experiments))
    );
  }

  onInit() {
    // todo: remove this
    this.compareTabPage = get('snapshot.routeConfig.data.mode', this.activeRoute);

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

    this.refreshingSubscription = this.store.pipe(select(selectRefreshing))
      .pipe(filter(({refreshing}) => refreshing))
      .subscribe(({autoRefresh}) => this.store.dispatch(refetchExperimentRequested({autoRefresh})));

    this.hideIdenticalFieldsSub.add(this.hasDataFeature$.subscribe(hasData => this.hasDataFeature = hasData));

  }

  ngOnDestroy(): void {
    this.store.dispatch(detailsActions.resetState());
    this.store.dispatch(paramsActions.resetState());
    this.routerParamsSubscription.unsubscribe();
    this.experimentsSubscription.unsubscribe();
    this.hideIdenticalFieldsSub.unsubscribe();
    this.refreshingSubscription.unsubscribe();
  }

  calculateTree(experiments) {
    this.calculatingTree = true;
    this.store.dispatch(activeLoader('CALCULATING_DIFF_TREE'));
    this.changeDetection.detectChanges();

    setTimeout(() => {
      const experimentTrees = this.buildCompareTree(experiments, this.hasDataFeature);
      this.tree = experimentTrees;
      this.clearRemovedExperiment(experiments);

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

        dataSource.connect({viewChange: new Observable<ListRange>()}).subscribe((nodes: FlatNode[]) =>
          this.experimentsDataControl[experimentID] = [dataSource, treeControl, nodes]
        );

        this.experimentsDataControl[experimentID] = [dataSource, treeControl, []];
        this.experimentsDataSources[experimentID] = {all: root, onlyDiffs: rootOnlyDiffs};
        dataSource.data = this.experimentsDataSources[experimentID][this.hideIdenticalFields ? 'onlyDiffs' : 'all'];
        this.setExpandedPaths(expandedsPaths, treeControl);
        this.selectedPath && window.setTimeout(() => this.exapndAndScrollToPath());
      });
      this.calculatingTree = false;
      this.store.dispatch(deactivateLoader('CALCULATING_DIFF_TREE'));
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

  private setExpandedPaths(expandedsPaths: any[], treeControl: FlatTreeControl<FlatNode>) {
    if (expandedsPaths.length > 0) {
      const expandedDatanodes = treeControl.dataNodes.filter(node => node.hasChildren).filter(node => expandedsPaths.includes(node.data.path));
      treeControl.expansionModel.select(...expandedDatanodes);
    }
  }

  toggleNode(node) {
    Object.keys(this.experimentsDataControl).forEach(id => {
      const [, treeControl] = this.experimentsDataControl[id];
      const n = treeControl.dataNodes.filter(n1 => n1.hasChildren).find(n2 => n2.data.path === node.data.path);
      treeControl.toggle(n);
    });
  }

  clearRemovedExperiment(experiments) {
    const expIds = experiments.map(exp => exp.id);
    Object.keys(this.experimentsDataControl).forEach(expId => {
      if (!expIds.includes(expId)) {
        delete this.experimentsDataControl[expId];
        delete this.experimentsDataSources[expId];
      }
    });
  }

  getExpandedPath(experimentTrees: ExperimentCompareTree) {
    let expandedsPaths = [];
    Object.keys(experimentTrees).some(experimentID => {
      if (this.experimentsDataControl[experimentID]) {
        expandedsPaths = this.experimentsDataControl[experimentID][1].expansionModel.selected.map(node => node.data.path);
        return expandedsPaths.length > 0;
      }
    });
    return expandedsPaths;
  }

  syncScrollSubscription() {
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
        this.timeoutIndex = window.setTimeout(() => this.originalScrolledElement = null, 500);
        this.virtualScrollRef.forEach(k => {
          if (k.elementRef.nativeElement !== kk.elementRef.nativeElement) {
            k.elementRef.nativeElement.scrollTo({top: target.scrollTop, left: target.scrollLeft});
          }
        });
      })
    );
  }

  goToNextDiff(direction: NextDiffDirectionEnum) {
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

  exapndAndScrollToPath() {
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
        const [, treeControl] = this.experimentsDataControl[id];
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
    const [, , flatNodes] = Object.values(this.experimentsDataControl)[0];
    const selectedNodeIndex = this.findRealIndex(flatNodes);
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

  findAllOccurrences(text) {
    text = text.toLowerCase();
    const foundPathsPerExpTemp = Object.values(this.experimentsDataControl).map(exp => exp[1].dataNodes
      .map((node, index) => {
        const keyWithoutHash = node.data.key.replace(/(a_){0,1}hash_/, '').toLowerCase();
        if (node.hasChildren) {
          if (keyWithoutHash.includes(text)) {
            return {path: node.data.path, index};
          }
        } else if (keyWithoutHash.includes(text) || (node.data.value !== undefined && JSON.stringify(node.data.value).toLowerCase().includes(text))) {
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


  buildSectionTree(experiment, section, mergedExperiment): ExperimentCompareTreeSection {
    return treeBuilderService.buildTreeFromJson(
      {[section]: mergedExperiment[section]},
      this.dataTransformer,
      this.metaDataTransformer,
      {experiment}
    );
  }

  dataTransformer = (data, key, path, extraParams: { experiment; section: string }) => {
    const originExperiment: any = this.baseExperiment;
    const comparedExperiment: any = extraParams.experiment;
    path.push(key);
    const fullPath = path;
    const fullPathJoined = fullPath.join(',');

    const originData = fullPath.length === 0 ? originExperiment : get(fullPath, originExperiment);
    const comparedData = fullPath.length === 0 ? comparedExperiment : get(fullPath, comparedExperiment);
    const existOnOrigin = !!has(fullPath, originExperiment);
    const existOnCompared = !!has(fullPath, comparedExperiment);
    const isEquals = isEqual(comparedData, originData);
    const isEmptyObject = isEmpty(comparedData) || (!Array.isArray(comparedData) && Object.values(comparedData).every(val => val === undefined));

    const isPrimitive = this.isPrimitive(originData) || originData === undefined || originData === null;
    this.allPaths[fullPathJoined] = this.allPaths[fullPathJoined] || !isEquals;
    if (isPrimitive) {
      this.setPathDif(fullPathJoined, isEquals, (originExperiment === undefined && comparedExperiment === undefined));
    }
    if (originExperiment === undefined && comparedExperiment && !this.isPrimitive(comparedExperiment)) {
      delete this.allPathsDiffs[fullPathJoined];
    }

    let tooltip;
    if (this.compareTabPage === 'hyper-params') {
      path[path.length - 1] = path[path.length - 1].trim();
      const hypeParamObject = get(path.join('.'), this.originalExperiments[comparedExperiment.id]);
      if (hypeParamObject && has('name', hypeParamObject) && has('value', hypeParamObject) && hypeParamObject.type !== 'legacy') {
        tooltip = (hypeParamObject.type ? `Type: ${hypeParamObject.type}\n` : '') + (hypeParamObject.description || '');
      }
    }
    path.pop();

    return {
      key,
      path: fullPathJoined,
      existOnOrigin,
      existOnCompared,
      value: comparedData,
      isValueEqualToOrigin: (originExperiment === comparedExperiment) || (isEquals && (existOnOrigin === existOnCompared)),
      isArray: isArrayOrderNotImportant(comparedExperiment, key),
      classStyle: `${(originExperiment === comparedExperiment || isEquals) ? '' : 'al-danger '}${isEmptyObject ? 'al-empty-collapse ' : ''}${existOnCompared ? '' : 'hide-field'}`,
      tooltip: tooltip || undefined
    };
  };

  metaDataTransformer = (data, key, path, extraParams): TreeNodeMetadata => {
    return null;
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

  public syncUrl(experiments: Array<IExperimentDetail>) {
    const newParams = this.getExperimentIdsParams(experiments);
    if (newParams !== this.taskIds) {
      this.router.navigateByUrl(this.router.url.replace(this.taskIds, newParams));
    }
  }

  public extractTags(experiments) {
    experiments.map(({tags, ...experiment}) => {
      if (tags?.length || !this.experimentTags[experiment.id]?.length) {
        this.experimentTags[experiment.id] = tags;
      }
    });
  }

  public getExperimentIdsParams(experiments: Array<IExperimentDetail>): string {
    return experiments ? experiments.map(e => e.id).toString() : '';
  }

  selectedPathClicked(path) {
    if (this.onlyDiffsPaths.includes(path)) {
      this.selectedPath = path;
      this.selectedPathIndex = this.onlyDiffsPaths.indexOf(this.selectedPath);
    }
  }

  keyClicked(data) {
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

  filterTreeDiffs(node: any) {
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

  private findRealIndex(flatNodes: FlatNode[]) {
    return flatNodes.findIndex(node => node.data?.path === this.selectedPath);
  }

  copyIdToClipboard() {
    this.store.dispatch(addMessage('success', 'Copied to clipboard'));
  }

  public resetComponentState(experiments) {
    this.allPathsDiffs = {};
    this.onlyDiffsPaths = [];
    this.experiments = experiments;
    this.allPaths = [];
    this.previousOpenPaths = [];
  }

// Function that maps a nested node to a flat node
  nodeTransformer(node: TreeNode<any>, level: number) {
    return {
      data: node.data,
      metaData: node.metaData,
      level,
      parent: node.parent,
      hasChildren: !!node.children,
    };
  }

// Function that gets a flat node's level
  getNodeLevel({level}: FlatNode) {
    return level;
  }

// Function that determines whether a flat node is expandable or not
  getIsNodeExpandable({hasChildren}: FlatNode) {
    return hasChildren;
  }

// Function that returns a nested node's list of children
  getNodeChildren(node: TreeNode<any>) {
    return node.children;
  }
}
