import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef,
  Component, effect,
  ElementRef, HostListener, inject,
  NgZone,
  OnDestroy,
  OnInit,
  viewChild,
  viewChildren,
} from '@angular/core';
import {DagModelItem} from '@ngneat/dag';
import {fromEvent, Observable, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, mergeMap, takeUntil, tap, throttleTime} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import {selectSelectedExperiment} from '~/features/experiments/reducers';
import {selectRouterParams} from '../../core/reducers/router-reducer';
import * as commonInfoActions from '../../experiments/actions/common-experiments-info.actions';
import {
  getSelectedPipelineStep,
  setSelectedPipelineStep, StepStatusEnum, TreeStep
} from '../../experiments/actions/common-experiments-info.actions';
import {selectPipelineSelectedStepWithFallback} from '../../experiments/reducers';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {getBoxToBoxArrow} from 'curved-arrows';
import {Ace, edit} from 'ace-builds';
import {TaskStatusEnum} from '~/business-logic/model/tasks/taskStatusEnum';
import {selectScaleFactor} from '@common/core/reducers/view.reducer';
import {DagManagerUnsortedService} from '@common/shared/services/dag-manager-unsorted.service';

export interface PipelineItem extends DagModelItem {
  name: string;
  id: string;
  data: TreeStep;
}

export interface Arrow {
  path: string;
  path2?: string;
  headTransform: string;
  selected: boolean;
  targetId: string;
  sourceId: string;
  outgoing?: boolean;
}

export enum StatusOption {
  log = 'Console',
  code = 'Code',
  content = 'Content',
  preview = 'Preview',
}


@Component({
  selector: 'sm-pipeline-controller-diagram',
  templateUrl: './pipeline-controller-info.component.html',
  styleUrls: ['./pipeline-controller-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DagManagerUnsortedService]
})

export class PipelineControllerInfoComponent implements OnInit, AfterViewInit, OnDestroy {
  tasksElements = viewChildren('taskEl', {read: ElementRef});
  diagramContainer = viewChild<ElementRef<HTMLDivElement>>('diagramContainer');
  private aceEditorElement = viewChild<ElementRef<HTMLDivElement>>('aceEditor');
  private aceEditor: Ace.Editor;
  private sub = new Subscription();
  private dragging: boolean;
  public chartWidth = 0;
  public arrows: Arrow[];
  public diagramRect: DOMRect;

  public dagModel$: Observable<PipelineItem[][]>;
  public selected$: Observable<IExperimentInfo>;
  public selectedEntity: PipelineItem;
  public projectId$: Observable<string>;
  protected pipelineController: PipelineItem[];
  private skipAutoCenter: boolean;
  private scale: number;
  showLog: boolean;
  public infoData: IExperimentInfo;
  public stepDiff: string;
  statusOption = StatusOption;
  detailsPanelMode = StatusOption.log;
  defaultDetailsMode = StatusOption.log;

  public maximizeResults: boolean;
  protected _dagManager: DagManagerUnsortedService<PipelineItem>;
  protected store: Store;
  protected cdr: ChangeDetectorRef;
  protected zone: NgZone;

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if ((e.key == 'Escape')) {
      this.showLog = false;
    }
  }

  constructor() {
    this._dagManager = inject(DagManagerUnsortedService<PipelineItem>);
    this.store = inject(Store);
    this.cdr = inject(ChangeDetectorRef);
    this.zone = inject(NgZone);

    this.sub.add(this.store.select(selectRouterParams)
      .pipe(
        debounceTime(150),
        map(params => this.getEntityId(params)),
        filter(id => !!id),
        distinctUntilChanged()
      )
      .subscribe(id => {
        this.skipAutoCenter = false;
        this.store.dispatch(commonInfoActions.resetExperimentInfo());
        this.store.dispatch(commonInfoActions.getExperimentInfo({id}));
        this.store.dispatch(setSelectedPipelineStep({step: null}));
      })
    );

    this.sub.add(this.store.select(selectScaleFactor).subscribe(factor => this.scale = 100 / factor));

    this.selected$ = this.store.select(selectPipelineSelectedStepWithFallback);

    this.projectId$ = this.store.select(selectRouterParams)
      .pipe(map(params => params?.projectId));


    effect(() => {
      if(this.aceEditorElement()) {
        this.initAceEditor();
      }
    });
  }

  ngOnInit(): void {
    this.sub.add(this.store.select(selectSelectedExperiment)
      .subscribe(task => {
        if (task?.id !== this.infoData?.id) {
          this.selectedEntity = null;
          this.stepDiff = null;
          this.detailsPanelMode = this.getPanelMode();
        }
        this.infoData = task;
        const width = this.diagramContainer()?.nativeElement.getBoundingClientRect().width;
        this.chartWidth = Math.max(Number.isNaN(width) ? 0 : width, 4000);
        this.dagModel$ = this._dagManager.dagModel$
          .pipe(filter(model => model?.length > 0), tap(model =>
            model.forEach(row => this.chartWidth = Math.max(this.chartWidth, row.length * 300))));
        const pipelineObject = this.getTreeObject(task);
        this.pipelineController = this.convertPipelineToDagModel(pipelineObject);
        this.resetUninitializedRunningFields();
        this._dagManager.setNewItemsArrayAsDagModel(this.pipelineController);
        window.setTimeout(() => {
          if (!this.skipAutoCenter) {
            const element = this.diagramContainer().nativeElement;
            element.scroll({left: (element.scrollWidth - element.getBoundingClientRect().width) / 2});
          }
          this.removeLines();
          this.drawLines();
          this.cdr.markForCheck();
        }, 0);

        if(this.selectedEntity) {
          this.selectStep(this.selectedEntity);
        }
      })
    );
  }

  protected resetUninitializedRunningFields() {
    if (!this.infoData?.runtime?._pipeline_hash) {
      this.pipelineController.forEach(step => {
        step.data.job_started = null;
        step.data.job_ended = null;
        step.data.status = StepStatusEnum.pending;
      });
    }
  }

  getEntityId(params) {
    return params?.controllerId;
  }

  convertPipelineToDagModel(pipeline): PipelineItem[] {
    let pipelineObj;
    try {
      pipelineObj = JSON.parse(pipeline);
      pipelineObj = Object.entries(pipelineObj).reduce((acc, [key, val]: [string, TreeStep]) => {
        acc[key] = {...val, parents: val.parents.map(parent => `${parent}`)};
        return acc;
      }, {});
    } catch {
      return [];
    }
    const pipelineKeysArr = Object.keys(pipelineObj).reverse();
    // sort nodes to prevent @ngneat/dag from crashing
    const sortedNodes = [];
    let i = 0;
    while (pipelineKeysArr.length > 0 || i > pipelineKeysArr.length) {
      const node = pipelineObj[pipelineKeysArr[i]];
      const parents = node?.parents ?? [];
      if (parents.every(parent => sortedNodes.includes(parent))) {
        sortedNodes.push(pipelineKeysArr[i]);
        pipelineKeysArr.splice(i, 1);
        i = 0;
        continue;
      }
      i++;
    }
    return sortedNodes.map((key, index) => ({
      id: key,
      stepId: index + 1,
      parentIds: [0].concat(pipelineObj[key].parents.map(parent => sortedNodes.indexOf(parent) + 1)),
      name: key,
      branchPath: 1,
      data: pipelineObj[key],
    } as PipelineItem));
  }

  ngAfterViewInit(): void {

    fromEvent(this.diagramContainer().nativeElement, 'wheel')
      .pipe(throttleTime(1000))
      .subscribe(() => {
      this.skipAutoCenter = true;
    });

    const mousedown$ = fromEvent(this.diagramContainer().nativeElement, 'mousedown');
    const mouseup$ = fromEvent(document, 'mouseup');
    const mousemove$ = fromEvent(this.diagramContainer().nativeElement, 'mousemove');

    this.sub.add(mousedown$
      .pipe(
        mergeMap(() => mousemove$.pipe(
          tap(() => {
            this.dragging = true;
            this.skipAutoCenter = true;
          }),
          map((e: MouseEvent) => {
            e.preventDefault(); // prevent selecting text while dragging
            return {
              x: e.movementX,
              y: e.movementY
            };
          }),
          takeUntil(mouseup$)
        ))
      )
      .subscribe(({x, y}: { x: number; y: number }) => {
        this.diagramContainer().nativeElement.scrollTo({
          top: this.diagramContainer().nativeElement.scrollTop - y,
          left: this.diagramContainer().nativeElement.scrollLeft - x,
        });
      })
    );
  }

  removeLines() {
    this.arrows = [];
  }

  drawLines() {
    const pipeLineItems = this._dagManager.getSingleDimensionalArrayFromModel();
    this.arrows = [];
    this.diagramRect = this.diagramContainer().nativeElement.getBoundingClientRect();
    pipeLineItems.forEach((pipeLineItem) => {
      pipeLineItem.parentIds.forEach((parentId: number) => {
        if (parentId > 0) {
          const parent: ElementRef<HTMLDivElement> = this.tasksElements().find((b: ElementRef) =>
            parentId === +b.nativeElement.children[0].id
          );
          const self: ElementRef<HTMLDivElement> = this.tasksElements().find(
            (b: ElementRef) => +b.nativeElement.children[0].id === pipeLineItem.stepId
          );
          if (parent?.nativeElement && self?.nativeElement) {
            const fromRect = parent.nativeElement.getBoundingClientRect();
            const toRect = self.nativeElement.getBoundingClientRect();
            const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = getBoxToBoxArrow(
              parent.nativeElement.offsetLeft, parent.nativeElement.offsetTop, fromRect.width / this.scale, fromRect.height / this.scale,
              self.nativeElement.offsetLeft, self.nativeElement.offsetTop, toRect.width / this.scale, toRect.height / this.scale,
              {padStart: 0, padEnd: 7}
            );
            this.arrows.push({
              path: `M${sx} ${sy} C${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`,
              headTransform: `translate(${ex},${ey}) rotate(${ae})`,
              selected: false,
              outgoing: false,
              sourceId: `${parentId}`,
              targetId: `${pipeLineItem.stepId}`,
            });
          }
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(commonInfoActions.setExperiment({experiment: null}));
    this.store.dispatch(setSelectedPipelineStep({step: null}));
    this.removeLines();
    this.sub.unsubscribe();
  }

  selectStep(step?: PipelineItem) {
    if (step) {
      try {
        this.stepDiff = JSON.parse(this.infoData.configuration[step.data?.job_code_section || step.id]?.value)?.script?.diff;
        this.aceEditor?.getSession().setValue(this.stepDiff);
      } catch {
        this.stepDiff = null;
        if (this.defaultDetailsMode === StatusOption.code) {
          this.detailsPanelMode = this.defaultDetailsMode;
        }
      }
      const id = this.infoData.runtime._pipeline_hash ? (step?.data?.job_id) : null;
      if (id) {
        this.store.dispatch(getSelectedPipelineStep({id}));
      } else {
        this.store.dispatch(setSelectedPipelineStep({step: {
            id,
            type: step.data.job_type,
            status: step.data.status as unknown as TaskStatusEnum,
            name: step.name
          }}));
        this.showLog = false;
      }
      this.selectedEntity = step;
      this.highlightArrows();
    } else if (!this.dragging) {
      this.stepDiff = null;
      this.detailsPanelMode = this.defaultDetailsMode;
      this.store.dispatch(setSelectedPipelineStep({step: null}));
      this.selectedEntity = null;
      this.highlightArrows();
    } else {
      this.dragging = false;
    }
  }

  openLog(show = true) {
    this.showLog = show;
    this.initAceEditor();
  }

  private initAceEditor() {
    const aceEditorElement = this.aceEditorElement()?.nativeElement;
    if (!aceEditorElement) {
      this.aceEditor = null;
      return;
    }
    this.zone.runOutsideAngular(() => {
      const aceEditor = edit(aceEditorElement) as Ace.Editor;
      this.aceEditor = aceEditor;
      aceEditor.setOptions({
        readOnly: true,
        showLineNumbers: false,
        showGutter: false,
        fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
        fontSize: 13,
        highlightActiveLine: false,
        highlightSelectedWord: false,
        showPrintMargin: false,
      });

      aceEditor.renderer.setScrollMargin(12, 12, 12, 12);
      aceEditor.renderer.setPadding(16);
      (aceEditor.renderer.container.querySelector('.ace_cursor') as HTMLElement).style.color = 'white';

      aceEditor.container.style.lineHeight = '1.6';
      aceEditor.renderer.updateFontSize();

      aceEditor.session.setMode('ace/mode/python');
      aceEditor.setTheme('ace/theme/monokai');
      aceEditor.getSession().setValue(this.stepDiff);

      this.aceEditor = aceEditor;
    });
  }
  toggleResultSize() {
    this.maximizeResults = ! this.maximizeResults;
    if (this.detailsPanelMode === StatusOption.content) {
      this.detailsPanelMode = null;
      window.setTimeout(() => {
        this.detailsPanelMode = StatusOption.content;
        this.cdr.markForCheck();
      }, 450);
    }
  }

  protected highlightArrows() {
    this.arrows = this.arrows?.map(arrow => {
      const isTarget = arrow.targetId === `${this.selectedEntity?.stepId}`;
      const isSource = arrow.sourceId === `${this.selectedEntity?.stepId}`;
      return {...arrow, selected: isTarget || isSource, outgoing: isSource};
    }).sort((a, b) => (a.selected === b.selected) ? 0 : a.selected ? 1 : -1);
  }

  protected getTreeObject(task) {
    return task?.configuration?.Pipeline?.value;
  }

  protected getPanelMode() {
    return this.defaultDetailsMode;
  }
}
