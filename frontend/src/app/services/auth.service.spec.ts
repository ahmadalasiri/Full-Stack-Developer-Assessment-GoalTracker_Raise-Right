import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  AuthService,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
} from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
  };

  const mockAuthResponse: AuthResponse = {
    token: 'mock-jwt-token',
    user: mockUser,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should register a user successfully', () => {
      const registerCredentials: RegisterCredentials = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      service.register(registerCredentials).subscribe((response) => {
        expect(response).toEqual(mockAuthResponse);
        expect(localStorage.getItem(environment.auth.tokenKey)).toBe(
          'mock-jwt-token'
        );
        expect(localStorage.getItem(environment.auth.userKey)).toBe(
          JSON.stringify(mockUser)
        );
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerCredentials);
      req.flush(mockAuthResponse);
    });
  });

  describe('login', () => {
    it('should login a user successfully', () => {
      const loginCredentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      service.login(loginCredentials).subscribe((response) => {
        expect(response).toEqual(mockAuthResponse);
        expect(localStorage.getItem(environment.auth.tokenKey)).toBe(
          'mock-jwt-token'
        );
        expect(localStorage.getItem(environment.auth.userKey)).toBe(
          JSON.stringify(mockUser)
        );
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginCredentials);
      req.flush(mockAuthResponse);
    });
  });

  describe('logout', () => {
    it('should clear localStorage and reset current user', () => {
      // Setup localStorage with values
      localStorage.setItem(environment.auth.tokenKey, 'mock-token');
      localStorage.setItem(environment.auth.userKey, JSON.stringify(mockUser));

      service.logout();

      expect(localStorage.getItem(environment.auth.tokenKey)).toBeNull();
      expect(localStorage.getItem(environment.auth.userKey)).toBeNull();

      service.currentUser$.subscribe((user) => {
        expect(user).toBeNull();
      });
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem(environment.auth.tokenKey, 'mock-token');
      expect(service.getToken()).toBe('mock-token');
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from localStorage', () => {
      localStorage.setItem(environment.auth.userKey, JSON.stringify(mockUser));
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    it('should return null when no user exists', () => {
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should return null when user data is invalid JSON', () => {
      localStorage.setItem(environment.auth.userKey, 'invalid-json');
      spyOn(console, 'error');
      expect(service.getCurrentUser()).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem(environment.auth.tokenKey, 'mock-token');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('isAuthenticated$', () => {
    it('should emit true when user is logged in', () => {
      localStorage.setItem(environment.auth.userKey, JSON.stringify(mockUser));
      service.currentUser$.next(mockUser);

      service.isAuthenticated$.subscribe((isAuth) => {
        expect(isAuth).toBe(true);
      });
    });

    it('should emit false when user is not logged in', () => {
      service.isAuthenticated$.subscribe((isAuth) => {
        expect(isAuth).toBe(false);
      });
    });
  });

  describe('handleAuthResponse', () => {
    it('should handle nested response structure', () => {
      const nestedResponse: AuthResponse = {
        success: true,
        data: {
          token: 'nested-token',
          user: mockUser,
        },
      };

      service
        .login({ email: 'test@example.com', password: 'password123' })
        .subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(nestedResponse);

      expect(localStorage.getItem(environment.auth.tokenKey)).toBe(
        'nested-token'
      );
      expect(localStorage.getItem(environment.auth.userKey)).toBe(
        JSON.stringify(mockUser)
      );
    });

    it('should handle direct response structure', () => {
      service
        .login({ email: 'test@example.com', password: 'password123' })
        .subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockAuthResponse);

      expect(localStorage.getItem(environment.auth.tokenKey)).toBe(
        'mock-jwt-token'
      );
      expect(localStorage.getItem(environment.auth.userKey)).toBe(
        JSON.stringify(mockUser)
      );
    });
  });
});
