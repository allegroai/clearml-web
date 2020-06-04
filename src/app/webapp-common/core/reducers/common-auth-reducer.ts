import {createSelector} from '@ngrx/store';
import {
  addCredential, AUTH_ACTIONS, cancelS3Credentials, resetDontShowAgainForBucketEndpoint, resetShowS3Popup, saveS3Credentials, showLocalFilePopUp, showS3PopUp,
  updateAllCredentials, updateS3Credential
} from '../actions/common-auth.actions';

export interface IS3PopupDetails {
  isAzure?: boolean;
  credentials?: {
    Bucket?: string;
    Endpoint?: string;
    Key?: string;
    Secret?: string;
    Region?: string;
  };
}

export interface IAuthState {
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

export const initAuth: IAuthState = {
  showLocalFilePopup: false,
  localFilesPopupURLs: [],
  S3PopUpDetails: {},
  revokeSucceed: false,
  credentials: [],
  newCredential: {},
  dontShowAgainForBucketEndpoint: '',
  S3BucketCredentials: {
    BucketCredentials: []
  },
  showS3PopUp: false
};

export const selectAuth = (state) => state.auth;

// Auth selectors
export const selectRevokeSucceed                  = createSelector(selectAuth, state => state.revokeSucceed);
export const selectCredentials                    = createSelector(selectAuth, state => state.credentials);
export const selectNewCredential                  = createSelector(selectAuth, state => state.newCredential);
export const selectS3BucketCredentials            = createSelector(selectAuth, state => state.S3BucketCredentials);
export const selectS3BucketCredentialsBucketCredentials = createSelector(selectAuth, state => state.S3BucketCredentials.BucketCredentials);
export const selectShowS3PopUp                    = createSelector(selectAuth, state => state.showS3PopUp);
export const selectShowLocalFilesPopUp            = createSelector(selectAuth, state => state.showLocalFilePopup);
export const selectS3PopUpDetails                 = createSelector(selectAuth, state => state.S3PopUpDetails);
export const selectDontShowAgainForBucketEndpoint = createSelector(selectAuth, state => state.dontShowAgainForBucketEndpoint);



export function commonAuthReducer(auth = initAuth, action) {
  switch (action.type) {

    case showS3PopUp.type:
      return {...auth, S3PopUpDetails: action.payload, showS3PopUp: true};
    case resetShowS3Popup.type:
      return {...auth, S3PopUpDetails: auth.S3PopUpDetails, showS3PopUp: false};
    case showLocalFilePopUp.type:
      return {...auth, showLocalFilePopup: true, localFilesPopupURLs: Array.from(new Set([...auth.localFilesPopupURLs, action.url]))};
    case cancelS3Credentials.type:
      return {
        ...auth,
        showS3PopUp: false,
        dontShowAgainForBucketEndpoint: action.dontAskAgainForBucketName
      };
    case updateS3Credential.type:
      return {
        ...auth,
        S3BucketCredentials: action.S3BucketCredentials,
        S3PopUpDetails: {},
        dontShowAgainForBucketEndpoint: '',
        newCredential: {}
      };

    case resetDontShowAgainForBucketEndpoint.type:
      return {...auth, dontShowAgainForBucketEndpoint: ''};
    case saveS3Credentials.type:
      const indexsss = auth.S3BucketCredentials.BucketCredentials.findIndex((Cr) => {
        return (Cr.Bucket === action.newCredential.Bucket && Cr.Endpoint === action.newCredential.Endpoint);
      });
      const bucketCre = [...auth.S3BucketCredentials.BucketCredentials];
      if (indexsss > -1) {
        bucketCre[indexsss] = action.newCredential;
      } else {
        bucketCre.push(action.newCredential);
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
    case addCredential.type:
      const newCredentials = [].concat(auth.credentials);
      newCredentials.push(action.newCredential);
      return {...auth, newCredential: action.newCredential, credentials: newCredentials};
    case updateAllCredentials.type:
      return {...auth, credentials: action.credentials, revokeSucceed: false};
    default:
      return auth;
  }
}
