import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {Credentials, selectS3BucketCredentials} from '@common/core/reducers/common-auth-reducer';
import {updateS3Credential} from '@common/core/actions/common-auth.actions';
import {AdminService} from '~/shared/services/admin.service';

@Component({
  selector: 'sm-profile-key-storage',
  templateUrl: './profile-key-storage.component.html',
  styleUrls: ['./profile-key-storage.component.scss']
})
export class ProfileKeyStorageComponent {

  public s3BucketCredentials$ = this.store.select(selectS3BucketCredentials);

  constructor(private store: Store,
              private adminService: AdminService) { }

  onS3BucketCredentialsChanged(formData: {bucketCredentials: Credentials[]}) {
    this.adminService.resetS3Services();
    this.store.dispatch(updateS3Credential({s3BucketCredentials: formData}));
  }
}
