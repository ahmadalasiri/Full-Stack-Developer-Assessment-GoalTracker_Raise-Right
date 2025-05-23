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
    private router: Router
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
          // Ensure we have the token and user data
          if (response?.data?.token) {
            console.log('Navigating to dashboard...');
            // Navigate to dashboard after login
            this.router.navigate(['/dashboard']);
          } else {
            console.error('Missing token in response');
            this.error = 'Authentication failed - missing token';
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.error = error.error?.message || 'Login failed';
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
