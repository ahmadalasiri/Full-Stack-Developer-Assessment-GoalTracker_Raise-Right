import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success?: boolean;
  data?: {
    token: string;
    user: {
      id: string;
      email: string;
      name?: string;
      username?: string;
    };
  };
  // Direct response properties (backend returns these directly)
  token?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    username?: string;
  };
}

export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getCurrentUser()
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(credentials: RegisterCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, credentials)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  logout(): void {
    localStorage.removeItem(environment.auth.tokenKey);
    localStorage.removeItem(environment.auth.userKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(environment.auth.tokenKey);
  }
  getCurrentUser(): User | null {
    const userData = localStorage.getItem(environment.auth.userKey);
    if (userData) {
      try {
        return JSON.parse(userData) as User;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.currentUser$.pipe(map((user) => user !== null));
  }
  private handleAuthResponse(response: AuthResponse): void {
    // Handle nested structure (success + data pattern)
    if (response.success && response.data) {
      localStorage.setItem(environment.auth.tokenKey, response.data.token);
      localStorage.setItem(
        environment.auth.userKey,
        JSON.stringify(response.data.user)
      );
      this.currentUserSubject.next(response.data.user);
    }
    // Handle direct structure (token + user pattern from backend)
    else if (response.token && response.user) {
      localStorage.setItem(environment.auth.tokenKey, response.token);
      localStorage.setItem(
        environment.auth.userKey,
        JSON.stringify(response.user)
      );
      this.currentUserSubject.next(response.user);
    }
  }
}
