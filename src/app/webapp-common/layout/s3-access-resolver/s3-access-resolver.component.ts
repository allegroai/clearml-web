import {Component, Inject} from '@angular/core';
import {Credentials} from '../../core/reducers/common-auth-reducer';
import {Observable} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProjectDialogComponent} from '../../shared/project-dialog/project-dialog.component';
import {isGoogleCloudUrl} from '@common/settings/admin/base-admin-utils';


export interface S3AccessDialogData {
  credentials: Credentials;
  provider: 's3' | 'gcs' | 'azure';
  credentialsError: string;
}

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
  token: any;
  region: any;
  header: any;
  editMode: any;
  title: string;
  public useSSL: boolean;
  useGcsHmac = false;


  constructor(
    private matDialogRef: MatDialogRef<ProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: S3AccessDialogData
  ) {
    const s3Credentials = data.credentials;
    this.bucket         = s3Credentials.Bucket;
    this.endpoint       = s3Credentials.Endpoint;
    this.key            = s3Credentials.Key;
    this.secret         = s3Credentials.Secret;
    this.token          = s3Credentials.Token;
    this.region         = s3Credentials.Region;
    if (data.credentialsError) {
      this.header = this.header = `${data.credentialsError}, please check credentials for bucket <b>${this.bucket}</b>.`;
    }  else {
      if (data?.provider !== 'gcs') {
        this.header = `Please provide credentials for bucket <b>${this.bucket}</b>.`;
      }
    }
    switch (data?.provider) {
      case 'azure':
        this.title = 'Azure Credentials';
        break;
      case 'gcs':
        this.title = 'GCS Credentials';
        break;
      default:
        this.title = 'S3 Credentials';
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

  protected readonly isGoogleCloudUrl = isGoogleCloudUrl;

  reload() {
    window.location.reload();
  }
}
