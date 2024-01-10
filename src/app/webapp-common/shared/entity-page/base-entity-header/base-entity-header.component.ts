import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {BreakpointObserver, BreakpointState} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectMaxDownloadItems} from '@common/core/reducers/users-reducer';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';

@Component({
  selector: 'sm-base-entity-header',
  template: '',
  standalone: true,
})
export class BaseEntityHeaderComponent {
  @Input() noData: boolean;
  @Input() entityType: EntityTypeEnum;
  @Output() downloadTableAsCSV = new EventEmitter();
  @Output() downloadFullTableAsCSV = new EventEmitter();

  public isSmallScreen$: Observable<BreakpointState>;
  public maxDownloadItems$: Observable<number>;
  private breakpointObserver = inject(BreakpointObserver)
  private store = inject(Store)
  constructor() {
    this.isSmallScreen$ = this.breakpointObserver.observe('(max-width: 1450px)');
    this.maxDownloadItems$ = this.store.select(selectMaxDownloadItems);
  }
}
