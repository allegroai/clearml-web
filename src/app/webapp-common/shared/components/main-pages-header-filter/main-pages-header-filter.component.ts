import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {setFilterByUser} from '../../../core/actions/users.actions';
import {selectShowOnlyUserWork} from '../../../core/reducers/users-reducer';
import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {setMainPageTagsFilter, setMainPageTagsFilterMatchMode} from '../../../core/actions/projects.actions';
import {selectMainPageTagsFilter, selectMainPageTagsFilterMatchMode} from '../../../core/reducers/projects.reducer';
import {sortByArr} from '../../pipes/show-selected-first.pipe';

@Component({
  selector: 'sm-main-pages-header-filter',
  templateUrl: './main-pages-header-filter.component.html',
  styleUrls: ['./main-pages-header-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainPagesHeaderFilterComponent implements OnInit, OnDestroy {
  public searchTerm: string;
  matchMode: string;
  tagsLabelValue: Array<{ label: string; value: string; tooltip?: string }>;
  systemTags: string[];
  private tagsFilters: string[];
  private tagsFiltersSubscription: Subscription;
  private showOnlyUserWork: boolean;
  private showOnlyUserWorkSub: Subscription;

  @Input() set allTags(allTags: string[]) {
    if (allTags) {
      this.tagsLabelValue = allTags?.map(tag => ({label: tag, value: tag}));
      this.sortTags();
    }
  };

  public showOnlyUserWork$: Observable<boolean>;
  private tagsFilterMatchMode$: Observable<string>;
  private matchModeSubscription: Subscription;
  public tagsFilters$: Observable<string[]>;

  constructor(private store: Store<any>, private cdr: ChangeDetectorRef) {
    this.showOnlyUserWork$ = this.store.select(selectShowOnlyUserWork);
    this.tagsFilterMatchMode$ = this.store.select(selectMainPageTagsFilterMatchMode);
    this.tagsFilters$ = this.store.select(selectMainPageTagsFilter);
  }


  switchUserFocus() {
    this.store.dispatch(setFilterByUser({showOnlyUserWork: !this.showOnlyUserWork}));
  }

  setSearchTerm($event) {
    this.searchTerm = $event.target.value;
  }

  closeMenu() {
    this.searchTerm = '';
    this.sortTags();
  }

  clearSearch() {
    this.searchTerm = '';
    this.setSearchTerm({target: {value: ''}});
  }

  toggleMatch() {
    this.store.dispatch(setMainPageTagsFilterMatchMode({matchMode: !this.matchMode ? 'AND' : undefined}));
  }

  emitFilterChangedCheckBox(tags: string[]) {
    this.store.dispatch(setMainPageTagsFilter({tags}));
  }


  ngOnInit(): void {
    this.matchModeSubscription = this.tagsFilterMatchMode$.subscribe(matchMode => {
      this.matchMode = matchMode;
    });
    this.tagsFiltersSubscription = this.tagsFilters$.subscribe(tagsFilters => {
      this.tagsFilters = tagsFilters;
    });
    this.showOnlyUserWorkSub = this.showOnlyUserWork$.subscribe((showOnlyUserWork) => {
      this.showOnlyUserWork = showOnlyUserWork;
    });

  }

  ngOnDestroy(): void {
    this.matchModeSubscription.unsubscribe();
    this.tagsFiltersSubscription.unsubscribe();
    this.showOnlyUserWorkSub.unsubscribe();
    this.store.dispatch(setMainPageTagsFilterMatchMode({matchMode: undefined}));
    this.store.dispatch(setMainPageTagsFilter({tags: []}));
  }

  private sortTags() {
    this.tagsLabelValue.sort((a, b) =>
      sortByArr(a.value, b.value, [...(this.tagsFilters || [])]));
    this.cdr.detectChanges();
  }

  clearAll() {
    this.store.dispatch(setMainPageTagsFilterMatchMode({matchMode: undefined}));
    this.store.dispatch(setMainPageTagsFilter({tags: []}));
    this.store.dispatch(setFilterByUser({showOnlyUserWork: false}));
  }
}
