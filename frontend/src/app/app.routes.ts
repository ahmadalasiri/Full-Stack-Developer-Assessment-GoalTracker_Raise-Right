import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'public',
    loadComponent: () =>
      import(
        './components/public-goals/public-goals-list/public-goals.component'
      ).then((m) => m.PublicGoalsComponent),
  },
  {
    path: 'public/:publicId',
    loadComponent: () =>
      import(
        './components/public-goals/public-goal-detail/public-goal-detail.component'
      ).then((m) => m.PublicGoalDetailComponent),
  },
  { path: '**', redirectTo: '/home' },
];
