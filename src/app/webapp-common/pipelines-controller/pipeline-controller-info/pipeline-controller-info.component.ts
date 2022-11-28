import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ElementRef, HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {DagModelItem} from '@ngneat/dag';
import {combineLatest, fromEvent, Observable, Subscription} from 'rxjs';
import {debounceTime, delay, distinctUntilChanged, filter, map, mergeMap, takeUntil, tap, throttleTime} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import {selectSelectedExperiment} from '~/features/experiments/reducers';
import {selectRouterParams} from '../../core/reducers/router-reducer';
import * as commonInfoActions from '../../experiments/actions/common-experiments-info.actions';
import {
  getSelectedPipelineStep,
  setSelectedPipelineStep
} from '../../experiments/actions/common-experiments-info.actions';
import {selectPipelineSelectedStep} from '../../experiments/reducers';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {getBoxToBoxArrow} from 'curved-arrows';
import {Ace, edit} from 'ace-builds';
import {TaskStatusEnum} from '~/business-logic/model/tasks/taskStatusEnum';
import {selectScaleFactor} from '@common/core/reducers/view.reducer';
import {DagManagerUnsortedService} from '@common/shared/services/dag-manager-unsorted.service';

export interface PipelineItem extends DagModelItem {
  name: string;
  id: string;
  data: any;
}

export interface Arrow {
  path: string;
  headTransform: string;
  selected: boolean;
  targetId: string;
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
  @ViewChildren('taskEl', {read: ElementRef}) tasksElements!: QueryList<ElementRef>;
  @ViewChild('start', {read: ElementRef}) startingElement: ElementRef;
  @ViewChild('end', {read: ElementRef}) endingElement: ElementRef;
  @ViewChild('diagramContainer') diagramContainer: ElementRef<HTMLDivElement>;
  @ViewChildren('aceEditor') private aceEditorElements: QueryList<ElementRef>;
  private aceEditor: Ace.Editor;
  private sub = new Subscription();
  private dragging: boolean;
  protected pipelineConfiguration: any;
  public chartWidth = 0;
  public arrows: Arrow[];
  public diagramRect: DOMRect;

  public dagModel$: Observable<PipelineItem[][]>;
  public selected$: Observable<any>;
  public selectedEntity: PipelineItem;
  public projectId$: Observable<string>;
  private tasksElementsLength$: Observable<number>;
  private pipelineController: PipelineItem[];
  private skipAutoCenter: boolean;
  private scale: number;
  showLog: boolean;
  public infoData: IExperimentInfo;
  public stepDiff: string;
  statusOption = StatusOption;
  detailsPanelMode = StatusOption.log;
  defaultDetailsMode = StatusOption.log;

  trackArrows = (index: number, arrow: Arrow) => arrow.path;
  trackByStepId = (index: number, step) => step.stepId;

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if ((e.key == 'Escape')) {
      this.showLog = false;
    }
  }

  constructor(
    protected _dagManager: DagManagerUnsortedService<PipelineItem>,
    protected store: Store<any>,
    protected cdr: ChangeDetectorRef,
    protected zone: NgZone
  ) {
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

    this.selected$ = combineLatest([
      this.store.select(selectSelectedExperiment),
      this.store.select(selectPipelineSelectedStep)
    ]).pipe(
      map(([selectedPipe, selectedStep]) => selectedStep || selectedPipe)
    );

    this.projectId$ = this.store.select(selectRouterParams)
      .pipe(map(params => params?.projectId));
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
        const width = this.diagramContainer?.nativeElement.getBoundingClientRect().width;
        this.chartWidth = Math.max(Number.isNaN(width) ? 0 : width, 4000);
        this.dagModel$ = this._dagManager.dagModel$
          .pipe(filter(model => model?.length > 0), tap((model: any[]) =>
            model.forEach(row => this.chartWidth = Math.max(this.chartWidth, row.length * 300))));
        const pipelineObject = this.getTreeObject(task);
          this.pipelineController = this.convertPipelineToDagModel(pipelineObject);
          this.resetUninitializedRunningFields();
          this._dagManager.setNewItemsArrayAsDagModel(this.pipelineController);
          window.setTimeout(() => {
            if (!this.skipAutoCenter) {
              const element = this.diagramContainer.nativeElement;
              element.scroll({left: (element.scrollWidth - element.getBoundingClientRect().width) / 2});
            }
            this.removeLines();
            this.drawLines();
            this.cdr.detectChanges();
          }, 0);

      })
    );
  }

  protected resetUninitializedRunningFields() {
    if (!this.infoData?.runtime?._pipeline_hash) {
      this.pipelineController.forEach(step => {
        step.data.job_started = null;
        step.data.job_ended = null;
        step.data.status = 'pending';
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
      pipelineObj = Object.entries(pipelineObj).reduce((acc, [key, val]: [string, any]) => {
        acc[key] = {...val, parents: val.parents.map(parent => `${parent}`)};
        return acc;
      }, {});
      this.pipelineConfiguration = pipelineObj;
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
      data: {
        ...pipelineObj[key],
        ...(
          this.infoData.status === TaskStatusEnum.Stopped &&
          [TaskStatusEnum.Queued, TaskStatusEnum.InProgress, 'running'].includes(pipelineObj[key].status) &&
          {status: 'aborted'}
        )
      }
    } as PipelineItem));
  }

  ngAfterViewInit(): void {
    this.tasksElementsLength$ = this.tasksElements.changes.pipe(
      delay(0),
      map((list: QueryList<ElementRef>) => list.toArray().length)
    );

    this.sub.add(this.aceEditorElements.changes.subscribe(() => this.initAceEditor()));

    fromEvent(this.diagramContainer.nativeElement, 'wheel')
      .pipe(throttleTime(1000))
      .subscribe(() => {
      this.skipAutoCenter = true;
    });

    const mousedown$ = fromEvent(this.diagramContainer.nativeElement, 'mousedown');
    const mouseup$ = fromEvent(document, 'mouseup');
    const mousemove$ = fromEvent(this.diagramContainer.nativeElement, 'mousemove');

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
        this.diagramContainer.nativeElement.scrollTo({
          top: this.diagramContainer.nativeElement.scrollTop - y,
          left: this.diagramContainer.nativeElement.scrollLeft - x,
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
    this.diagramRect = this.diagramContainer.nativeElement.getBoundingClientRect();
    pipeLineItems.forEach((pipeLineItem) => {
      pipeLineItem.parentIds.forEach((parentId: number) => {
        if (parentId > 0) {
          const parent: ElementRef<HTMLDivElement> = this.tasksElements.find(
            (b: ElementRef) => parentId === +b.nativeElement.children[0].id
          );
          const self: ElementRef<HTMLDivElement> = this.tasksElements.find(
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
              targetId: pipeLineItem.id
            });
          }
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(commonInfoActions.setExperiment({experiment: null}));
    this.removeLines();
    this.sub.unsubscribe();
  }

  selectStep(step?: PipelineItem) {
    if (step) {
      try {
        this.stepDiff = JSON.parse(this.infoData.configuration[step.data?.job_code_section || step.id]?.value)?.script?.diff;
        this.aceEditor?.getSession().setValue(this.stepDiff);
      } catch (e) {
        this.stepDiff = null;
        this.detailsPanelMode = this.defaultDetailsMode;
      }
      const id = this.infoData.runtime._pipeline_hash ? (step?.data?.job_id) : null;
      if (id) {
        this.store.dispatch(getSelectedPipelineStep({id}));
      } else {
        this.store.dispatch(setSelectedPipelineStep({step: {id, type: step.data.job_type, status: step.data.status, name: step.name}}));
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
    const aceEditorElement = this.aceEditorElements.first;
    if (!aceEditorElement) {
      this.aceEditor = null;
      return;
    }
    this.zone.runOutsideAngular(() => {
      const aceEditor = edit(aceEditorElement.nativeElement) as Ace.Editor;
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

  protected highlightArrows() {
    this.arrows = this.arrows
      ?.map(arrow => ({...arrow, selected: arrow.targetId === this.selectedEntity?.id}))
      .sort((a, b) => a.selected && !b.selected ? 1 : -1);
  }

  protected getTreeObject(task) {
    return task?.configuration?.Pipeline?.value;
  }

  protected getPanelMode() {
    return this.defaultDetailsMode;
  }
}
