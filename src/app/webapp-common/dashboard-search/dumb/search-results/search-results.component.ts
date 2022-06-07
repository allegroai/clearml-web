import {Component, EventEmitter, Input, Output, TemplateRef, ViewChild} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {BreakpointObserver, BreakpointState} from '@angular/cdk/layout';
import {map, take} from 'rxjs/operators';
import {chunk} from 'lodash/fp';
import {trackById} from '@common/shared/utils/forms-track-by';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {Store} from '@ngrx/store';
import {selectScaleFactor} from '@common/core/reducers/view.reducer';

const SIDE_NAV_PLUS_PAD = 64 + 24 + 24;
const CARD_WIDTH = 352;

@Component({
  selector: 'sm-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent {
  private cardLayoutChange$: Observable<BreakpointState>;
  private results$ = new BehaviorSubject<any[]>(null);
  public resultRows$: Observable<any[][]>;
  public trackById = trackById;
  public rowWidth = 300;

  @Input() cardTemplate: TemplateRef<any>;
  @Input() set results(results: any[]) {
    this.results$.next(results);
    this.viewPort?.scrollToIndex(0);
  }
  @Input() cardHeight = 246;
  @Output() resultClicked = new EventEmitter<any>();
  @ViewChild(CdkVirtualScrollViewport) viewPort : CdkVirtualScrollViewport;

  constructor(private store: Store, private breakpointObserver: BreakpointObserver) {
    this.store.select(selectScaleFactor)
      .pipe(take(1), map(factor => 100 / factor))
      .subscribe(factor => {
        const points = {} as {[point: string]: number};
        [2,3,4,5,6].forEach(num =>
          points[`(min-width: ${num === 2 ? 0 : ((num - 2) * 24 + (num - 1) * CARD_WIDTH + SIDE_NAV_PLUS_PAD) * factor}px) and ` +
          `(max-width: ${num === 6 ? 20000 : ((num - 1) * 24 + num * CARD_WIDTH + SIDE_NAV_PLUS_PAD) * factor}px)`] = num);
        this.cardLayoutChange$ = breakpointObserver.observe(Object.keys(points));

        this.resultRows$ = combineLatest([this.cardLayoutChange$, this.results$])
          .pipe(map(([match, results]) => {
            const point = Object.entries(match.breakpoints).find(([, val]) => val);
            const cards = point ? points[point[0]] - 1 : 3;
            this.rowWidth = cards * CARD_WIDTH + (cards - 1) * 24
            return chunk(cards, results);
          }));
      });
  }
}
