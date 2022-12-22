import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  Renderer2,
  TemplateRef,
  TrackByFunction,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {get} from 'lodash/fp';
import {MenuItem, PrimeTemplate, SortMeta} from 'primeng/api';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {ContextMenu} from 'primeng/contextmenu';
import {Table} from 'primeng/table';
import {BehaviorSubject, fromEvent, Subject, Subscription, startWith, combineLatest, interval} from 'rxjs';
import {debounce, debounceTime, filter, take, throttleTime} from 'rxjs/operators';
import {custumFilterFunc, custumSortSingle} from './overrideFilterFunc';
import {ColHeaderTypeEnum, ISmCol, TableSortOrderEnum} from './table.consts';
import {sortCol} from '../../../utils/tableParamEncode';
import {Store} from '@ngrx/store';
import {selectScaleFactor} from '@common/core/reducers/view.reducer';
import {trackById} from '@common/shared/utils/forms-track-by';

@Component({
  selector: 'sm-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent implements AfterContentInit, AfterViewInit, OnInit, OnDestroy {

  public active = false;
  public bodyTemplate: TemplateRef<any>;
  public sortTemplate: TemplateRef<any>;
  public cardTemplate: TemplateRef<any>;
  public footerTemplate: TemplateRef<any>;
  public rowExpansionTemplate: TemplateRef<any>;
  public cardHeaderTemplate: TemplateRef<any>;
  public checkboxTemplate: any;
  public sortFilterTemplate: any;
  public headerTemplate: TemplateRef<any>;
  public trackByColFn: TrackByFunction<ISmCol> = trackById;
  private loadMoreSubscription: Subscription;
  private loadMoreDebouncer: Subject<any>;
  public menuItems = [] as MenuItem[];
  minView: boolean;
  private _filters: { [s: string]: FilterMetadata };
  private readonly isChrome = navigator.userAgent.indexOf('Chrome') > -1;
  public lastRowExpanded: boolean;


  readonly colHeaderTypeEnum = ColHeaderTypeEnum;
  table: Table;
  @ViewChildren(Table) public tableComp: QueryList<Table>;
  loadButton: ElementRef<HTMLDivElement>;
  @ViewChildren('loadButton') loadButtons: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChild('cm', {static: true}) menu: ContextMenu;
  @ContentChildren(PrimeTemplate) templates: QueryList<any>;
  private _tableData: any;
  private _columnsOrder: string[];
  public loading: boolean;
  private scrollLeft = 0;
  public buttonLeft: number;
  public contextButtonPosition: number;
  private scaleFactor: number;
  private waiting: boolean;
  private scrollContainer: HTMLDivElement;
  private updateLoadButton$ = new BehaviorSubject<Event>(null);
  private resize$ = new BehaviorSubject<number>(null);
  private sub = new Subscription();

  @Input() autoLoadMore: boolean = false;
  @Input() columnResizeMode = 'expand';
  @Input() expandableRows = false;
  @Input() initialColumns;
  private waitForClick: number;
  @Input() set tableData(tableData) {
    this.loading = false;
    this.rowsNumber = tableData ? tableData.length : 0;
    this._tableData = tableData;
  }

  get tableData() {
    return this._tableData;
  }

  _columns: ISmCol[];

  @Input() set columnsOrder(columnsOrder: string[]) {
    this._columnsOrder = columnsOrder;
    this.orderColumns();
  }

  get columnsOrder() {
    return this._columnsOrder;
  }

  @Input() set columns(columns: ISmCol[]) {
    if (columns?.length > 0) {
      this._columns = columns.filter(col => !col.hidden);
      this.orderColumns();
      this.resize();
    }
  }

  get columns() {
    return this._columns;
  }

  @Input() reorderableColumns = false;
  @Input() resizableColumns = false;
  @Input() scrollable = false;
  @Input() sortOrder: TableSortOrderEnum;
  @Input() sortFields: SortMeta[];
  @Input() selection: any;
  @Input() activeContextRow;
  @Input() contextMenuOpen = false;
  @Input() first = 0;
  @Input() rowsNumber = 10;
  @Input() selectionMode: 'multiple' | 'single' | null = 'single';
  @Input() rowHeight = 48;
  @Input() cardHeight = 130;
  @Input() lazyLoading = false;
  @Input() keyboardControl: boolean = false;
  @Input() noMoreData: boolean;
  @Input() rowHover: boolean;
  @Input() noHeader: boolean = false;
  @Input() simple: boolean = false;
  @Input() expandedRowKeys: { [s: string]: boolean } = {};


  @Input() set minimizedView(minView: boolean) {
    const delay = this.minView === undefined ? 0 : 3000;

    this.minView = minView;
    if (!minView) {
      window.setTimeout(() => this.table && this.updateFilter());
    }
    this.resize$.next(delay);
  }

  @Input() set filters(filters: { [s: string]: FilterMetadata }) {
    this._filters = filters;
    if (!this.minView) {
      this.table.filters = filters;
      if (this.active) {
        this.table.first = 0;
        this.firstChanged.emit(0);
      }
    }
  }

  @Input() noDataMessage = 'No data to show';
  @Input() checkedItems = [];
  @Input() virtualScroll: boolean;
  @Input() globalFilterFields: string[];
  @Input() enableTableSearch: boolean = false;
  @Input() minimizedTableHeader: string;
  @Input() hasExperimentUpdate: boolean;

  @Output() sortChanged = new EventEmitter<{ field: ISmCol['id']; isShift: boolean }>();
  @Output() rowClicked = new EventEmitter<{e: MouseEvent; data: any}>();
  @Output() rowDoubleClicked = new EventEmitter<{e: MouseEvent; data: any}>();
  @Output() rowSelectionChanged = new EventEmitter<{ data: Array<any>; originalEvent?: Event }>();
  @Output() firstChanged = new EventEmitter();
  @Output() loadMoreClicked = new EventEmitter();
  @Output() rowRightClick = new EventEmitter<{e: MouseEvent; rowData; single?: boolean}>();
  @Output() colReordered = new EventEmitter();
  @Output() columnResized = new EventEmitter<{ columnId: string; widthPx: number }>();
  search: string;

  resize(delay: number = null) {
    this.resize$.next(delay);
  }

  private calcResize() {
    this.updateLoadButton$.next(null);
    if (this.table && this.resizableColumns) {
      const element = (this.table.el.nativeElement as HTMLDivElement);
      let width = element.getBoundingClientRect().width;
      if (this.scaleFactor) {
        width *= this.scaleFactor / 100;
      }
      let totalWidth = 0;
      if (this.minView) {
        if (this.table?.styleElement) {
          this.table.styleElement.innerHTML = '';
        }
        totalWidth = width - (this.isChrome ? 14 : 0);
      } else {
        this.table.destroyStyleElement();
        this.table.createStyleElement();
        let innerHTML = '';
        this.columns.forEach((col, index) => {
          let colWidth;
          let grow = 0;
          if (col.style?.width?.endsWith('px')) {
            colWidth = parseInt(col.style.width.slice(0, -2), 10);
            totalWidth += colWidth;
          } else {
            colWidth = element.getElementsByTagName('th')[index]?.getBoundingClientRect().width || 0;
            totalWidth += this.scaleFactor ? colWidth * this.scaleFactor / 100 : colWidth;
          }
          if (index === this.columns.length - 1 && totalWidth < width) {
            grow = 1;
          }
          innerHTML += `
                #${this.table.id}-table .p-datatable-thead > tr:not(.cards-table) > th:nth-child(${index + 1}),
                #${this.table.id}-table .p-datatable-tbody > tr:not(.cards-table) > td:nth-child(${index + 1}),
                #${this.table.id}-table .p-datatable-tfoot > tr:not(.cards-table) > td:nth-child(${index + 1}) {
                    flex: ${grow} 0 ${colWidth}px !important
                }
            `;
        });
        this.table.styleElement.innerHTML = innerHTML;
        totalWidth = Math.max(totalWidth, width);
      }
      this.renderer.setStyle(this.table.tableViewChild.nativeElement, 'width', `${totalWidth}px`);
      this.renderer.setStyle(this.table.tableViewChild.nativeElement, 'min-width', `${totalWidth}px`);
    }
  }

  @HostListener('keydown', ['$event'])
  keyDownHandler(event: KeyboardEvent) {
    if (this.keyboardControl === false || !['ArrowDown', 'ArrowUp'].includes(event.key)) {
      return;
    }
    event.preventDefault();
    if (event.key == 'ArrowDown') {
      this.incrementIndex(1);
    } else if (event.key == 'ArrowUp') {
      this.incrementIndex((-1));
    }
    setTimeout(() => {
      let selected = this.element.nativeElement.querySelectorAll('.table-card.selected');
      if (selected.length < 1) {
        selected = this.element.nativeElement.querySelectorAll('tr.ui-state-highlight'); // support obsolote scrolling in table
      }
      if (selected && selected.length === 1) {
        selected[0].scrollIntoView({block: 'nearest', inline: 'nearest'});
      }
      selected = null;
    }, 0);

  }

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private store: Store
  ) {
    this.loadMoreDebouncer = new Subject();
    this.loadMoreSubscription = this.loadMoreDebouncer
      .pipe(throttleTime(1500))
      .subscribe(
        () => this.loadMoreClicked.emit()
      );

    store.select(selectScaleFactor)
      .pipe(filter(s => !!s), take(1))
      .subscribe(scale => this.scaleFactor = scale);

    this.sub.add(combineLatest([
      this.resize$,
      fromEvent(window, 'resize').pipe(startWith(null))
    ])
      .pipe(
        debounce(([delay]) => interval(typeof delay === 'number' ? delay : 50))
      )
      .subscribe(() => this.calcResize()));

    this.sub.add(this.updateLoadButton$
      .pipe(debounceTime(50))
      .subscribe(e => this.updateLoadButton(e)));
  }

  ngOnInit(): void {
    // In order to know if we should reset first to 0 on filter input.
    this.active = true;
  }

  ngAfterViewInit(): void {
    const gotTable = (item: Table) => {
      if (!this.table) {
        this.table = item;
        this.scrollContainer = this.table.el.nativeElement.getElementsByClassName('p-datatable-wrapper')[0] as HTMLDivElement;
        if (this.scrollContainer) {
          this.scrollContainer.onscroll = (e: Event) => {
            if (!this.waiting) {
              this.waiting = true;
              window.setTimeout(() => {
                this.waiting = false;
                this.updateLoadButton$.next(e);
              }, 60);
            }
          };
        }
        this.updateLoadButton$.next(null);
        this.updateFilter();
      }
    };

    this.tableComp.changes
      .pipe(filter((comps: QueryList<Table>) => !!comps.first), take(1))
      .subscribe((comps: QueryList<Table>) => gotTable(comps.first));
    this.tableComp.forEach(gotTable);
    this.loadButtons.changes
      .pipe(filter((comps: QueryList<ElementRef<HTMLDivElement>>) => !!comps.first), take(1))
      .subscribe((comps: QueryList<ElementRef<HTMLDivElement>>) => {
        this.loadButton = comps.first;
        this.updateLoadButton$.next(null);
      });
  }

  ngAfterContentInit(): void {
    this.templates.forEach((item) => {
      switch (item.getType()) {
        case 'body':
          this.bodyTemplate = item.template;
          break;
        case 'header':
          this.headerTemplate = item.template;
          break;
        case 'sort':
          this.sortTemplate = item.template;
          break;
        case 'card':
          this.cardTemplate = item.template;
          break;
        case 'sort-filter':
          this.sortFilterTemplate = item.template;
          break;
        case 'checkbox':
          this.checkboxTemplate = item.template;
          break;
        case 'cardFilter':
          this.cardHeaderTemplate = item.template;
          break;
        case 'footer':
          this.footerTemplate = item.template;
          break;
        case 'rowexpansion':
          this.rowExpansionTemplate = item.template;
          break;
        default:
          this.bodyTemplate = item.template;
          break;
      }
    });
  }

  ngOnDestroy(): void {
    this.loadMoreSubscription.unsubscribe();
    this.loadMoreDebouncer.complete();
    this.loadMoreDebouncer.unsubscribe();
    this.sub.unsubscribe();
    this.scrollContainer = null;
    this.menu = null;
    this.table = null;
    this.loadButton = null;
  }

  onSortChanged(event) {
    this.sortChanged.emit(event);
  }

  onRowSelected(event) {
    if (this.selection && event.data.id === this.selection.id) {
      this.rowSelectionChanged.emit({data: null, originalEvent: event.originalEvent});
    } else {
      this.rowSelectionChanged.emit(event);
    }
  }

  onRowDeselected(event) {
    if (this.minView) {
      this.rowSelectionChanged.emit({data: null, originalEvent: event.originalEvent});
    } else {
      this.rowSelectionChanged.emit({data: this.table?.selection, originalEvent: event.originalEvent});
    }
  }

  public scrollToIndex(rowIndex) {
    if (rowIndex > -1 && this.table) {
      const row = this.table.el.nativeElement.getElementsByTagName('tr')[rowIndex] as HTMLTableRowElement;
      if (row) {
        let location = row.offsetTop;
        if (rowIndex + 1 === this.tableData.length) {
          location += row.getBoundingClientRect().height;
        }
        this.table.scrollTo({top: location, behavior: 'smooth'});
      }
    }
  }

  public scrollToElement(data) {
    const rowIndex = this.tableData.findIndex(row => row.id === data.id);
    this.scrollToIndex(rowIndex);
  }

  onFirstChanged(event) {
    this.firstChanged.emit(event);
  }

  openContext({originalEvent, data, single}: { originalEvent: MouseEvent; data: any; single?: boolean }) {
    if (this.rowRightClick.observed) {
      this.rowRightClick.emit({e: originalEvent, rowData: data, single});
      if (this.table) {
        this.table.contextMenuSelection = null;
      }
      window.setTimeout(() => this.menu.hide());
    }
  }

  trackByFunction(index: number, item) {
    return item?.id || item?.name || index;
  }

  public locateInTable() {
    const selectedTask = this.selection;
    const tableData = this.table.filteredValue ? this.table.filteredValue : this.table.value;
    const rowIndex = tableData.findIndex((task) => task.id === selectedTask.id);
    const first = rowIndex > 0 ? (rowIndex - rowIndex % 10) : 0;
    this.first = first;
    this.firstChanged.emit(first);
  }

  getBodyData(rowData, col) {
    return get(col.id, rowData);
  }

  incrementIndex(change: number) {
    const currentIndex = this.getCurrentIndex();
    if (currentIndex == -1) {
      return;
    }
    if (this.tableData.length && this.tableData.length - currentIndex < 3 && !this.noMoreData) {
      this.loadMore();
    }
    const nextSelected = (this.selection) ? this.tableData[currentIndex + change] : this.tableData[0];
    if (nextSelected) {
      this.rowSelectionChanged.emit({data: nextSelected});
    }
  }

  getCurrentIndex() {
    if (this.selection) {
      return this.tableData.findIndex((row) => row.id === this.selection.id);
    } else {
      return 0;
    }
  }

  loadMore() {
      this.loading = true;
      this.loadMoreDebouncer.next(null);
  }

  onColReorder($event: any) {
    const columnsList = $event.columns.map(column => column.id);
    this.colReordered.emit(columnsList);
    this.calcResize();
  }

  orderColumns() {
    if (this.columns && this.columnsOrder) {
      this.columns.sort((a, b) => sortCol(a.id, b.id, this.columnsOrder)
      );
    }
  }

  isRowSelected(entity: { id: any }) {
    if (!entity) {
      return false;
    }

    return this.checkedItems?.length > 0 &&
      (this.checkedItems.some((selectedEntity: { id: string }) => selectedEntity?.id === entity.id));
  }

  private updateLoadButton(e: Event) {
    if (e) {
      this.scrollLeft = (e.target as HTMLDivElement).scrollLeft;
    }
    if (this.table?.el?.nativeElement) {
      const width = this.table.el.nativeElement.getBoundingClientRect().width * this.scaleFactor / 100;
      this.buttonLeft = (width / 2) - 70 + this.scrollLeft;
      this.contextButtonPosition = width - 70 + this.scrollLeft;
    }
    this.cdr.detectChanges();
  }

  private updateFilter() {
    if (this.minView) {
      // Overriding prime ng filter and sort functions so that it wont reset first after data change.
      this.table._filter = custumFilterFunc.bind(this.table);
      this.table.sortSingle = custumSortSingle.bind(this.table);

      this.table.filters = this._filters;
    }
  }

  focusSelected() {
    this.table.el.nativeElement.getElementsByClassName('selected')[0]?.focus();
  }

  colResize({delta, element}: { delta: number; element: HTMLTableHeaderCellElement }) {
    if (delta) {
      const width = element.clientWidth;
      const columnId = element.attributes['data-col-id']?.value;
      this.columnResized.emit({columnId, widthPx: width});
      // this.updateColumnsWidth(columnId, width, delta);
    }
  }

  updateColumnsWidth(columnId, width: number, delta: number) {
    if (columnId) {
      const colIndex = this.columns.findIndex(col => col.id === columnId);
      delta = width - parseInt(this.columns[colIndex].style?.width, 10);
      if (width < 30) {
        width = 30;
      }
      this.columns[colIndex].style = {...this.columns[colIndex].style, width: `${width}px`};
      if (this.columns[colIndex + 1]) {
        const newWidth = parseInt(this.columns[colIndex + 1]?.style.width, 10) - delta;
        if (newWidth < 30) {
          this.columns[colIndex + 1].style = {...this.columns[colIndex + 1].style, width: '30px'};
          this.columns[colIndex].style = {...this.columns[colIndex].style, width: `${width - 30 + newWidth}px`};
        } else {
          this.columns[colIndex + 1].style = {...this.columns[colIndex + 1].style, width: `${newWidth}px`};
        }
      }
    }
    this.columns.forEach((col) => {
      this.columnResized.emit({columnId: col.id, widthPx: parseInt(col.style.width, 10)});
    });
  }

  get sortableCols(): Array<ISmCol> {
    return (this.initialColumns || this.columns).filter(col => col.sortable);
  }

  sortItemClick($event: { event?: MouseEvent; itemValue: string }, colId: string) {
    this.sortChanged.emit({isShift: $event.event.shiftKey, field: colId});
  }

  getOrder(colId: string) {
    return this.sortFields.find(field => field.field === colId)?.order;
  }

  checkClick(param: { data: any; e: MouseEvent }) {
    if (param.e.type === 'dblclick') {
      window.clearTimeout(this.waitForClick);
      this.rowDoubleClicked.emit(param);
    } else {
      this.waitForClick = window.setTimeout(() => {
        this.rowClicked.emit(param);
      }, 50);
    }
  }

  updateNumberOfRows({event, expanded}: {event: any; expanded: boolean}) {
    const expandedIndex = Object.values(this.tableData).findIndex((row: any) => row.id === event.data.id);
    this.lastRowExpanded = expanded && expandedIndex === this.rowsNumber - 1;
  }
}
