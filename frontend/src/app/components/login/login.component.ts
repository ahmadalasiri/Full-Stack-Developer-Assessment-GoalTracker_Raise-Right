import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  onSubmit(): void {
    if (this.loginForm.valid && !this.loading) {
      this.loading = true;
      this.error = '';
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          // Check for token in either response format
          const hasToken = response?.data?.token || response?.token;
          if (hasToken) {
            console.log('Navigating to dashboard...');
            this.notificationService.success(
              'Login Successful',
              'Welcome back! You have been successfully logged in.'
            );
            // Navigate to dashboard after login
            this.router.navigate(['/dashboard']);
          } else {
            console.error('Missing token in response');
            this.error = 'Authentication failed - missing token';
            this.notificationService.error(
              'Login Failed',
              'Authentication failed - missing token'
            );
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.error = error.error?.message || 'Login failed';
          this.notificationService.error(
            'Login Failed',
            error.error?.message ||
              'Login failed. Please check your credentials.'
          );
          this.loading = false;
        },
        complete: () => {
          console.log('Login request complete');
        },
      });
    }
  }

  get email() {
    return this.loginForm.get('email');
  }
  get password() {
    return this.loginForm.get('password');
  }
}
