// import {AUTH_ACTIONS} from '../../app.constants';

import {createSelector} from '@ngrx/store';
import {AUTH_ACTIONS, S3_ACTIONS} from '../../app.constants';

export interface IS3PopupDetails {
  credentials?: {
    Bucket?: string;
    Endpoint?: string;
    Key?: string;
    Secret?: string;
    Region?: string;
  };
}

export interface IAdminState {
  showLocalFilePopup: boolean;
  localFilesPopupURLs: Array<string>;
  S3PopUpDetails?: IS3PopupDetails;
  revokeSucceed: boolean;
  credentials: Array<any>;
  newCredential: any;
  dontShowAgainForBucketEndpoint: string;
  S3BucketCredentials: {
    BucketCredentials: Array<any>
  };
  showS3PopUp: false;
}

export const initAuth: IAdminState = {
  showLocalFilePopup            : false,
  localFilesPopupURLs           : [],
  S3PopUpDetails                : {},
  revokeSucceed                 : false,
  credentials                   : [],
  newCredential                 : {},
  dontShowAgainForBucketEndpoint: '',
  S3BucketCredentials           : {
    BucketCredentials: []
  },
  showS3PopUp                   : false,
};

export const selectAuth = (state) => state.auth;

// Auth selectors
export const selectRevokeSucceed                        = createSelector(selectAuth, state => state.revokeSucceed);
export const selectRequestedS3Credentials               = createSelector(selectAuth, state => state.requestedS3Credentials);
export const selectCredentials                          = createSelector(selectAuth, state => state.credentials);
export const selectNewCredential                        = createSelector(selectAuth, state => state.newCredential);
export const selectS3BucketCredentials                  = createSelector(selectAuth, state => state.S3BucketCredentials);
export const selectS3BucketCredentialsBucketCredentials = createSelector(selectAuth, state => state.S3BucketCredentials.BucketCredentials);
export const selectShowS3PopUp                          = createSelector(selectAuth, state => state.showS3PopUp);
export const selectShowLocalFilesPopUp                  = createSelector(selectAuth, state => state.showLocalFilePopup);
export const selectS3PopUpDetails                       = createSelector(selectAuth, state => state.S3PopUpDetails);
export const selectDontShowAgainForBucketEndpoint       = createSelector(selectAuth, state => state.dontShowAgainForBucketEndpoint);


export function authReducer(auth = initAuth, action) {
  switch (action.type) {

    case S3_ACTIONS.SHOW_S3_POPUP:
      return {...auth, S3PopUpDetails: action.payload, showS3PopUp: true};
    case S3_ACTIONS.SHOW_LOCAL_FILE_POPUP:
      return {...auth, showLocalFilePopup: true, localFilesPopupURLs: Array.from(new Set([...auth.localFilesPopupURLs, ...action.payload]))};
    case S3_ACTIONS.CANCEL_BUCKET_CREDENTIALS:
      return {
        ...auth,
        showS3PopUp                   : false,
        dontShowAgainForBucketEndpoint: action.payload.dontAskAgainForBucketName
      };
    case S3_ACTIONS.SET_BUCKETS_CREDENTIALS:
      return {
        ...auth,
        S3BucketCredentials           : action.payload.S3BucketCredentials,
        S3PopUpDetails                : {},
        dontShowAgainForBucketEndpoint: '',
        newCredential                 : {}
      };

    case S3_ACTIONS.RESET_DONT_SHOW_AGAIN_FOR_BUCKET_ENDPOINT:
      return {...auth, dontShowAgainForBucketEndpoint: ''};
    case S3_ACTIONS.SET_BUCKET_CREDENTIALS:
      const indexsss  = auth.S3BucketCredentials.BucketCredentials.findIndex((Cr) => {
        return (Cr.Bucket === action.payload.newCredential.Bucket && Cr.Endpoint === action.payload.newCredential.Endpoint);
      });
      const bucketCre = [...auth.S3BucketCredentials.BucketCredentials];
      if (indexsss > -1) {
        bucketCre[indexsss] = action.payload.newCredential;
      } else {
        bucketCre.push(action.payload.newCredential);
      }
      return {...auth, S3BucketCredentials: {BucketCredentials: bucketCre}, showS3PopUp: false, S3PopUpDetails: {}};

    case AUTH_ACTIONS.CREATE_SUCCESS:
      auth.credentials.push(action.payload.credentials);
      return {...auth, newCredential: action.payload.credentials};
    case AUTH_ACTIONS.GET_SUCCESS:
      return {...auth, credentials: action.payload.credentials, revokeSucceed: false};
    case AUTH_ACTIONS.REVOKE_SUCCESS:
      return {...auth, revokeSucceed: true};
    case AUTH_ACTIONS.RESET_NEW_CREDENTIAL:
      return {...auth, newCredential: initAuth.newCredential};
    case AUTH_ACTIONS.ADD_CREDENTIAL:
      const newCredentials = [].concat(auth.credentials);
      newCredentials.push(action.payload.newCredential);
      return {...auth, newCredential: action.payload.newCredential, credentials: newCredentials};
    case AUTH_ACTIONS.UPDATE_ALL_CREDENTIALS:
      return {...auth, credentials: action.payload.credentials, revokeSucceed: false};

    default:
      return auth;
  }
}
