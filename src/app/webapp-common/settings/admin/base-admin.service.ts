import {Injectable} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {from, Observable, of, Subject} from 'rxjs';
import {
  Credentials, selectRevokeSucceed,
  selectS3BucketCredentials, selectS3BucketCredentialsBucketCredentials
} from '../../core/reducers/common-auth-reducer';
import {S3Client, ObjectIdentifier, DeleteObjectsCommand, GetObjectCommand} from '@aws-sdk/client-s3';
import {S3ClientConfig} from '@aws-sdk/client-s3';
// import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {getAllCredentials, showLocalFilePopUp} from '../../core/actions/common-auth.actions';
import {map, skip} from 'rxjs/operators';
import {convertToReverseProxy, isFileserverUrl} from '../../../shared/utils/url';
import {ConfigurationService} from '../../shared/services/configuration.service';
import {selectActiveWorkspace} from '../../core/reducers/users-reducer';
import {GetCurrentUserResponseUserObjectCompany} from '../../../business-logic/model/users/getCurrentUserResponseUserObjectCompany';
import {Environment} from '../../../../environments/base';
import {AmazonS3URI, DEFAULT_REGION} from '../../shared/utils/amazon-s3-uri';
import {fromPromise} from 'rxjs/internal-compatibility';
import {BuildMiddleware, MetadataBearer, RequestPresigningArguments} from '@aws-sdk/types';
import {Client, Command} from '@aws-sdk/smithy-client';
import {HttpRequest} from '@aws-sdk/protocol-http';
import {formatUrl} from '@aws-sdk/util-format-url';
import {S3RequestPresigner} from '@aws-sdk/s3-request-presigner';

const LOCAL_SERVER_PORT = 27878;
const FOUR_DAYS = 60 * 60 * 24 * 4;
const HTTP_REGEX = /^https?:\/\//;

export interface SignResponse {
  type: 'popup' | 'sign' | 'none';
  signed?: string;
  expires?: number;
  bucket?: Credentials;
  azure?: boolean;
}

export const isS3Url = (src) => src?.startsWith('s3://');

const replaceAll = (baseString: string, toReplace: string, replaceWith: string, ignore = false) =>
  baseString.replace(new RegExp(toReplace.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, '\\$&'), (ignore ? 'gi' : 'g')), (typeof (replaceWith) == 'string') ? replaceWith.replace(/\$/g, '$$$$') : replaceWith);

const encodeSpecialCharacters = (src: string) => {
  src = replaceAll(src, '%', '%25');
  src = replaceAll(src, '#', '%23');
  src = replaceAll(src, '\\', '%5C');
  src = replaceAll(src, '^', '%5E');
  return src;
};

export const getBucketAndKeyFromSrc = (src) => {
  let key = '';
  if (src && src.includes('azure://')) {
    /* eslint-disable @typescript-eslint/naming-convention */
    return {
      Bucket: 'azure',
      Endpoint: 'azure',
      Key: 'azure',
      Secret: key
    };
    /* eslint-enable @typescript-eslint/naming-convention */
  }
  const srcArr = src.split('/');
  if (!isS3Url(src)) {
    return null;
  } else if (srcArr[2].includes(':')) {
    // We identify minio cae by it's port (:) and use same behavior in case user already set credentials for that endpoint
    srcArr.forEach((part, index) => {
      if (index > 3) {
        key += part + '/';
      }
    });
    key = key.slice(0, -1);
    /* eslint-disable @typescript-eslint/naming-convention */
    return {
      Bucket: srcArr[3],
      Endpoint: srcArr[2],
      Key: key,
    };
    /* eslint-enable @typescript-eslint/naming-convention */
  } else {
    try {
      src = encodeSpecialCharacters(src);
      const amazon = new AmazonS3URI(src);
      /* eslint-disable @typescript-eslint/naming-convention */
      return {
        Bucket: amazon.bucket,
        Key: amazon.key,
        Region: amazon.region,
        Endpoint: null
      };
      /* eslint-enable @typescript-eslint/naming-convention */
    } catch (err) {
      console.log(err);
      return null;
    }
  }
};
export const inBucket = (url: string, bucket: string, endpoint: string) => {
  const {Bucket: urlBucket, Endpoint: urlEndpoint} = getBucketAndKeyFromSrc(url);
  return urlBucket === bucket && urlEndpoint === endpoint;
};


export const getSignedUrl = async <
  InputTypesUnion extends object,
  InputType extends InputTypesUnion,
  OutputType extends MetadataBearer = MetadataBearer
  >(
  client: Client<any, InputTypesUnion, MetadataBearer, any>,
  command: Command<InputType, OutputType, any, InputTypesUnion, MetadataBearer>,
  options: RequestPresigningArguments = {}
): Promise<string> => {
  const s3Presigner = new S3RequestPresigner({ ...client.config });
  const presignInterceptMiddleware: BuildMiddleware<InputTypesUnion, MetadataBearer> =
    (next, context) => async (args) => {
      const { request } = args;
      if (!HttpRequest.isInstance(request)) {
        throw new Error('Request to be presigned is not an valid HTTP request.');
      }
      // Retry information headers are not meaningful in presigned URLs
      delete request.headers['amz-sdk-invocation-id'];
      delete request.headers['amz-sdk-request'];
      // User agent header would leak sensitive information
      delete request.headers['x-amz-user-agent'];
      delete request.headers['x-amz-content-sha256'];

      delete request.query['x-id'];

      if (request.port) {
        request.headers['host'] = `${request.hostname}:${request.port}`;
      }

      const presigned = await s3Presigner.presign(request, {
        ...options,
        signingRegion: options.signingRegion ?? context['signing_region'],
        signingService: options.signingService ?? context['signing_service'],
      });
      return {
        // Intercept the middleware stack by returning fake response
        response: {},
        output: {
          $metadata: { httpStatusCode: 200 },
          presigned,
        },
      } as any;
    };
  const middlewareName = 'presignInterceptMiddleware';
  client.middlewareStack.addRelativeTo(presignInterceptMiddleware, {
    name: middlewareName,
    relation: 'before',
    toMiddleware: 'awsAuthMiddleware',
    override: true,
  });

  let presigned: HttpRequest;
  try {
    const output = await client.send(command);
    //@ts-ignore the output is faked, so it's not actually OutputType
    presigned = output.presigned;
  } finally {
    client.middlewareStack.remove(middlewareName);
  }

  return formatUrl(presigned);
};


@Injectable()
export class BaseAdminService {
  bucketCredentials: Observable<any>;
  public s3Services: {[bucket: string]: S3Client} = {};
  revokeSucceed: Observable<any>;
  protected store: Store<any>;
  private readonly s3BucketCredentials: Observable<any>;
  private previouslySignedUrls = {};
  private localServerWorking = false;
  private workspace: GetCurrentUserResponseUserObjectCompany;
  private environment: Environment;
  private deleteS3FilesSubject: Subject<{ success: boolean; files: string[] }>;
  private credentials: any[];

  constructor(store: Store<any>, protected confService: ConfigurationService) {
    this.store = store;
    this.revokeSucceed = store.pipe(select(selectRevokeSucceed));
    this.revokeSucceed.subscribe(this.onRevokeSucceed);
    this.s3BucketCredentials = store.pipe(select(selectS3BucketCredentials));
    this.s3BucketCredentials.pipe(skip(1)).subscribe(() => {
      this.previouslySignedUrls = {};
    });
    store.select(selectS3BucketCredentialsBucketCredentials)
      .subscribe(cred => this.credentials = cred);
    this.store.select(selectActiveWorkspace).subscribe(workspace => this.workspace = workspace);
    confService.getEnvironment().subscribe(conf => this.environment = conf);
    this.deleteS3FilesSubject = new Subject();
  }

  showLocalFilePopUp(url) {
    this.store.dispatch(showLocalFilePopUp({url}));
  }

  signUrlIfNeeded(url: string, config?: { skipLocalFile?: boolean; skipFileServer?: boolean; disableCache?: number }):
    Observable<SignResponse> {
    config = {...{skipLocalFile: true, skipFileServer: true, disableCache: null}, ...config};

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
        return fromPromise(getSignedUrl(s3, command, {
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


  private addTenant(url: string) {
    const u = new URL(url);
    u.searchParams.append('tenant', this.workspace?.id);
    return u.toString();
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
