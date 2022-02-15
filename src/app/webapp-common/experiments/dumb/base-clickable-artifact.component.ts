import {Component, OnDestroy} from '@angular/core';
import {Store} from '@ngrx/store';
import {filter, map, take} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {selectSignedUrl} from '../../core/reducers/common-auth-reducer';
import {AdminService} from '~/shared/services/admin.service';
import {getSignedUrl} from '../../core/actions/common-auth.actions';

@Component({
  selector: 'sm-base-clickable-artifact',
  template: '<div></div>'
})
export class BaseClickableArtifactComponent {
  protected timestamp: number;

  constructor(protected adminService: AdminService, protected store: Store<any>) {
  }

  artifactFilePathClicked(url: string) {
    this.signUrl(url)
      .subscribe(signedUrl => window.open(signedUrl, '_blank'));
  }

  protected signUrl(url: string) {
    this.store.dispatch(getSignedUrl({url, config: {disableCache: this.timestamp}}));
    return this.store.select(selectSignedUrl(url))
      .pipe(
        map((res => res?.signed)),
        filter(signedUrl => !!signedUrl),
        take(1)
      );
  }
}
