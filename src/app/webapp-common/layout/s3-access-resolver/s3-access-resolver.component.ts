import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectS3PopUpDetails} from '../../core/reducers/common-auth-reducer';
import {saveS3Credentials} from '../../core/actions/common-auth.actions';
import {Observable, Subscription} from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import {ProjectDialogComponent} from '../../shared/project-dialog/project-dialog.component';

@Component({
  selector   : 'sm-s3-access-resolver',
  templateUrl: './s3-access-resolver.component.html',
  styleUrls  : ['./s3-access-resolver.component.scss']
})
export class S3AccessResolverComponent implements OnDestroy, OnInit {
  show: Observable<any>;
  subscription: any;
  bucket: string;
  endpoint: any;
  key: any;
  secret: any;
  region: any;
  header: any;
  editMode: any;
  private popupDetailsSubscription: Subscription;
  private popupDetails: Observable<any>;
  public useSSL: boolean;
  public isAzure: boolean;


  constructor(private store: Store<any>, private matDialogRef: MatDialogRef<ProjectDialogComponent>) {
    this.popupDetails = this.store.select(selectS3PopUpDetails);
  }

  ngOnInit(): void {
    this.popupDetailsSubscription = this.popupDetails.subscribe((S3PopUpDetails) => {
      if (S3PopUpDetails && S3PopUpDetails.credentials) {
        const S3Credentials = S3PopUpDetails.credentials;
        this.bucket         = S3Credentials.Bucket;
        this.endpoint       = S3Credentials.Endpoint;
        this.key            = S3Credentials.Key;
        this.secret         = S3Credentials.Secret;
        this.region         = S3Credentials.Region;
        this.useSSL         = this.shouldUseSSl(S3Credentials);
        this.isAzure        = S3PopUpDetails.isAzure;
        if (S3PopUpDetails.credentialsError) {
          this.header = this.header = `${S3PopUpDetails.credentialsError}, please check credentials for bucket <b>${this.bucket}</b>.`;
        } else {
          this.header = `Please provide credentials for bucket <b>${this.bucket}</b>.`;
        }
      }
    }
    );
  }

  ngOnDestroy() {
    this.popupDetailsSubscription.unsubscribe();
  }

  saveS3Credentials(newCredential) {
    this.store.dispatch(saveS3Credentials({newCredential}));
    this.matDialogRef.close({
      success : true,
      bucket  : this.bucket,
      endpoint: this.endpoint,
      useSSL  : this.useSSL
    });
  }

  cancelClicked() {
    this.matDialogRef.close({
      success : false,
      bucket  : this.bucket,
      endpoint: this.endpoint,
      useSSL  : this.useSSL
    });
  }

  shouldUseSSl(credentials) {
    if (credentials && credentials.useSSL !== undefined) {
      return credentials.useSSL;
    } else {
      // If this is local server, default should be false.
      return !credentials.Endpoint;
    }
  }

  xClicked() {
    this.matDialogRef.close({
      success : false,
      bucket  : this.bucket,
      endpoint: this.endpoint,
      useSSL  : this.useSSL
    });
  }

}
