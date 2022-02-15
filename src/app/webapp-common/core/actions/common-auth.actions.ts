import {createAction, props} from '@ngrx/store';
import {CredentialKeyExt, Credentials} from '../reducers/common-auth-reducer';
import {GetCurrentUserResponseUserObjectCompany} from '~/business-logic/model/users/getCurrentUserResponseUserObjectCompany';

export const AUTH_PREFIX = 'AUTH_';

export const updateS3Credential = createAction(
  AUTH_PREFIX + 'SET_BUCKETS_CREDENTIALS',
  props<{s3BucketCredentials: {bucketCredentials: Credentials[]}}>()
);
export const createCredential = createAction(
  AUTH_PREFIX + 'CREATE_CREDENTIAL (API)',
  props<{workspace: GetCurrentUserResponseUserObjectCompany; openCredentialsPopup?: boolean}>()
);
export const addCredential = createAction(
  AUTH_PREFIX + 'ADD_CREDENTIAL',
  props<{ newCredential: CredentialKeyExt; workspaceId: string }>()
);
export const resetCredential = createAction(AUTH_PREFIX + 'RESET_CREDENTIAL');
export const removeCredential = createAction(
  AUTH_PREFIX + '[remove credentials]',
  props<{ accessKey: string; workspaceId: string }>()
);
export const saveS3Credentials = createAction(AUTH_PREFIX + 'SET_BUCKET_CREDENTIALS',
  props<{ newCredential: Credentials }>()
);
export const cancelS3Credentials = createAction(
  AUTH_PREFIX + 'CANCEL_BUCKET_CREDENTIALS',
  props<{ dontAskAgainForBucketName: string }>()
);
export const resetDontShowAgainForBucketEndpoint = createAction(AUTH_PREFIX + 'RESET_DONT_SHOW_AGAIN_FOR_BUCKET_ENDPOINT');
export const resetShowS3Popup = createAction(AUTH_PREFIX + 'RESET_SHOW_S3_POPUP');
export const showS3PopUp = createAction(
  AUTH_PREFIX + 'SHOW_S3_POPUP',
  props<{credentials: Credentials; credentialsError: string; isAzure: boolean}>()
);
export const getTutorialBucketCredentials = createAction(AUTH_PREFIX + 'GET_TUTORIAL_BUCKET_CREDENTIALS');
export const showLocalFilePopUp = createAction(
  AUTH_PREFIX + 'SHOW_LOCAL_FILE_POPUP',
  props<{ url: string }>()
);
export const getAllCredentials = createAction(AUTH_PREFIX + 'GET_ALL_CREDENTIALS');
export const credentialRevoked = createAction(
  AUTH_PREFIX + 'REVOKE_CREDENTIAL (API)',
  props<{ accessKey: string; workspaceId: string }>()
);
export const updateAllCredentials = createAction(
  AUTH_PREFIX + 'UPDATE_ALL_CREDENTIALS',
  props<{ credentials: CredentialKeyExt[]; extra: {[workspace: string]: CredentialKeyExt[]}; workspace: string }>()
);
export const getSignedUrl = createAction(
  AUTH_PREFIX + '[get signed url]',
  props<{url: string; config?: { skipLocalFile?: boolean; skipFileServer?: boolean; disableCache?: number; dprsUrl?: string | boolean }}>()
);
export const setSignedUrl = createAction(
  AUTH_PREFIX + '[set signed url]',
  props<{url: string; signed: string; expires: number}>()
);

