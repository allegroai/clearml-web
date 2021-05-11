import {createSelector} from '@ngrx/store';
import {
  addCredential,
  AUTH_ACTIONS,
  cancelS3Credentials,
  removeCredential,
  resetDontShowAgainForBucketEndpoint,
  resetShowS3Popup,
  saveS3Credentials,
  showLocalFilePopUp,
  showS3PopUp,
  updateAllCredentials,
  updateS3Credential
} from '../actions/common-auth.actions';
import {CredentialKey} from '../../../business-logic/model/auth/credentialKey';

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
  credentials: {[workSpaceId: string]: CredentialKey[]};
  newCredential: {access_key: string; secrete_key: string; company: string};
  dontShowAgainForBucketEndpoint: string;
  S3BucketCredentials: { BucketCredentials: any[] };
  showS3PopUp: false;
}

export const initAuth: IAuthState = {
  showLocalFilePopup: false,
  localFilesPopupURLs: [],
  S3PopUpDetails: {},
  revokeSucceed: false,
  credentials: {},
  newCredential: null,
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
    case saveS3Credentials.type: {
      const index = auth.S3BucketCredentials.BucketCredentials.findIndex((Cr) =>
        (Cr.Bucket === action.newCredential.Bucket && Cr.Endpoint === action.newCredential.Endpoint));
      const bucketCre = [...auth.S3BucketCredentials.BucketCredentials];
      if (index > -1) {
        bucketCre[index] = action.newCredential;
      } else {
        bucketCre.push(action.newCredential);
      }
      return {...auth, S3BucketCredentials: {BucketCredentials: bucketCre}, showS3PopUp: false, S3PopUpDetails: {}};
    }
    case AUTH_ACTIONS.GET_SUCCESS:
      return {...auth, credentials: action.payload.credentials, revokeSucceed: false};
    case AUTH_ACTIONS.REVOKE_SUCCESS:
      return {...auth, revokeSucceed: true};
    case AUTH_ACTIONS.RESET_NEW_CREDENTIAL:
      return {...auth, newCredential: initAuth.newCredential};
    case addCredential.type:
      return {
        ...auth,
        newCredential: {...action.newCredential, company: action.workspaceId},
        credentials: {
          ...auth.credentials,
          [action.workspaceId]: [
            ...(auth.credentials[action.workspaceId] || []),
            ...(Object.keys(action.newCredential).length > 0 ? [{...action.newCredential, company: action.workspaceId}] : [])
          ]}};
    case removeCredential.type: {
      const act = action as ReturnType<typeof removeCredential>;
      return {
        ...auth, credentials: {
          ...auth.credentials,
          [act.workspaceId]: auth.credentials[act.workspaceId].filter((cred => cred.access_key !== act.accessKey))
        }
      };
    }
    case updateAllCredentials.type:
      return {...auth, credentials: {[action.credentials[0]?.company || action.workspace]: action.credentials, ...action.extra}, revokeSucceed: false};
    default:
      return auth;
  }
}
