export interface UserJwtModel {
  roles?: string[];
  sub?: string; // username/email
  iat?: number;
  exp?: number;
}