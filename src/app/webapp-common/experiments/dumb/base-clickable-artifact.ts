import {Component, OnDestroy} from '@angular/core';
import {Store} from '@ngrx/store';
import {skip} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {selectS3BucketCredentials} from '../../core/reducers/common-auth-reducer';
import {AdminService} from '../../../features/admin/admin.service';

@Component({
  selector: 'base-clickable-artifact',
  template: '<div></div>'
})
export class BaseClickableArtifact  implements OnDestroy {
  private s3subscription: Subscription;
  protected uri: string;

  constructor(protected adminService: AdminService, protected store: Store<any>) {
    this.s3subscription = this.store.select(selectS3BucketCredentials)
      .pipe(skip(1)).subscribe(() => {
        const signed = this.adminService.signUrlIfNeeded(this.uri, true);
        if (signed) {
          window.open(signed, '_blank');
        }
      });
  }

  artifactFilePathClicked(uri: string) {
    this.uri     = uri;
    const signed = this.adminService.signUrlIfNeeded(uri, true);
    if (signed) {
      window.open(signed, '_blank');
    }
  }

  ngOnDestroy(): void {
    this.s3subscription.unsubscribe();
  }

}
