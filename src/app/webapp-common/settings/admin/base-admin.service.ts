import {Injectable} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {from, fromEvent, Observable, of, Subject} from 'rxjs';
import {fromFetch} from 'rxjs/fetch';
import {catchError, debounceTime, filter, map, skip} from 'rxjs/operators';
import {DeleteObjectsCommand, GetObjectCommand, ObjectIdentifier, S3Client, S3ClientConfig} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {convertToReverseProxy, isFileserverUrl} from '~/shared/utils/url';
import {selectRevokeSucceed, selectS3BucketCredentials, selectS3BucketCredentialsBucketCredentials} from '../../core/reducers/common-auth-reducer';
import {getAllCredentials, refreshS3Credential, showLocalFilePopUp} from '../../core/actions/common-auth.actions';
import {ConfigurationService} from '../../shared/services/configuration.service';
import {Environment} from '../../../../environments/base';
import {DEFAULT_REGION} from '../../shared/utils/amazon-s3-uri';
import {getBucketAndKeyFromSrc, SignResponse} from '@common/settings/admin/base-admin-utils';

const LOCAL_SERVER_PORT = 27878;
const FOUR_DAYS = 60 * 60 * 24 * 4;
const HTTP_REGEX = /^https?:\/\//;


@Injectable()
export class BaseAdminService {
  bucketCredentials: Observable<any>;
  public s3Services: {[bucket: string]: S3Client} = {};
  revokeSucceed: Observable<any>;
  private readonly s3BucketCredentials: Observable<any>;
  private previouslySignedUrls = {};
  private localServerWorking = false;
  private environment: Environment;
  private deleteS3FilesSubject: Subject<{ success: boolean; files: string[] }>;
  private credentials: any[];

  constructor(protected store: Store, protected confService: ConfigurationService) {
    this.store = store;
    this.revokeSucceed = store.pipe(select(selectRevokeSucceed));
    this.revokeSucceed.subscribe(this.onRevokeSucceed);
    this.s3BucketCredentials = store.pipe(select(selectS3BucketCredentials));
    this.s3BucketCredentials.pipe(skip(1)).subscribe(() => {
      this.previouslySignedUrls = {};
    });
    store.select(selectS3BucketCredentialsBucketCredentials)
      .subscribe(cred => this.credentials = cred);
    confService.getEnvironment().subscribe(conf => this.environment = conf);
    this.deleteS3FilesSubject = new Subject();

    fromEvent(window, 'storage')
      .pipe(
        filter((event: StorageEvent) => event.key === '_saved_state_'),
        debounceTime(50)
      )
      .subscribe(() => {
        this.store.dispatch(refreshS3Credential());
      });
  }

  showLocalFilePopUp(url) {
    this.store.dispatch(showLocalFilePopUp({url}));
  }

  signUrlIfNeeded(url: string, config?: { skipLocalFile?: boolean; skipFileServer?: boolean; disableCache?: number }):
    Observable<SignResponse> {
    config = {...{skipLocalFile: true, skipFileServer: this.confService.getStaticEnvironment().production, disableCache: null}, ...config};

    if (isFileserverUrl(url)) {
      if (this.environment.communityServer) {
        url = this.addTenant(url);
      }
      if (config.disableCache) {
        url = this.addS3TimeStamp(url, config.disableCache);
      }
      if (!config.skipFileServer && this.environment.useFilesProxy) {
        return of({type: 'sign', signed: convertToReverseProxy(url), expires: Number.MAX_VALUE});
      }
      return of({type: 'sign', signed: url, expires: Number.MAX_VALUE});
    }

    if (this.isLocalFile(url) && !config.skipLocalFile) {
      this.checkLocalServerRunning(url);
      return of({type: 'sign', signed: this.redirectToLocalServer(url), expires: Number.MAX_VALUE});
    }

    if (this.isGoogleCloudUrl(url)) {
      return of({type: 'sign', signed: this.signGoogleCloudUrl(url), expires: Number.MAX_VALUE});
    }

    if (this.isAzureUrl(url)) {
      const azureBucket = this.credentials.find((b) => b.Bucket && b.Bucket.toLowerCase() == 'azure');
      if (azureBucket) {
        return of({type: 'sign', signed: this.signAzureUrl(url, azureBucket), expires: Number.MAX_VALUE});
      }
    }
    const bucketKeyEndpoint = url && getBucketAndKeyFromSrc(url);
    if (bucketKeyEndpoint) {
      if (this.isAzureUrl(url)) {
        return of({type: 'popup', bucket: bucketKeyEndpoint, azure: true});
      }
      const s3 = this.findOrInitBucketS3(bucketKeyEndpoint);
      if (s3) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const command = new GetObjectCommand({Key: bucketKeyEndpoint.Key, Bucket: bucketKeyEndpoint.Bucket/*, ResponseContentType: 'image/jpeg'*/});
        return from(getSignedUrl(s3, command, {
          expiresIn: FOUR_DAYS,
          unhoistableHeaders: new Set(['x-amz-content-sha256', 'x-id']),
          unsignableHeaders: new Set(['x-amz-content-sha256', 'x-id']),
        }))
          .pipe(map(signed => ({type: 'sign', signed, expires: (new Date()).getTime() + FOUR_DAYS * 1000})));
      } else {
        delete bucketKeyEndpoint.Key;
        return of({type: 'popup', bucket: bucketKeyEndpoint});
      }
    } else {
      return of({type: 'sign', signed: url, expires: Number.MAX_VALUE});
    }
  }

  findS3CredentialsInStore(bucketKeyEndpoint) {
    return this.credentials
      .find(bucket => bucket?.Bucket === bucketKeyEndpoint.Bucket && bucket?.Endpoint?.replace(HTTP_REGEX,'') == bucketKeyEndpoint.Endpoint);
  }

  findOrInitBucketS3(bucketKeyEndpoint) {
    const set = this.findS3CredentialsInStore(bucketKeyEndpoint);
    const s3Service = this.s3Services[bucketKeyEndpoint.Bucket + bucketKeyEndpoint.Endpoint];
    if (set && s3Service) {
      return s3Service;
    } else {
      if (set) {
        this.s3Services[bucketKeyEndpoint.Bucket + bucketKeyEndpoint.Endpoint] = this.createS3Service(set);
        return this.s3Services[bucketKeyEndpoint.Bucket + bucketKeyEndpoint.Endpoint];
      }
    }
  }

  createS3Service(set) {
    // const [hostPort, path] = set.Endpoint?.split('/');
    const [hostname, port] = set.Endpoint?.replace(HTTP_REGEX,'')?.split(':') || ['', ''];
    const config = {
      region: set.Region || DEFAULT_REGION,
      credentials: {
        accessKeyId: set.Key,
        secretAccessKey: set.Secret
      },
      ...(set.Endpoint && {
        endpoint: {
          protocol: set.Endpoint?.startsWith('https') ? 'https' : 'http',
          hostname,
          ...(!['80', '443'].includes(port) && {port}),
          path: '',
        },
        forcePathStyle: true,
        tls: false,
      }),
    } as S3ClientConfig;
    return new S3Client(config);
  }

  resetS3Services() {
    this.s3Services = {};
  }

  public getAllCredentials() {
    this.store.dispatch(getAllCredentials());
  }

  private onRevokeSucceed = (bool) => bool ? this.getAllCredentials() : false;

  public isGoogleCloudUrl(src) {
    return src?.startsWith('gs://');
  }


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

    fromFetch(`http://localhost:${LOCAL_SERVER_PORT}`, {mode: 'no-cors'})
      .pipe(catchError(() => {
        this.showLocalFilePopUp(url);
        return [];
      }))
      .subscribe(() =>
        this.localServerWorking = true);
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


  protected addTenant(url: string) {
    return url;
  }

  public deleteS3Files(files: string[], skipSubjectReturn): Observable<{ success: boolean; files: string[] }> {
    const url = files[0];
    const bucketKeyEndpoint = url && getBucketAndKeyFromSrc(url);
    const s3 = this.findOrInitBucketS3(bucketKeyEndpoint) as S3Client;

    /* eslint-disable @typescript-eslint/naming-convention */
    const command = new DeleteObjectsCommand({
      Bucket: bucketKeyEndpoint.Bucket,
      Delete: {
        Quiet: true,
        Objects: files.map(file => ({Key: file} as ObjectIdentifier))
      }
    });
    /* eslint-enable @typescript-eslint/naming-convention */
    if (s3) {
      s3.send(command).then(response => {
        if (response.Errors?.length > 0) {
          this.deleteS3FilesSubject.next({success: false, files});
        } else {
          this.deleteS3FilesSubject.next({success: true, files});
        }
      });
    } else {
      delete bucketKeyEndpoint.Key;
      // TODO: use store
      // this.showS3PopUp(bucketKeyEndpoint).pipe(skip(1), take(1))
      //   .subscribe(() => this.deleteS3Files(files, true));
    }
    return !skipSubjectReturn && this.deleteS3FilesSubject.asObservable();
  }

  addS3TimeStamp(url: string, timestamp: number) {
    timestamp = timestamp || new Date().getTime();
    try {
      const parsed = new URL(url);
      parsed.searchParams.append('X-Amz-Date', `${timestamp}`);
      return  parsed.toString();
    } catch {
      return url;
    }
  }

}
