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
export class BaseClickableArtifactComponent implements OnDestroy {
  private s3subscription: Subscription;
  protected uri: string;
  protected timestamp: number;

  constructor(protected adminService: AdminService, protected store: Store<any>) {
    this.s3subscription = this.store.select(selectS3BucketCredentials)
      .pipe(skip(1)).subscribe(() => {
        this.artifactFilePathClicked(this.uri);
      });
  }

  artifactFilePathClicked(uri: string) {
    this.uri     = uri;
    const signed = this.adminService.signUrlIfNeeded(uri, {disableCache: this.timestamp});
    if (signed) {
      window.open(signed, '_blank');
    }
  }

  ngOnDestroy(): void {
    this.s3subscription.unsubscribe();
  }

}
