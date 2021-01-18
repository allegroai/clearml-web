import {AuthFixedUsersModeResponse} from './auth/authFixedUsersModeResponse';

export interface AuthFixedUsersModeExResponse extends AuthFixedUsersModeResponse {
  guest?: {enabled: boolean; username: string; password: string};
  server_errors?: {missed_es_upgrade: boolean; es_connection_error: boolean};
}
