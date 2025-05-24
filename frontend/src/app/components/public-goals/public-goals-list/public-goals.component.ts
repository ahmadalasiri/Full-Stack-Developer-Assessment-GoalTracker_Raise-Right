import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { GoalsService, GoalsResponse } from '../../../services/goals.service';
import { Goal } from '../../../models/goal.model';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-public-goals',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './public-goals.component.html',
  styleUrl: './public-goals.component.css',
})
export class PublicGoalsComponent implements OnInit {
  goals: Goal[] = [];
  loading = false;
  error = '';
  currentPage = 1;
  totalPages = 1;
  pageSize = 100;
  loadingMore = false;
  allGoalsLoaded = false;
  constructor(
    private goalsService: GoalsService,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadPublicGoals();
  }

  loadPublicGoals(page: number = 1, append: boolean = false): void {
    if (page === 1) {
      this.loading = true;
    } else {
      this.loadingMore = true;
    }
    this.goalsService.getPublicGoals(page, this.pageSize).subscribe({
      next: (response: GoalsResponse) => {
        let newGoals: Goal[] = [];

        if (response && response.success === true && response.data) {
          newGoals = response.data.data || [];

          if (response.data.meta) {
            this.totalPages = response.data.meta.totalPages || 1;
          }
        } else if (Array.isArray(response)) {
          newGoals = response;
        } else {
          newGoals = [];
        }

        this.currentPage = page;
        this.allGoalsLoaded = page >= this.totalPages;

        if (append) {
          // Filter out duplicates
          const existingIds = new Set(this.goals.map((goal) => goal.id));
          const uniqueNewGoals = newGoals.filter(
            (goal) => !existingIds.has(goal.id)
          );
          this.goals = [...this.goals, ...uniqueNewGoals];
        } else {
          this.goals = newGoals;
        }

        this.loading = false;
        this.loadingMore = false;
      },
      error: (error: any) => {
        this.error = error.message || 'Failed to load public goals';
        this.notificationService.error(
          'Loading Failed',
          'Failed to load public goals. Please try again.'
        );
        this.loading = false;
        this.loadingMore = false;
      },
    });
  }

  loadMoreGoals(): void {
    if (this.loadingMore || this.allGoalsLoaded) {
      return;
    }

    const nextPage = this.currentPage + 1;
    if (nextPage <= this.totalPages) {
      this.loadPublicGoals(nextPage, true);
    }
  }

  viewGoalDetails(goal: Goal): void {
    if (goal.publicId) {
      this.router.navigate(['/public', goal.publicId]);
    }
  }

  goToDashboard(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getDaysUntilDeadline(deadline: string): number {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
  isOverdue(deadline: string): boolean {
    return this.getDaysUntilDeadline(deadline) < 0;
  }

  abs(value: number): number {
    return Math.abs(value);
  }

  onScroll(event: Event): void {
    const container = event.target as HTMLElement;
    const scrollPosition = container.scrollTop + container.clientHeight;
    const scrollHeight = container.scrollHeight;
    const threshold = 200;

    if (
      scrollHeight - scrollPosition < threshold &&
      !this.loadingMore &&
      !this.allGoalsLoaded
    ) {
      this.loadMoreGoals();
    }
  }
}
