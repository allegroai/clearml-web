import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BreakpointObserver, BreakpointState} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectMaxDownloadItems} from '@common/core/reducers/users-reducer';

@Component({
  selector: 'sm-base-entity-header',
  template: '',
})
export class BaseEntityHeaderComponent {
  @Input() noData: boolean;
  @Output() downloadTableAsCSV = new EventEmitter();
  @Output() downloadFullTableAsCSV = new EventEmitter();

  public isSmallScreen$: Observable<BreakpointState>;
  public maxDownloadItems$: Observable<number>;

  constructor(private breakpointObserver: BreakpointObserver, private store: Store) {
    this.isSmallScreen$ = breakpointObserver.observe('(max-width: 1450px)');
    this.maxDownloadItems$ = this.store.select(selectMaxDownloadItems);
  }
}
