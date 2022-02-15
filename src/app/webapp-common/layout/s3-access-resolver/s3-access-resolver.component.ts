import {Component, Inject} from '@angular/core';
import {Credentials} from '../../core/reducers/common-auth-reducer';
import {Observable} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProjectDialogComponent} from '../../shared/project-dialog/project-dialog.component';

@Component({
  selector   : 'sm-s3-access-resolver',
  templateUrl: './s3-access-resolver.component.html',
  styleUrls  : ['./s3-access-resolver.component.scss']
})
export class S3AccessResolverComponent {
  show: Observable<any>;
  subscription: any;
  bucket: string;
  endpoint: any;
  key: any;
  secret: any;
  region: any;
  header: any;
  editMode: any;
  public useSSL: boolean;
  public isAzure: boolean;


  constructor(
    private matDialogRef: MatDialogRef<ProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {credentials: Credentials; isAzure?: boolean; credentialsError}
  ) {
    const s3Credentials = data.credentials;
    this.bucket         = s3Credentials.Bucket;
    this.endpoint       = s3Credentials.Endpoint;
    this.key            = s3Credentials.Key;
    this.secret         = s3Credentials.Secret;
    this.region         = s3Credentials.Region;
    this.isAzure        = data.isAzure;
    if (data.credentialsError) {
      this.header = this.header = `${data.credentialsError}, please check credentials for bucket <b>${this.bucket}</b>.`;
    } else {
      this.header = `Please provide credentials for bucket <b>${this.bucket}</b>.`;
    }
  }

  saveS3Credentials(newCredential) {
    this.matDialogRef.close({
      success : true,
      ...newCredential
    });
  }

  cancelClicked() {
    this.matDialogRef.close({
      success : false,
      Bucket  : this.bucket,
      Endpoint: this.endpoint
    });
  }

  xClicked() {
    this.matDialogRef.close({
      success : false,
      Bucket  : this.bucket,
      Endpoint: this.endpoint,
    });
  }

}
