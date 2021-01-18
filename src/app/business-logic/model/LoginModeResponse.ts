import {AuthFixedUsersModeResponse} from './auth/authFixedUsersModeResponse';

export interface LoginModeResponse extends AuthFixedUsersModeResponse {
  server_errors?: {missed_es_upgrade: boolean; es_connection_error: boolean};
  basic?: {
    enabled?: boolean;
    guest?: {enabled: boolean; username: string; password: string}
  };

  sso?: { [key: string]: string }[];

  sso_providers?: { name: string; url: string }[];
}
