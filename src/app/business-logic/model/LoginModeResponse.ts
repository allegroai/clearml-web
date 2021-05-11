import {AuthFixedUsersModeResponse} from './auth/authFixedUsersModeResponse';

export interface LoginModeResponse extends AuthFixedUsersModeResponse {
  authenticated?: boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  server_errors?: {missed_es_upgrade: boolean; es_connection_error: boolean};
  basic?: {
    enabled?: boolean;
    guest?: {enabled: boolean; username: string; password: string};
  };

  sso?: { [key: string]: string }[];

  // eslint-disable-next-line @typescript-eslint/naming-convention
  sso_providers?: { name: string; url: string; display_name?: string; displayName?: string }[];
}
