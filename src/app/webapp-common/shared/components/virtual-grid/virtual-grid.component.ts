import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {BehaviorSubject, combineLatest, fromEvent, Observable} from 'rxjs';
import {debounceTime, filter, map, startWith} from 'rxjs/operators';
import {chunk} from 'lodash/fp';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {Store} from '@ngrx/store';
import {selectScaleFactor} from '@common/core/reducers/view.reducer';


@Component({
  selector: 'sm-virtual-grid',
  templateUrl: './virtual-grid.component.html',
  styleUrls: ['./virtual-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VirtualGridComponent implements OnChanges{
  private items$ = new BehaviorSubject<any[]>(null);
  public itemRows$: Observable<any[][]>;
  public rowWidth = 300;
  public min = Math.min;
  public gridGap: number;
  public cardsInRow: number;
  private _cardTemplate: TemplateRef<any>;
  private width$: Observable<number>;
  private resize$ = new BehaviorSubject<number>(null);
  public loading: boolean;
  private _items: any[];

  // snippetMode means the items has no fixed width so we can stretch them to fill the row (consider scroll in calcs and add 1fr to card-width)
  @Input() snippetsMode = false;
  @Input() set cardTemplate(cardTemplate: TemplateRef<any>) {
    this.viewPort?.scrollToIndex(0);
    this._cardTemplate = cardTemplate;
  }

  get cardTemplate() {
    return this._cardTemplate;
  }

  @Input() set items(items: any[]) {
    this._items = items;
    this.loading = false;
  }

  get items() {
    return this._items;
  }

  @Input() cardHeight = 246;
  @Input() cardWidth = 352;
  @Input() padding = 64 + 24 + 24;
  @Input() showLoadMoreButton = false;
  @Input() autoLoadMore = false;
  @Output() itemClicked = new EventEmitter<any>();
  @Output() loadMoreClicked = new EventEmitter();
  @ViewChild(CdkVirtualScrollViewport) viewPort: CdkVirtualScrollViewport;
  trackByFn = (index, item) => item.id + this.cardHeight;


  constructor(private store: Store, private ref: ElementRef) {
    this.width$ = combineLatest([
      fromEvent(window, 'resize').pipe(startWith(null)),
      this.resize$
    ]).pipe(
      filter(() => document?.fullscreenElement?.nodeName !== 'VIDEO'),

      map(() => this.ref.nativeElement.getBoundingClientRect().width)
    );
    this.itemRows$ = combineLatest([
      this.width$,
      this.items$,
      this.store.select(selectScaleFactor).pipe(map(factor => 100 / factor))
    ])
      .pipe(
        debounceTime(10),
        map(([width, results, factor]) => {
        this.rowWidth = width * factor - this.padding - (this.snippetsMode ? 12 : 0); // 12 because when scroll blinks
        this.gridGap = Math.min(this.cardWidth * 0.075, 24);
        this.cardsInRow = Math.floor(this.rowWidth / (this.cardWidth + this.gridGap)) || 1;
        this.rowWidth = this.cardsInRow * this.cardWidth + (this.cardsInRow - 1) * this.gridGap;
        return chunk(this.cardsInRow , results);
      }));
  }

  ngOnChanges() {
    this.items$.next(this.items);
  }

  resize(size: number) {
    this.resize$.next(size);
  }

  autoLoad() {
    this.loading = true;
    this.loadMoreClicked.emit();
  }
}
