export * from './tasks.service';

export interface ApiOptions {
  headers?: Record<string, string>;
  adminQuery?: boolean;
  userId?: string;
}
