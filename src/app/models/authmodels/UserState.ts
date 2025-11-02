export interface UserState {
  isLoggedIn: boolean;
  user?: { sub?: string; roles?: string[]; exp?: number };
}