import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'success',
      'error',
    ]);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(
      AuthService
    ) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockNotificationService = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize login form with empty values', () => {
      expect(component.loginForm.get('email')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should have required validators on email and password', () => {
      const emailControl = component.loginForm.get('email');
      const passwordControl = component.loginForm.get('password');

      emailControl?.setValue('');
      passwordControl?.setValue('');

      expect(emailControl?.hasError('required')).toBe(true);
      expect(passwordControl?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      const emailControl = component.loginForm.get('email');

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);

      emailControl?.setValue('valid@email.com');
      expect(emailControl?.hasError('email')).toBe(false);
    });

    it('should validate password minimum length', () => {
      const passwordControl = component.loginForm.get('password');

      passwordControl?.setValue('123');
      expect(passwordControl?.hasError('minlength')).toBe(true);

      passwordControl?.setValue('123456');
      expect(passwordControl?.hasError('minlength')).toBe(false);
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should not submit when form is invalid', () => {
      component.loginForm.patchValue({
        email: '',
        password: '',
      });

      component.onSubmit();

      expect(mockAuthService.login).not.toHaveBeenCalled();
      expect(component.loading).toBe(false);
    });

    it('should not submit when already loading', () => {
      component.loading = true;

      component.onSubmit();

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should call authService.login with form values when form is valid', () => {
      const expectedCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.login.and.returnValue(
        of({
          token: 'jwt-token',
          user: { id: '1', email: 'test@example.com', username: 'testuser' },
        })
      );

      component.onSubmit();

      expect(mockAuthService.login).toHaveBeenCalledWith(expectedCredentials);
      expect(component.loading).toBe(true);
    });
  });

  describe('Successful Login', () => {
    beforeEach(() => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should navigate to dashboard on successful login with token', () => {
      mockAuthService.login.and.returnValue(
        of({
          token: 'jwt-token',
          user: { id: '1', email: 'test@example.com', username: 'testuser' },
        })
      );

      component.onSubmit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(mockNotificationService.success).toHaveBeenCalledWith(
        'Login Successful',
        'Welcome back! You have been successfully logged in.'
      );
    });

    it('should navigate to dashboard with nested response structure', () => {
      mockAuthService.login.and.returnValue(
        of({
          data: {
            token: 'jwt-token',
            user: { id: '1', email: 'test@example.com', username: 'testuser' },
          },
        })
      );

      component.onSubmit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(mockNotificationService.success).toHaveBeenCalled();
    });

    it('should handle response without token', () => {
      mockAuthService.login.and.returnValue(
        of({
          user: { id: '1', email: 'test@example.com', username: 'testuser' },
        })
      );

      component.onSubmit();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(component.error).toBe('Authentication failed - missing token');
      expect(mockNotificationService.error).toHaveBeenCalledWith(
        'Login Failed',
        'Authentication failed - missing token'
      );
      expect(component.loading).toBe(false);
    });
  });

  describe('Failed Login', () => {
    beforeEach(() => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
    });

    it('should handle login error with error message', () => {
      const errorResponse = {
        error: { message: 'Invalid credentials' },
      };

      mockAuthService.login.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();

      expect(component.error).toBe('Invalid credentials');
      expect(mockNotificationService.error).toHaveBeenCalledWith(
        'Login Failed',
        'Invalid credentials'
      );
      expect(component.loading).toBe(false);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle login error without specific message', () => {
      const errorResponse = {};

      mockAuthService.login.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();

      expect(component.error).toBe('Login failed');
      expect(mockNotificationService.error).toHaveBeenCalledWith(
        'Login Failed',
        'Login failed. Please check your credentials.'
      );
      expect(component.loading).toBe(false);
    });
  });

  describe('Form Field Getters', () => {
    it('should return email form control', () => {
      const emailControl = component.loginForm.get('email');
      expect(component.email).toBe(emailControl);
    });

    it('should return password form control', () => {
      const passwordControl = component.loginForm.get('password');
      expect(component.password).toBe(passwordControl);
    });
  });

  describe('Loading State', () => {
    it('should set loading to true during submission', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      mockAuthService.login.and.returnValue(
        of({
          token: 'jwt-token',
          user: { id: '1', email: 'test@example.com', username: 'testuser' },
        })
      );

      expect(component.loading).toBe(false);

      component.onSubmit();

      expect(component.loading).toBe(true);
    });

    it('should reset loading state after error', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      mockAuthService.login.and.returnValue(
        throwError(() => ({ error: { message: 'Invalid credentials' } }))
      );

      component.onSubmit();

      expect(component.loading).toBe(false);
    });
  });

  describe('Error State', () => {
    it('should clear error message when starting new login attempt', () => {
      component.error = 'Previous error';
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      mockAuthService.login.and.returnValue(
        of({
          token: 'jwt-token',
          user: { id: '1', email: 'test@example.com', username: 'testuser' },
        })
      );

      component.onSubmit();

      expect(component.error).toBe('');
    });
  });
});
