import {Component} from '@angular/core';
import {DashboardSearchBaseComponent} from '@common/dashboard/dashboard-search.component.base';
import {selectIsSearching} from '@common/common-search/common-search.reducer';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {debounceTime, filter} from 'rxjs/operators';

@Component({
  selector: 'sm-dashboard-search',
  templateUrl: './dashboard-search.component.html',
  styleUrls: ['./dashboard-search.component.scss'],
})
export class DashboardSearchComponent extends DashboardSearchBaseComponent {

  constructor() {
    super();
    this.store.select(selectIsSearching)
      .pipe(
        debounceTime(200),
        takeUntilDestroyed(),
        filter(active => !active)
      )
      .subscribe(() => this.router.navigate(['dashboard'], ));
  }
}
