import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {jwtDecode} from 'jwt-decode';
import { tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { UserState } from '../models/authmodels/UserState';
import { UserJwtModel } from '../models/authmodels/UserJwtModel';
import { LoginRequest } from '../models/authmodels/LoginRequest';
import { RegisterUserRequest } from '../models/authmodels/RegisterUserRequest';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public userState = signal<UserState>({ isLoggedIn: false });
  private baseUrl = 'http://localhost:8091/authservice/api/auth'; // backend base URL - gerektiğinde değiştir

  // optional: id of timeout to clear on logout
  private autoLogoutTimerId: any;

  constructor(
    private http: HttpClient,
    private router: Router // ✅ Burada inject ettik
  ) {
    this.loadInitialState();
  }

  private setSessionFromToken(jwt: string | null) {
    if (!jwt) {
      this.userState.set({ isLoggedIn: false });
      return;
    }
    try {
      const decoded = jwtDecode<UserJwtModel>(jwt);
      const exp = decoded.exp ? decoded.exp * 1000 : undefined;
      this.userState.set({ isLoggedIn: true, user: { sub: decoded.sub, roles: decoded.roles, exp }});

      // schedule auto logout at token expiry (optional, but helpful)
      if (exp) {
        const msLeft = exp - Date.now();
        if (msLeft <= 0) {
          this.logout();
        } else {
          if (this.autoLogoutTimerId) clearTimeout(this.autoLogoutTimerId);
          this.autoLogoutTimerId = setTimeout(() => this.logout(), msLeft);
        }
      }
    } catch (e) {
      console.error('Invalid JWT:', e);
      this.logout();
    }
  }

  loadInitialState() {
    const jwt = localStorage.getItem('token');
    if (jwt) this.setSessionFromToken(jwt);
  }

  login(payload: LoginRequest): Observable<string> {
    // backend returns token as plain text
    return this.http.post(`${this.baseUrl}/login`, payload, { responseType: 'text' }).pipe(
      tap((token) => {
        localStorage.setItem('token', token);
        this.setSessionFromToken(token);
        this.router.navigate(['/customer-search']); // ✅ login başarılıysa yönlendirme
      })
    );
  }

  register(payload: RegisterUserRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/register`, payload);
  }

  logout() {
    localStorage.removeItem('token');
    if (this.autoLogoutTimerId) {
      clearTimeout(this.autoLogoutTimerId);
      this.autoLogoutTimerId = undefined;
    }
    this.userState.set({ isLoggedIn: false, user: undefined });
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  hasRole(role: string): boolean {
    const roles = this.userState().user?.roles || [];
    return roles.includes(role.toUpperCase()) || roles.includes(role);
  }

  isAuthenticated(): boolean {
    const us = this.userState();
    if (!us.isLoggedIn) return false;
    const exp = us.user?.exp;
    return !exp || exp > Date.now();
  }
}
