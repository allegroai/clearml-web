import {
  AfterContentInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,
  ContentChildren, ElementRef, EventEmitter, HostListener, Input, OnDestroy,
  OnInit, Output, QueryList, Renderer2, TemplateRef, ViewChild, ViewChildren
} from '@angular/core';
import {get} from 'lodash/fp';
import {MenuItem, PrimeTemplate} from 'primeng/api';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {ContextMenu} from 'primeng/contextmenu';
import {Table} from 'primeng/table';
import {Subject, Subscription} from 'rxjs';
import {filter, take, throttleTime} from 'rxjs/operators';
import {custumFilterFunc, custumSortSingle} from './overrideFilterFunc';
import {ISmCol, TableSortOrderEnum, ColHeaderTypeEnum} from './table.consts';
import {sortCol} from '../../../utils/tableParamEncode';

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
  public checkboxTemplate: any;
  public sortFilterTemplate: any;
  public headerTemplate: TemplateRef<any>;
  private loadMoreSubscription: Subscription;
  private loadMoreDebouncer: Subject<any>;
  public menuItems = [] as MenuItem;
  minView: boolean;
  private _filters: { [s: string]: FilterMetadata };


  readonly ColHeaderTypeEnum = ColHeaderTypeEnum;
  table: Table;
  @ViewChildren('dataTable') public tableComp: QueryList<Table>;
  loadButton: ElementRef<HTMLDivElement>;
  @ViewChildren('loadButton') loadButtons: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChild('cm', {static: true}) menu: ContextMenu;
  @ContentChildren(PrimeTemplate) templates: QueryList<any>;
  private _tableData: any;
  private _columnsOrder: string[];
  public loading: boolean;
  private scrollLeft = 0;
  public buttonLeft: number;

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
    this._columns = columns.filter(col => !col.hidden);
    this.orderColumns();
  }

  get columns() {
    return this._columns;
  }

  @Input() reorderableColumns = false;
  @Input() resizableColumns = false;
  @Input() sortOrder: TableSortOrderEnum;
  @Input() sortField: string;
  @Input() selection: any;
  @Input() activeContextRow;
  @Input() contextMenuOpen = false;
  @Input() first = 0;
  @Input() rowsNumber = 10;
  @Input() selectionMode: 'multiple' | 'single' | null = 'single';
  @Input() rowHeight = 48;
  @Input() cardHeight = 90;
  @Input() lazyLoading = false;
  @Input() keyboardControl: boolean = false;
  @Input() noMoreData: boolean;
  @Input() rowHover: boolean;
  @Input() noHeader:boolean= false;
  @Input() simple: boolean =false;


  @Input() set minimizedView(minView: boolean) {
    this.minView = minView;
    if (!minView) {
      window.setTimeout(() => this.table && this.updateFilter());
    }
  }

  @Input()
  set filters(filters: { [s: string]: FilterMetadata }) {
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

  @Output() sortChanged = new EventEmitter<{ field: ISmCol['id']; sortOrder: TableSortOrderEnum }>();
  @Output() rowClicked = new EventEmitter();
  @Output() rowSelectionChanged = new EventEmitter<{ data: Array<any>; originalEvent?: Event }>();
  @Output() firstChanged = new EventEmitter();
  @Output() loadMoreClicked = new EventEmitter();
  @Output() onRowRightClick = new EventEmitter();
  @Output() colReordered = new EventEmitter();

  @HostListener('window:resize')
  resize() {
    this.updateLoadButton(null);
  }

  @HostListener('keydown', ['$event'])
  keyDownHandler(event) {
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
    }, 0);

  }

  constructor(private element: ElementRef, private renderer: Renderer2, private cdr: ChangeDetectorRef) {
    this.loadMoreDebouncer = new Subject();
    this.loadMoreSubscription = this.loadMoreDebouncer
      .pipe(throttleTime(1500))
      .subscribe(
        () => this.loadMoreClicked.emit()
      );
  }

  ngOnInit(): void {
    // In order to know if we should reset first to 0 on filter input.
    this.active = true;
  }

  ngAfterViewInit(): void {
    this.tableComp.changes
      .pipe(filter((comps: QueryList<Table>) => !!comps.first), take(1))
      .subscribe((comps: QueryList<Table>) => {
        this.table = comps.first;
        const scrollContainer = this.table.el.nativeElement.getElementsByClassName('ui-table-scrollable-body')[0] as HTMLDivElement;
        if (scrollContainer) {
          scrollContainer.onscroll = (e: Event) => this.updateLoadButton(e);
        }
        this.updateLoadButton(null);
        this.updateFilter();
      });
    this.loadButtons.changes
      .pipe(filter((comps: QueryList<ElementRef<HTMLDivElement>>) => !!comps.first), take(1))
      .subscribe((comps: QueryList<ElementRef<HTMLDivElement>>) => {
        this.loadButton = comps.first;
        this.updateLoadButton(null);
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
        default:
          this.bodyTemplate = item.template;
          break;
      }
    });
  }

  ngOnDestroy(): void {
    this.loadMoreSubscription.unsubscribe();
  }

  onSortChanged(event) {
    this.sortChanged.emit(event);
  }

  onRowSelected(event) {
    if (this.selection && event.data.id === this.selection.id) {
      this.rowSelectionChanged.emit({data: null, originalEvent: event.originalEvent});
    } else {
      this.rowSelectionChanged.emit(event);
      if (!this.minView) {
        this.scrollToElement(event.data);
      }
    }
  }

  onRowDeselected(event) {
    if (this.minView) {
      this.rowSelectionChanged.emit({data: null, originalEvent: event.originalEvent});
      this.scrollToElement(event.data);
    } else {
      this.rowSelectionChanged.emit({data: this.table?.selection, originalEvent: event.originalEvent});
    }
  }

  public scrollToElement(data) {
    const rowIndex = this.tableData.findIndex(row => row.id === data.id);
    rowIndex > -1 && window.setTimeout(() => {
      if (this.table) {
        const row = this.table.el.nativeElement.getElementsByTagName('tr')[rowIndex] as HTMLTableRowElement;
        if (row) {
          const location = row.offsetTop;
          this.table.scrollTo({top: location, behavior: 'smooth'});
        }
      }
    });
  }

  onFirstChanged(event) {
    this.firstChanged.emit(event);
  }

  openContext(e: { originalEvent: MouseEvent; data: any }) {
    if (this.onRowRightClick.observers.length > 0) {
      this.onRowRightClick.emit({e: e.originalEvent, rowData: e.data});
      this.table.contextMenuSelection = null;
      window.setTimeout(() => this.menu.hide());
    }
  }

  trackByFn(index, item) {
    return item.id;
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
    this.loadMoreDebouncer.next();
  }

  onColReorder($event: any) {
    const columnsList = $event.columns.map(column => column.id);
    this.colReordered.emit(columnsList);
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
      (this.checkedItems.some((selectedEntity: { id: any }) => selectedEntity.id === entity.id));
  }

  private updateLoadButton(e: Event) {
    if (e) {
      this.scrollLeft = (e.target as HTMLDivElement).scrollLeft;
    }
    if (this.loadButton) {
      this.buttonLeft = (this.table.el.nativeElement.getBoundingClientRect().width / 2) - 90 + this.scrollLeft;
      this.cdr.detectChanges();
    }
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
}
