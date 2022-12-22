import {createSelector, on, ReducerTypes, select, Store} from '@ngrx/store';
import {filter, map, takeWhile, timeout} from 'rxjs/operators';
import {isEqual} from 'lodash/fp';
import {
  addCredential,
  cancelS3Credentials,
  removeCredential, removeSignedUrl, resetCredential,
  resetDontShowAgainForBucketEndpoint,
  saveS3Credentials, setCredentialLabel, setS3Credentials, setSignedUrl,
  showLocalFilePopUp,
  updateAllCredentials,
  updateS3Credential
} from '../actions/common-auth.actions';
import {CredentialKey} from '~/business-logic/model/auth/credentialKey';
import {inBucket} from '@common/settings/admin/base-admin-utils';

export interface Credentials {
  Bucket?: string;
  Endpoint?: string;
  Key?: string;
  Secret?: string;
  Region?: string;
}

export interface CredentialKeyExt extends CredentialKey {
  secret_key?: string;
  company?: string;
  access_key?: string;
}

export interface AuthState {
  showLocalFilePopup: boolean;
  localFilesPopupURLs: Array<string>;
  revokeSucceed: boolean;
  credentials: { [workSpaceId: string]: CredentialKeyExt[] };
  newCredential: CredentialKeyExt;
  dontShowAgainForBucketEndpoint: string;
  s3BucketCredentials: { bucketCredentials: Credentials[] };
  signedUrls: { [url: string]: { signed: string; expires: number } };
}

export const initAuth: AuthState = {
  showLocalFilePopup: false,
  localFilesPopupURLs: [],
  revokeSucceed: false,
  credentials: {},
  newCredential: null,
  dontShowAgainForBucketEndpoint: '',
  s3BucketCredentials: {
    bucketCredentials: []
  },
  signedUrls: {}
};

export const selectAuth = state => state.auth as AuthState;

// Auth selectors
export const selectRevokeSucceed = createSelector(selectAuth, state => state.revokeSucceed);
export const selectCredentials = createSelector(selectAuth, state => state.credentials);
export const selectNewCredential = createSelector(selectAuth, state => state.newCredential);
export const selectS3BucketCredentials = createSelector(selectAuth, state => state?.s3BucketCredentials);
export const selectS3BucketCredentialsBucketCredentials = createSelector(selectAuth, state => state?.s3BucketCredentials?.bucketCredentials);
export const selectShowLocalFilesPopUp = createSelector(selectAuth, state => state.showLocalFilePopup);
export const selectDontShowAgainForBucketEndpoint = createSelector(selectAuth, state => state.dontShowAgainForBucketEndpoint);
export const selectSignedUrls = createSelector(selectAuth, state => state.signedUrls);
export const selectSignedUrl = url => createSelector(selectAuth, state => state.signedUrls[url]);
export const getSignedUrlOrOrigin$ = (url: string, store: Store) => store.pipe(
  select(selectSignedUrl(url)),
  filter(signed => !!signed?.signed),
  map(signed => signed?.signed),
  timeout({
      first: 900,
      with: () => store.select(selectSignedUrl(url))
        .pipe(
          takeWhile(signed => signed !== null),
          map(signed => signed?.signed || url)
        )
    }
  ),
);


export const commonAuthReducer = [
  on(showLocalFilePopUp, (state, action) => ({...state, showLocalFilePopup: true, localFilesPopupURLs: Array.from(new Set([...state.localFilesPopupURLs, action.url]))})),
  on(cancelS3Credentials, (state, action) => ({...state, dontShowAgainForBucketEndpoint: action.dontAskAgainForBucketName})),
  on(updateS3Credential, (state, action) => ({
    ...state,
    s3BucketCredentials: action.s3BucketCredentials,
    dontShowAgainForBucketEndpoint: '',
    newCredential: initAuth.newCredential,
    signedUrls: {}
  })),
  on(resetDontShowAgainForBucketEndpoint, (state) => ({...state, dontShowAgainForBucketEndpoint: ''})),
  on(saveS3Credentials, (state, action) => {
    const credIndex = state.s3BucketCredentials.bucketCredentials.findIndex((creds) =>
      (creds?.Bucket === action.newCredential.Bucket && creds?.Endpoint === action.newCredential.Endpoint));
    if (credIndex > -1) {
      return {
        ...state,
        s3BucketCredentials: {
          bucketCredentials: state.s3BucketCredentials.bucketCredentials.map((creds, index) =>
            index === credIndex ? action.newCredential : creds)
        },
        signedUrls: Object.fromEntries(Object.entries(state.signedUrls).filter(([url]) =>
          !inBucket(url, action.newCredential.Bucket, action.newCredential.Endpoint)
        ))
      };
    } else {
      return {...state, s3BucketCredentials: {bucketCredentials: [...state.s3BucketCredentials.bucketCredentials, action.newCredential]}};
    }
  }),
  on(setS3Credentials, (state, action) => {
    if (isEqual(state.s3BucketCredentials?.bucketCredentials, action.bucketCredentials)) {
      return state;
    } else {
      return {...state, s3BucketCredentials: {bucketCredentials: action.bucketCredentials}};
    }
  }),
  on(resetCredential, state => ({...state, newCredential: initAuth.newCredential})),
  on(addCredential, (state, action) => ({
    ...state,
    newCredential: {...action.newCredential, company: action.workspaceId},
    credentials: {
      ...state.credentials,
      [action.workspaceId]: [
        ...(state.credentials[action.workspaceId] || []),
        ...(Object.keys(action.newCredential).length > 0 ? [{...action.newCredential, company: action.workspaceId}] : [])
      ]
    }
  })),
  on(setCredentialLabel, (state, action) => ({
    ...state,
    newCredential: {...state.newCredential, label: action.label},
    credentials: {
      ...state.credentials,
      [action.credential.company]: state.credentials[action.credential.company]?.map(cred =>
        cred.access_key === action.credential.access_key ? {...action.credential, label: action.label} : cred)
    }
  })),
  on(removeCredential, (state, action) => ({
    ...state, credentials: {
      ...state.credentials,
      [action.workspaceId]: state.credentials[action.workspaceId].filter((cred => cred.access_key !== action.accessKey))
    }
  })),
  on(updateAllCredentials, (state, action) => ({
    ...state,
    credentials: {[action.credentials[0]?.company || action.workspace]: action.credentials, ...action.extra}, revokeSucceed: false
  })),
  on(setSignedUrl, (state, action) => ({...state, signedUrls: {...state.signedUrls, [action.url]: {signed: action.signed, expires: action.expires}}})),
  on(removeSignedUrl, (state, action) => ({...state, signedUrls: {...state.signedUrls, [action.url]: null}})),
] as ReducerTypes<AuthState, any>[];
