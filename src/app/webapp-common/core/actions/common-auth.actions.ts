import {createAction, props} from '@ngrx/store';
import {CredentialKey} from '../../../business-logic/model/auth/credentialKey';

export const AUTH_PREFIX = 'AUTH_';
export const AUTH_ACTIONS = {
  ADD_CREDENTIAL: AUTH_PREFIX + 'ADD_CREDENTIAL',
  CREATE_CREDENTIAL: AUTH_PREFIX + 'CREATE_CREDENTIAL (API)',
  GET_SUCCESS: AUTH_PREFIX + 'GET_SUCCESS',
  REVOKE_SUCCESS: AUTH_PREFIX + 'REVOKE_SUCCESS',
  RESET_NEW_CREDENTIAL: AUTH_PREFIX + 'RESET_NEW_CREDENTIAL',
  GET_TASK_TOKEN_SUCCESS: AUTH_PREFIX + 'GET_TASK_TOKEN_SUCCESS',
  SET_TASK_TOKEN: AUTH_PREFIX + 'SET_TASK_TOKEN',
  GET_ALL_CREDENTIALS: AUTH_PREFIX + 'GET_ALL_CREDENTIALS (API)',
  UPDATE_ALL_CREDENTIALS: AUTH_PREFIX + 'UPDATE_ALL_CREDENTIALS',
  UPDATE_S3_BUCKET_CREDENTIALS: AUTH_PREFIX + 'UPDATE_S3_BUCKET_CREDENTIALS',
  REVOKE_CREDENTIAL: AUTH_PREFIX + 'REVOKE_CREDENTIAL (API)',
};

export const S3_ACTIONS = {
  RESET_DONT_SHOW_AGAIN_FOR_BUCKET_ENDPOINT: AUTH_PREFIX + 'RESET_DONT_SHOW_AGAIN_FOR_BUCKET_ENDPOINT',
  CANCEL_BUCKET_CREDENTIALS: AUTH_PREFIX + 'CANCEL_BUCKET_CREDENTIALS',
  SHOW_S3_POPUP: AUTH_PREFIX + 'SHOW_S3_POPUP',
  RESET_SHOW_S3_POPUP: AUTH_PREFIX + 'RESET_SHOW_S3_POPUP',
  SHOW_LOCAL_FILE_POPUP: AUTH_PREFIX + 'SHOW_LOCAL_FILE_POPUP',
  SET_BUCKETS_CREDENTIALS: AUTH_PREFIX + 'SET_BUCKETS_CREDENTIALS',
  SET_BUCKET_CREDENTIALS: AUTH_PREFIX + 'SET_BUCKET_CREDENTIALS',
  GET_TUTORIAL_BUCKET_CREDENTIALS: AUTH_PREFIX + 'GET_TUTORIAL_BUCKET_CREDENTIALS'
};

export const updateS3Credential = createAction(S3_ACTIONS.SET_BUCKETS_CREDENTIALS, props<{ S3BucketCredentials: any }>());
export const createCredential = createAction(AUTH_ACTIONS.CREATE_CREDENTIAL, props<{workspaceId: string}>());
export const addCredential = createAction(AUTH_ACTIONS.ADD_CREDENTIAL, props<{ newCredential: CredentialKey; workspaceId: string }>());
export const removeCredential = createAction(AUTH_PREFIX + '[remove credentials]', props<{ accessKey: string; workspaceId: string }>());
export const saveS3Credentials = createAction(S3_ACTIONS.SET_BUCKET_CREDENTIALS, props<{ newCredential: any }>());
export const cancelS3Credentials = createAction(S3_ACTIONS.CANCEL_BUCKET_CREDENTIALS, props<{ dontAskAgainForBucketName: string }>());
export const resetDontShowAgainForBucketEndpoint = createAction(S3_ACTIONS.RESET_DONT_SHOW_AGAIN_FOR_BUCKET_ENDPOINT);
export const resetShowS3Popup = createAction(S3_ACTIONS.RESET_SHOW_S3_POPUP);
export const showS3PopUp = createAction(S3_ACTIONS.SHOW_S3_POPUP, props<{ payload: { credentials: any; credentialsError: string; isAzure: boolean } }>());
export const getTutorialBucketCredentials = createAction(S3_ACTIONS.GET_TUTORIAL_BUCKET_CREDENTIALS);
export const showLocalFilePopUp = createAction(S3_ACTIONS.SHOW_LOCAL_FILE_POPUP, props<{ url: string }>());
export const getAllCredentials = createAction(AUTH_ACTIONS.GET_ALL_CREDENTIALS);
export const credentialRevoked = createAction(AUTH_ACTIONS.REVOKE_CREDENTIAL, props<{ accessKey: string; workspaceId: string }>());
export const updateAllCredentials = createAction(AUTH_ACTIONS.UPDATE_ALL_CREDENTIALS, props<{ credentials: CredentialKey[]; extra: CredentialKey[]; workspace: string }>());
