import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Output, signal,
  TemplateRef,
  ViewChild, inject, input, effect, computed
} from '@angular/core';
import {BehaviorSubject, combineLatest, fromEvent, Observable} from 'rxjs';
import {debounceTime, filter, map, startWith} from 'rxjs/operators';
import {chunk} from 'lodash-es';
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {Store} from '@ngrx/store';
import {selectScaleFactor} from '@common/core/reducers/view.reducer';
import {AsyncPipe, NgTemplateOutlet} from '@angular/common';
import {ScrollEndDirective} from '@common/shared/ui-components/directives/scroll-end.directive';
import {PushPipe} from '@ngrx/component';
import {MatButton} from '@angular/material/button';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {toObservable} from '@angular/core/rxjs-interop';


@Component({
  selector: 'sm-virtual-grid',
  templateUrl: './virtual-grid.component.html',
  styleUrls: ['./virtual-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
    NgTemplateOutlet,
    ScrollEndDirective,
    PushPipe,
    MatButton,
    MatProgressSpinner
  ]
})
export class VirtualGridComponent {
      private store = inject(Store);
      private ref = inject(ElementRef);
  public itemRows$: Observable<any[][]>;
  public rowWidth = 300;
  public min = Math.min;
  public gridGap: number;
  public cardsInRow: number;
  private width$: Observable<number>;
  private resize$ = new BehaviorSubject<number>(null);

  // snippetMode means the items has no fixed width so we can stretch them to fill the row (consider scroll in calcs and add 1fr to card-width)
  snippetsMode = input(false);
  items = input<any[]>()
  cardTemplate = input<TemplateRef<unknown>>();
  cardHeight = input(246);
  cardWidth = input(352);
  padding = input(64 + 24 + 24);
  showLoadMoreButton = input(false);
  autoLoadMore = input(false);
  trackFn = input(item => item.id);

  @Output() itemClicked = new EventEmitter<any>();
  @Output() loadMoreClicked = new EventEmitter();
  @ViewChild(CdkVirtualScrollViewport) viewPort: CdkVirtualScrollViewport;

  private items$ = toObservable(this.items);
  protected itemsState = computed(() => ({
    items: this.items(),
    loading: signal(false)
  }));


  constructor() {
    effect(() => {
      if (this.cardTemplate()) {
        this.viewPort?.scrollToIndex(0);
      }
    });

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
        this.rowWidth = width * factor - this.padding() - (this.snippetsMode() ? 12 : 0); // 12 because when scroll blinks
        this.gridGap = Math.min(this.cardWidth() * 0.075, 24);
        this.cardsInRow = Math.floor(this.rowWidth / (this.cardWidth() + this.gridGap)) || 1;
        this.rowWidth = this.cardsInRow * this.cardWidth() + (this.cardsInRow - 1) * this.gridGap;
        return chunk(results, this.cardsInRow );
      }));
  }

  resize(size: number) {
    this.resize$.next(size);
  }

  autoLoad() {
    this.itemsState().loading.set(true);
    this.loadMoreClicked.emit();
  }
}
