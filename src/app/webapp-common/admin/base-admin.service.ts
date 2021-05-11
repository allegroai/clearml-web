import {Injectable} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {from, Observable, Subject} from 'rxjs';
import {HTTP} from '../../app.constants';
import {
  selectDontShowAgainForBucketEndpoint, selectRevokeSucceed, selectS3BucketCredentials, selectS3BucketCredentialsBucketCredentials
} from '../core/reducers/common-auth-reducer';
import {SmSyncStateSelectorService} from '../core/services/sync-state-selector.service';
import * as S3 from 'aws-sdk/clients/s3';
import {showLocalFilePopUp, showS3PopUp} from '../core/actions/common-auth.actions';
import {skip, take} from 'rxjs/operators';

import AmazonS3URI from 'amazon-s3-uri';
import {convertToReverseProxy, isFileserverUrl} from '../../shared/utils/url';
import {ConfigurationService} from '../shared/services/configuration.service';
import {selectActiveWorkspace} from '../core/reducers/users-reducer';
import {GetCurrentUserResponseUserObjectCompany} from '../../business-logic/model/users/getCurrentUserResponseUserObjectCompany';
import {Environment} from '../../../environments/base';

const LOCAL_SERVER_PORT = 27878;

@Injectable()
export class BaseAdminService {
  bucketCredentials: Observable<any>;
  public S3Services = {};
  revokeSucceed: Observable<any>;
  protected store: Store<any>;
  private S3BucketCredentials: Observable<any>;
  private previouslySignedUrls = {};
  private localServerWorking = false;
  private workspace: GetCurrentUserResponseUserObjectCompany;
  private environment: Environment;
  private deleteS3FilesSubject: Subject<{ success: boolean; files: string[] }>;

  constructor(store: Store<any>, protected syncSelector: SmSyncStateSelectorService, protected confService: ConfigurationService) {
    this.store = store;
    this.revokeSucceed = store.pipe(select(selectRevokeSucceed));
    this.revokeSucceed.subscribe(this.onRevokeSucceed);
    this.S3BucketCredentials = store.pipe(select(selectS3BucketCredentials));
    this.S3BucketCredentials.pipe(skip(1)).subscribe(bucketEndpoint => {
      this.previouslySignedUrls = {};
    });
    this.bucketCredentials = store.pipe(select(selectS3BucketCredentialsBucketCredentials));
    this.store.select(selectActiveWorkspace).subscribe(workspace => this.workspace = workspace);
    confService.getEnvironment().subscribe(conf => this.environment = conf);
    this.deleteS3FilesSubject = new Subject();
  }

  showS3PopUp(bucketKeyEndpoint, error = null, isAzure = false) {
    delete this.S3Services[bucketKeyEndpoint.Bucket + bucketKeyEndpoint.Endpoint];
    const selectDontShowAgainBucketEndpoint = this.syncSelector.selectSync(selectDontShowAgainForBucketEndpoint);
    if (selectDontShowAgainBucketEndpoint !== (bucketKeyEndpoint.Bucket + bucketKeyEndpoint.Endpoint)) {
      this.store.dispatch(showS3PopUp({payload: {credentials: bucketKeyEndpoint, credentialsError: error, isAzure}}));
    }
    return this.S3BucketCredentials;
  }

  showLocalFilePopUp(url) {
    this.store.dispatch(showLocalFilePopUp({url}));
  }

  signUrlIfNeeded(url, skipLocalFile = true, skipFileServer = true) {
    if (isFileserverUrl(url, window.location.hostname)) {
      if (this.environment.communityServer) {
        url = this.addTenant(url);
      }
      if (!skipFileServer && this.environment.useFilesProxy) {
        return convertToReverseProxy(url);
      }
      return url;
    }

    if (this.isLocalFile(url) && !skipLocalFile) {
      this.checkLocalServerRunning(url);
      return this.redirectToLocalServer(url);
    }

    if (this.isGoogleCloudUrl(url)) {
      return this.signGoogleCloudUrl(url);
    }

    const now = new Date();
    if (this.previouslySignedUrls[url] && (new Date(this.previouslySignedUrls[url].expires).getTime() > now.getTime())) {
      return this.previouslySignedUrls[url].signedURL;
    }
    if (this.isAzureUrl(url)) {
      const creds = this.syncSelector.selectSync(selectS3BucketCredentialsBucketCredentials);
      const azureBucket = creds.find((b) => b.Bucket && b.Bucket.toLowerCase() == 'azure');
      if (azureBucket) {
        return this.signAzureUrl(url, azureBucket);
      }
    }
    const bucketKeyEndpoint = url && this.getBucketAndKeyFromSrc(url);
    if (bucketKeyEndpoint) {
      if (this.isAzureUrl(url)) {
        return this.showS3PopUp(bucketKeyEndpoint, null, true);
      }
      const s3 = this.findOrInitBucketS3(bucketKeyEndpoint);
      if (s3) {
        const bucketKey = {
          Bucket: bucketKeyEndpoint.Bucket,
          Key: bucketKeyEndpoint.Key,
          Expires: 60 * 60 * 24 * 4
        };
        let signedURL = '';
        try {
          signedURL = s3.getSignedUrl('getObject', bucketKey);
        } catch (e) {
          console.warn('error while signing s3 url:', url, e);
        }
        const timeToExperation = (new Date()).setDate(now.getDate() + 3);
        this.previouslySignedUrls[url] = {
          signedURL: signedURL,
          expires: timeToExperation,
          bucketKeyEndpoint: bucketKeyEndpoint
        };
        return signedURL;
      } else {
        delete bucketKeyEndpoint.Key;
        this.showS3PopUp(bucketKeyEndpoint);
        return false;
      }

    } else {
      return url;
    }
  }

  findS3CredentialsInStore(bucketKeyEndpoint) {
    return this.syncSelector.selectSync(selectS3BucketCredentialsBucketCredentials)
      .find(bucket => bucket?.Bucket === bucketKeyEndpoint.Bucket && bucket?.Endpoint === bucketKeyEndpoint.Endpoint);
  }

  findOrInitBucketS3(bucketKeyEndpoint) {
    const set = this.findS3CredentialsInStore(bucketKeyEndpoint);
    const S3Service = this.S3Services[bucketKeyEndpoint.Bucket + bucketKeyEndpoint.Endpoint];
    if (set && S3Service) {
      return S3Service;
    } else {
      if (set) {
        this.S3Services[bucketKeyEndpoint.Bucket + bucketKeyEndpoint.Endpoint] = this.createS3Service(set);
        return this.S3Services[bucketKeyEndpoint.Bucket + bucketKeyEndpoint.Endpoint];
      } else {
        return false;
      }
    }
  }

  createS3Service(set): S3 {
    const config = {
      accessKeyId: set.Key,
      secretAccessKey: set.Secret,
      signatureVersion: 'v4',
      region: set.Region,
      endpoint: set.Endpoint ? `${set.Endpoint}/${set.Bucket}` : null,
      s3BucketEndpoint: !!set.Endpoint,
      sslEnabled: !!set.useSSL,
    };
    return new S3(config);
  }

  resetS3Services() {
    this.S3Services = {};
  }

  public checkImgUrl(src) {
    const bucketKeyEndpoint = src && this.getBucketAndKeyFromSrc(src);
    if (bucketKeyEndpoint) {
      delete this.S3Services[bucketKeyEndpoint.Bucket + bucketKeyEndpoint.Endpoint];
      const S3OldCredentials = this.syncSelector.selectSync(selectS3BucketCredentialsBucketCredentials)
        .filter(bucket => bucket.Bucket === bucketKeyEndpoint.Bucket && bucket.Endpoint === bucketKeyEndpoint.Endpoint);
      if (S3OldCredentials[0]) {
        this.showS3PopUp(S3OldCredentials[0], 'Error', this.isAzureUrl(src));
      }
    }
  }


  public getAllCredentials() {
    this.store.dispatch({
      type: HTTP.API_REQUEST,
      meta: {
        method: 'GET',
        endpoint: 'auth.get_credentials',
        success: 'AUTH_GET_SUCCESS'
      }
    });
  }


  private onRevokeSucceed = (bool) => bool ? this.getAllCredentials() : false;

  public resetNewCredential() {
    this.store.dispatch({
      type: 'AUTH_RESET_NEW_CREDENTIAL'
    });
  }

  public isS3Url(src) {
    return src?.startsWith('s3://');
  }

  public isGoogleCloudUrl(src) {
    return src?.startsWith('gs://');
  }

  public getBucketAndKeyFromSrc = (src) => {
    let Key = '';
    if (src && src.includes('azure://')) {
      return {
        Bucket: 'azure',
        Endpoint: 'azure',
        Key: 'azure',
        Secret: Key
      };
    }
    const src_arr = src.split('/');
    if (!this.isS3Url(src)) {
      return null;
    } else if (src_arr[2].includes(':')) {
      src_arr.forEach((part, index) => {
        if (index > 3) {
          Key += part + '/';
        }
      });
      Key = Key.slice(0, -1);
      return {
        Bucket: src_arr[3],
        Endpoint: src_arr[2],
        Key: Key,
      };
    } else {
      try {
        src = this.encodeSpecialCharacters(src);
        const amazon = AmazonS3URI(src);
        return {
          Bucket: amazon.bucket,
          Key: amazon.key,
          Endpoint: null
        };
      } catch (err) {
        console.log(err);
        return null;
      }
    }
  };

  // Uses Allegro Chrome extension injecting patch_local_link function to window - hack to get local files.
  redirectToLocalServer(url: string): string {
    return `http://localhost:${LOCAL_SERVER_PORT}${url.replace('file://', '/')}`;
  }

  isLocalFile(url: string): boolean {
    return url && (url.startsWith('/') || url.startsWith('file://') ||
      url.startsWith(':\\', 1) || url.startsWith('\\\\'));
  }

  checkLocalServerRunning(url: string) {
    if (this.localServerWorking) {
      return;
    }

    from(fetch(`http://localhost:${LOCAL_SERVER_PORT}`, {mode: 'no-cors'}))
      .subscribe(() => {
        this.localServerWorking = true;
      }, () => this.showLocalFilePopUp(url));
  }

  signGoogleCloudUrl(url: string): string {
    return 'https://storage.cloud.google.com' + (url.slice(4));

  }

  signAzureUrl(url: string, azureBucket) {
    const sas = azureBucket ? azureBucket.Secret : '';
    const sasQueryString = url.includes('?') ? sas.replace('?', '&') : sas;
    return url.replace('azure://', 'https://').concat(sasQueryString);
  }

  isAzureUrl(url: string) {
    return url.startsWith('azure://');
  }

  public replaceAll(baseString: string, toReplace: string, replaceWith: string, ignore = false): string {
    return baseString.replace(new RegExp(toReplace.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, '\\$&'), (ignore ? 'gi' : 'g')), (typeof (replaceWith) == 'string') ? replaceWith.replace(/\$/g, '$$$$') : replaceWith);

  }


  private encodeSpecialCharacters(src: string) {
    src = this.replaceAll(src, '%', '%25');
    src = this.replaceAll(src, '#', '%23');
    src = this.replaceAll(src, '\\', '%5C');
    src = this.replaceAll(src, '^', '%5E');
    return src;
  }


  private addTenant(url: string) {
    const u = new URL(url);
    u.searchParams.append('tenant', this.workspace?.id);
    return u.toString();
  }

  public deleteS3Files(files: string[], skipSubjectReturn): Observable<{ success: boolean; files: string[] }> {
    const url = files[0];
    const bucketKeyEndpoint = url && this.getBucketAndKeyFromSrc(url);
    const s3 = this.findOrInitBucketS3(bucketKeyEndpoint) as S3;

    const req = {
      Bucket: bucketKeyEndpoint.Bucket,
      Delete: {
        Quiet: true,
        Objects: files.map(file => ({Key: file} as S3.ObjectIdentifier))
      }
    } as S3.Types.DeleteObjectsRequest;

    if (s3) {
      s3.deleteObjects(req, (err, data) => {
        if (err) {
          this.deleteS3FilesSubject.next({success: false, files: files});
        } else {
          this.deleteS3FilesSubject.next({success: true, files: files});
        }
      });
    } else {
      delete bucketKeyEndpoint.Key;
      this.showS3PopUp(bucketKeyEndpoint).pipe(skip(1), take(1))
        .subscribe(() => this.deleteS3Files(files, true));
    }
    return !skipSubjectReturn && this.deleteS3FilesSubject.asObservable();
  }
}
