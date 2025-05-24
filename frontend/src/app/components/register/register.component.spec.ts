import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['register']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'success',
      'error',
      'warning',
      'info',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterModule,
        RouterTestingModule,
        RegisterComponent,
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
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
    it('should initialize register form with empty values', () => {
      expect(component.registerForm.get('username')?.value).toBe('');
      expect(component.registerForm.get('email')?.value).toBe('');
      expect(component.registerForm.get('password')?.value).toBe('');
      expect(component.registerForm.get('confirmPassword')?.value).toBe('');
    });

    it('should have required validators on username, email, password, and confirmPassword', () => {
      const usernameControl = component.registerForm.get('username');
      const emailControl = component.registerForm.get('email');
      const passwordControl = component.registerForm.get('password');
      const confirmPasswordControl =
        component.registerForm.get('confirmPassword');

      usernameControl?.setValue('');
      emailControl?.setValue('');
      passwordControl?.setValue('');
      confirmPasswordControl?.setValue('');

      expect(usernameControl?.hasError('required')).toBe(true);
      expect(emailControl?.hasError('required')).toBe(true);
      expect(passwordControl?.hasError('required')).toBe(true);
      expect(confirmPasswordControl?.hasError('required')).toBe(true);
    });

    it('should validate username minimum length', () => {
      const usernameControl = component.registerForm.get('username');

      usernameControl?.setValue('ab');
      expect(usernameControl?.hasError('minlength')).toBe(true);

      usernameControl?.setValue('abc');
      expect(usernameControl?.hasError('minlength')).toBe(false);
    });

    it('should validate email format', () => {
      const emailControl = component.registerForm.get('email');

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);

      emailControl?.setValue('valid@email.com');
      expect(emailControl?.hasError('email')).toBe(false);
    });

    it('should validate password minimum length', () => {
      const passwordControl = component.registerForm.get('password');

      passwordControl?.setValue('12345');
      expect(passwordControl?.hasError('minlength')).toBe(true);

      passwordControl?.setValue('123456');
      expect(passwordControl?.hasError('minlength')).toBe(false);
    });

    it('should validate password matching', () => {
      // First set valid values in both fields
      component.registerForm.patchValue({
        password: '123456',
        confirmPassword: '123456',
      });
      expect(component.registerForm.hasError('mismatch')).toBe(false);
      expect(component.confirmPassword?.hasError('mismatch')).toBe(false);

      // Make passwords different
      component.registerForm.patchValue({
        password: '123456',
        confirmPassword: '654321',
      });

      // Manually run the validator to simulate form update
      const validatorResult = component.passwordMatchValidator(
        component.registerForm
      );
      expect(validatorResult).toEqual({ mismatch: true });
      expect(component.confirmPassword?.hasError('mismatch')).toBe(true);
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
    });

    it('should not submit when form is invalid', () => {
      component.registerForm.patchValue({
        username: '',
        password: '',
      });

      component.onSubmit();

      expect(mockAuthService.register).not.toHaveBeenCalled();
      expect(component.loading).toBe(false);
    });

    it('should not submit when already loading', () => {
      component.loading = true;

      component.onSubmit();

      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should call authService.register with form values when form is valid', () => {
      const expectedCredentials = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.register.and.returnValue(
        of({
          token: 'jwt-token',
          user: { id: '1', email: 'test@example.com', username: 'testuser' },
        })
      );

      component.onSubmit();

      expect(mockAuthService.register).toHaveBeenCalledWith(
        expectedCredentials
      );
      expect(component.loading).toBe(true);
    });
  });

  describe('Successful Registration', () => {
    beforeEach(() => {
      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
    });

    it('should navigate to dashboard on successful registration with token', () => {
      const successResponse = {
        token: 'jwt-token',
        user: { id: '1', email: 'test@example.com', username: 'testuser' },
      };

      mockAuthService.register.and.returnValue(of(successResponse));

      component.onSubmit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(mockNotificationService.success).toHaveBeenCalledWith(
        'Registration Successful',
        'Welcome to GoalTracker! Your account has been created successfully.'
      );
    });

    it('should handle nested token in response data', () => {
      const nestedResponse = {
        data: {
          token: 'jwt-token',
          user: { id: '1', email: 'test@example.com', username: 'testuser' },
        },
      };

      mockAuthService.register.and.returnValue(of(nestedResponse));

      component.onSubmit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(mockNotificationService.success).toHaveBeenCalledWith(
        'Registration Successful',
        'Welcome to GoalTracker! Your account has been created successfully.'
      );
    });

    it('should show error if token is missing from response', () => {
      const invalidResponse = {
        user: { id: '1', email: 'test@example.com', username: 'testuser' },
      };

      mockAuthService.register.and.returnValue(of(invalidResponse));

      component.onSubmit();

      expect(component.error).toBe(
        'Registration failed - authentication token not received'
      );
      expect(mockNotificationService.error).toHaveBeenCalledWith(
        'Registration Failed',
        'Registration failed - authentication token not received'
      );
      expect(component.loading).toBe(false);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Registration Error Handling', () => {
    beforeEach(() => {
      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
    });

    it('should handle registration error with specific message', () => {
      const errorResponse = {
        error: {
          message: 'Email already exists',
        },
      };

      mockAuthService.register.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();

      expect(component.error).toBe('Email already exists');
      expect(mockNotificationService.error).toHaveBeenCalledWith(
        'Registration Failed',
        'Email already exists'
      );
      expect(component.loading).toBe(false);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle registration error without specific message', () => {
      const errorResponse = {};

      mockAuthService.register.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();

      expect(component.error).toBe('Registration failed');
      expect(mockNotificationService.error).toHaveBeenCalledWith(
        'Registration Failed',
        'Registration failed. Please try again.'
      );
      expect(component.loading).toBe(false);
    });
  });

  describe('Form Field Getters', () => {
    it('should return username form control', () => {
      const usernameControl = component.registerForm.get('username');
      expect(component.username).toBe(usernameControl);
    });

    it('should return email form control', () => {
      const emailControl = component.registerForm.get('email');
      expect(component.email).toBe(emailControl);
    });

    it('should return password form control', () => {
      const passwordControl = component.registerForm.get('password');
      expect(component.password).toBe(passwordControl);
    });

    it('should return confirmPassword form control', () => {
      const confirmPasswordControl =
        component.registerForm.get('confirmPassword');
      expect(component.confirmPassword).toBe(confirmPasswordControl);
    });
  });

  describe('Loading State', () => {
    it('should set loading to true during submission', () => {
      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      mockAuthService.register.and.returnValue(
        of({
          token: 'jwt-token',
          user: { id: '1', email: 'test@example.com', username: 'testuser' },
        })
      );

      component.onSubmit();

      expect(component.loading).toBe(true);
    });

    it('should reset loading state on error', () => {
      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      mockAuthService.register.and.returnValue(
        throwError(() => new Error('Registration error'))
      );

      component.onSubmit();

      expect(component.loading).toBe(false);
    });

    it('should clear error message before form submission', () => {
      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      component.error = 'Previous error';

      mockAuthService.register.and.returnValue(
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
