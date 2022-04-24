import {Component} from '@angular/core';
import {BreakpointObserver, BreakpointState} from '@angular/cdk/layout';
import {Observable} from 'rxjs';

@Component({
  selector: 'sm-base-entity-header',
  template: '',
})
export class BaseEntityHeaderComponent {
  public isSmallScreen$: Observable<BreakpointState>;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.isSmallScreen$ = breakpointObserver.observe('(max-width: 1450px)');
  }
}
