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
  TemplateRef,
  TrackByFunction,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {get, isArray, isString} from 'lodash-es';
import {MenuItem, PrimeTemplate, ScrollerOptions, SortMeta} from 'primeng/api';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {ContextMenu, ContextMenuModule} from 'primeng/contextmenu';
import {
  Table,
  TableColumnReorderEvent,
  TableContextMenuSelectEvent, TableModule,
  TableRowCollapseEvent,
  TableRowExpandEvent
} from 'primeng/table';
import {BehaviorSubject, combineLatest, fromEvent, interval, startWith, Subject, Subscription} from 'rxjs';
import {debounce, filter, take, throttleTime} from 'rxjs/operators';
import {custumFilterFunc, custumSortSingle} from './overrideFilterFunc';
import {ColHeaderTypeEnum, ISmCol, TableSortOrderEnum} from './table.consts';
import {Store} from '@ngrx/store';
import {selectScaleFactor} from '@common/core/reducers/view.reducer';
import {trackById} from '@common/shared/utils/forms-track-by';
import {sortCol} from '@common/shared/utils/sortCol';
import {mkConfig, download, generateCsv} from 'export-to-csv';
import {prepareColsForDownload} from '@common/shared/utils/download';
import {NgTemplateOutlet} from '@angular/common';
import {ResizableColumnDirective} from '@common/shared/ui-components/data/table/resizable-column.directive';
import {MenuComponent} from '@common/shared/ui-components/panel/menu/menu.component';
import {MenuItemComponent} from '@common/shared/ui-components/panel/menu-item/menu-item.component';
import {ScrollEndDirective} from '@common/shared/ui-components/directives/scroll-end.directive';
import {DotsLoadMoreComponent} from '@common/shared/ui-components/indicators/dots-load-more/dots-load-more.component';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';

export interface TableContextMenuSelectEventExt extends Omit<TableContextMenuSelectEvent, 'index'> {
  single?: boolean;
  index?: number;
}

@Component({
  selector: 'sm-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TableModule,
    ResizableColumnDirective,
    MenuComponent,
    MenuItemComponent,
    ScrollEndDirective,
    ContextMenuModule,
    NgTemplateOutlet,
    DotsLoadMoreComponent,
    TooltipDirective
  ]
})
export class TableComponent<D extends { id: string }> implements AfterContentInit, AfterViewInit, OnInit, OnDestroy {

  public active = false;
  public bodyTemplate: TemplateRef<{ $implicit: ISmCol; rowData: D; rowIndex: number; expanded: boolean }>;
  public cardTemplate: TemplateRef<{ rowData: D; rowNumber: number; selected: boolean }>;
  public footerTemplate: TemplateRef<{ $implicit: ISmCol }>;
  public rowExpansionTemplate: TemplateRef<{ $implicit: D; lastFrame: boolean }>;
  public cardHeaderTemplate: TemplateRef<null>;
  public checkboxTemplate: TemplateRef<{ $implicit: ISmCol }>;
  public sortFilterTemplate: TemplateRef<{ $implicit: ISmCol }>;
  public trackByColFn: TrackByFunction<ISmCol> = trackById;
  private loadMoreSubscription: Subscription;
  private loadMoreDebouncer: Subject<null>;
  public menuItems = [] as MenuItem[];
  minView: boolean;
  private _filters: { [s: string]: FilterMetadata };
  private readonly isChrome = navigator.userAgent.indexOf('Chrome') > -1;
  public lastRowExpanded: boolean;
  public noDataTop: number;


  readonly colHeaderTypeEnum = ColHeaderTypeEnum;
  table: Table;
  @ViewChildren(Table) public tableComp: QueryList<Table>;
  loadButton: ElementRef<HTMLDivElement>;
  @ViewChildren('loadButton') loadButtons: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChild('cm', {static: true}) menu: ContextMenu;
  @ContentChildren(PrimeTemplate) templates: QueryList<PrimeTemplate>;
  private _tableData: D[];
  private _columnsOrder: string[];
  public loading: boolean;
  private scaleFactor: number;
  private waiting: boolean;
  public scrollContainer: HTMLDivElement;
  private resize$ = new BehaviorSubject<number>(null);
  private sub = new Subscription();

  @Input() autoLoadMore = false;
  @Input() columnResizeMode = 'expand' as 'fit' | 'expand';
  @Input() expandableRows = false;
  @Input() expandRowOnClick = true;
  @Input() initialColumns;
  private waitForClick: number;

  @Input() set tableData(tableData: D[]) {
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
  @Input() selection: D;
  @Input() activeContextRow;
  @Input() contextMenuOpen = false;
  @Input() first = 0;
  @Input() rowsNumber = 10;
  @Input() selectionMode: 'multiple' | 'single' | null = 'single';
  @Input() rowHeight = 48;
  @Input() cardHeight = 130;
  @Input() lazyLoading = false;
  @Input() keyboardControl = false;
  @Input() noMoreData: boolean;
  @Input() rowHover: boolean;
  @Input() noHeader = false;
  @Input() simple = false;
  @Input() expandedRowKeys: { [s: string]: boolean } = {};
  @Input() rowExpandMode: 'multiple' | 'single' = 'multiple';
  @Input() cardsCollapsed = false;


  @Input() set minimizedView(minView: boolean) {
    this.minView = minView;
    if (!minView) {
      window.setTimeout(() => this.table && this.updateFilter());
    }
    this.calcResize();
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
  @Input() virtualScrollOptions: ScrollerOptions = {};
  @Input() globalFilterFields: string[];
  @Input() enableTableSearch = false;
  @Input() minimizedTableHeader: string;
  @Input() hasExperimentUpdate: boolean;

  @Output() sortChanged = new EventEmitter<{ field: ISmCol['id']; isShift: boolean }>();
  @Output() rowClicked = new EventEmitter<{ e: MouseEvent; data: D }>();
  @Output() rowDoubleClicked = new EventEmitter<{ e: MouseEvent; data: D }>();
  @Output() rowSelectionChanged = new EventEmitter<{ data: D; originalEvent?: Event }>();
  @Output() rowExpanded = new EventEmitter<TableRowExpandEvent>();
  @Output() rowCollapsed = new EventEmitter<TableRowCollapseEvent>();
  @Output() firstChanged = new EventEmitter();
  @Output() loadMoreClicked = new EventEmitter();
  @Output() rowRightClick = new EventEmitter<{ e: Event; rowData; single?: boolean }>();
  @Output() colReordered = new EventEmitter();
  @Output() columnResized = new EventEmitter<{ columnId: string; widthPx: number }>();
  @Output() cardsCollapsedToggle = new EventEmitter<boolean>();
  search: string;

  resize(delay: number = null) {
    this.resize$.next(delay);
  }

  private calcResize() {
    if (this.table && this.resizableColumns) {
      const element = (this.table.el.nativeElement as HTMLDivElement);
      let width = element.getBoundingClientRect().width;
      if (this.scaleFactor) {
        width *= this.scaleFactor / 100;
      }
      let totalWidth = 0;
      if (this.minView) {
        // if (this.table?.styleElement) {
        //   this.table.styleElement.innerHTML = '';
        // }
        totalWidth = width;
        this.table.columnWidthsState = `${totalWidth - 4}`;
      } else {
        this.table.destroyStyleElement();
        this.table.createStyleElement();
        this.table.columnWidthsState = this.columns.map((col, index) => {
          let colWidth: number;
          if (col.style?.width?.endsWith('px')) {
            colWidth = parseInt(col.style.width.slice(0, -2), 10);
            totalWidth += colWidth;
          } else {
            colWidth = element.getElementsByTagName('th')[index]?.getBoundingClientRect().width || 0;
            totalWidth += this.scaleFactor ? colWidth * this.scaleFactor / 100 : colWidth;
          }
          return colWidth;
        }).join(',');
        totalWidth = Math.max(totalWidth, width);
      }
      totalWidth = totalWidth - (this.isChrome ? 14 : 0);
      this.table.tableWidthState = `${totalWidth}`;
      this.table.restoreColumnWidths();
    }
    this.noDataTop = this.table?.wrapperViewChild.nativeElement.getBoundingClientRect().height / 2 - this.rowHeight / 2 - 1;
    this.noDataTop && this.cdr.detectChanges();
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
    private cdr: ChangeDetectorRef,
    private store: Store
  ) {
    this.loadMoreDebouncer = new Subject();
    this.loadMoreSubscription = this.loadMoreDebouncer
      .pipe(throttleTime(1500))
      .subscribe(
        () => this.loadMoreClicked.emit()
      );

    this.store.select(selectScaleFactor)
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
          this.scrollContainer.onscroll = () => {
            if (!this.waiting) {
              this.waiting = true;
              window.setTimeout(() => {
                this.waiting = false;
              }, 60);
            }
          };
        }
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
      });
  }

  ngAfterContentInit(): void {
    this.templates.forEach((item) => {
      switch (item.getType()) {
        case 'body':
          this.bodyTemplate = item.template;
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
    if (this.selection && !Array.isArray(this.selection) && event.data.id === this.selection.id) {
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
      if (this.virtualScroll) {
        const {height} = this.table.el.nativeElement.getBoundingClientRect();
        const rowsInPage = height / this.rowHeight;
        const maxScroll = Math.ceil(this.rowsNumber - rowsInPage);
        this.table.scrollToVirtualIndex(Math.min(maxScroll, rowIndex));
      } else {
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
  }

  public scrollToElement(data) {
    const rowIndex = this.tableData.findIndex(row => row.id === data.id);
    this.scrollToIndex(rowIndex);
  }

  onFirstChanged(event) {
    this.firstChanged.emit(event);
  }

  openContext({originalEvent, data, single}: TableContextMenuSelectEventExt) {
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

  // public locateInTable() {
  //   const selectedTask = this.selection;
  //   const tableData = this.table.filteredValue ? this.table.filteredValue : this.table.value;
  //   const rowIndex = tableData.findIndex((task) => task.id === selectedTask.id);
  //   const first = rowIndex > 0 ? (rowIndex - rowIndex % 10) : 0;
  //   this.first = first;
  //   this.firstChanged.emit(first);
  // }

  getBodyData(rowData, col) {
    return get(rowData, col.id);
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
    if (this.selection && !Array.isArray(this.selection)) {
      return this.tableData.findIndex((row) => row.id === (this.selection as D).id);
    } else {
      return 0;
    }
  }

  loadMore() {
    this.loading = true;
    if (this.autoLoadMore) {
      this.loadMoreClicked.emit();
    } else {
      this.loadMoreDebouncer.next(null);
    }
  }

  onColReorder($event: TableColumnReorderEvent) {
    const columnsList = $event.columns.map(column => column.id);
    this.colReordered.emit(columnsList);
    this.resize();
  }

  orderColumns() {
    if (this.columns && this.columnsOrder) {
      this.columns.sort((a, b) => sortCol(a.id, b.id, this.columnsOrder)
      );
    }
  }

  isRowSelected(entity: { id: string }) {
    if (!entity) {
      return false;
    }

    return this.checkedItems?.length > 0 &&
      (this.checkedItems.some((selectedEntity: { id: string }) => selectedEntity?.id === entity.id));
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
    this.table?.el?.nativeElement.getElementsByClassName('selected')[0]?.focus();
  }

  colResize({delta, element}: { delta: number; element: HTMLElement }) {
    if (delta) {
      setTimeout(() => {
        const width = element.clientWidth;
        const columnId = element.attributes['data-col-id']?.value;
        this.columnResized.emit({columnId, widthPx: width});
        // this.updateColumnsWidth(columnId, width, delta);
      }, 0);
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

  checkClick(param: { data: D; e: MouseEvent }) {
    if (param.e.type === 'dblclick' || this.waitForClick) {
      window.clearTimeout(this.waitForClick);
      this.waitForClick = null;
      this.rowDoubleClicked.emit(param);
    } else {
      this.waitForClick = window.setTimeout(() => {
        this.rowClicked.emit(param);
        this.waitForClick = null;
      }, 250);
    }
  }

  updateNumberOfRows({event, expanded}: { event: TableRowExpandEvent; expanded: boolean }) {
    const expandedIndex = Object.values(this.tableData).findIndex((row: D) => row.id === event.data.id);
    this.lastRowExpanded = expanded && expandedIndex === this.rowsNumber - 1;
  }


  downloadTableAsCSV(tableName?: string) {
    const options = mkConfig({
      filename: `${tableName}${tableName ? '-' : ''}table`,
      showColumnHeaders: true,
    });

    const downloadCols = prepareColsForDownload(this.columns);
    options.columnHeaders = downloadCols.map(dCol => dCol.name);
    const rows = this.tableData.map(row =>
      downloadCols.reduce((acc, dCol) => {
        const val = get(row, dCol.field, '');
        acc[dCol.name] = isArray(val) ? val.toString() : isString(val) ? val.replace(/\r?\n|\r/g
          , '') : val;
        return acc;
      }, {})
    );

    const csv = generateCsv(options)(rows);
    download(options)(csv);
  }

  isSelected = (rowData: D) =>
    Array.isArray(this.selection) ? this.selection?.some(s => s.id === rowData.id) : this.selection?.id === rowData?.id;

}
