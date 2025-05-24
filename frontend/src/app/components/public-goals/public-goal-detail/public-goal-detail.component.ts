import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  GoalsService,
  GoalResponse,
  GoalsResponse,
} from '../../../services/goals.service';
import { Goal } from '../../../models/goal.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-public-goal-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './public-goal-detail.component.html',
  styleUrl: './public-goal-detail.component.css',
})
export class PublicGoalDetailComponent implements OnInit {
  goal: Goal | null = null;
  childGoals: Goal[] = [];
  loading = false;
  error = '';
  loadingChildren = false;
  currentPage = 1;
  totalPages = 1;
  pageSize = 20;
  loadingMoreChildren = false;
  allChildrenLoaded = false;
  expandChildren = false;

  // Track expanded child goals and their sub-children
  expandedChildGoals = new Set<string>();
  childGoalSubGoals = new Map<string, Goal[]>();
  loadingChildSubGoals = new Set<string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private goalsService: GoalsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const publicId = params['publicId'];
      if (publicId) {
        this.loadGoal(publicId);
      }
    });
  }
  loadGoal(publicId: string): void {
    this.loading = true;
    this.error = '';
    this.goalsService.getPublicGoal(publicId).subscribe({
      next: (response: GoalResponse) => {
        if (response && response.success && response.data) {
          this.goal = response.data;
          // Load children goals for detailed view
          this.loadChildGoals();
        } else {
          this.error = 'Goal not found or invalid response format';
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.error =
          error.status === 404 ? 'Goal not found' : 'Failed to load goal';
        this.loading = false;
      },
    });
  }

  loadChildGoals(page: number = 1, append: boolean = false): void {
    if (!this.goal?.publicId) return;

    if (page === 1) {
      this.loadingChildren = true;
    } else {
      this.loadingMoreChildren = true;
    }

    this.goalsService
      .getPublicGoalChildren(this.goal.publicId, page, this.pageSize)
      .subscribe({
        next: (response: GoalsResponse) => {
          let newChildGoals: Goal[] = [];

          if (response && response.success === true && response.data) {
            newChildGoals = response.data.data || [];

            if (response.data.meta) {
              this.totalPages = response.data.meta.totalPages || 1;
            }
          } else if (Array.isArray(response)) {
            newChildGoals = response;
          }

          this.currentPage = page;
          this.allChildrenLoaded = page >= this.totalPages;

          if (append) {
            // Filter out duplicates
            const existingIds = new Set(this.childGoals.map((goal) => goal.id));
            const uniqueNewGoals = newChildGoals.filter(
              (goal) => !existingIds.has(goal.id)
            );
            this.childGoals = [...this.childGoals, ...uniqueNewGoals];
          } else {
            this.childGoals = newChildGoals;
          }

          // Auto-expand if there are child goals
          if (this.childGoals.length > 0 && !append) {
            this.expandChildren = true;
          }

          this.loadingChildren = false;
          this.loadingMoreChildren = false;
        },
        error: (error: any) => {
          this.loadingChildren = false;
          this.loadingMoreChildren = false;
        },
      });
  }

  loadMoreChildren(): void {
    if (this.loadingMoreChildren || this.allChildrenLoaded) {
      return;
    }

    const nextPage = this.currentPage + 1;
    if (nextPage <= this.totalPages) {
      this.loadChildGoals(nextPage, true);
    }
  }
  toggleChildrenExpansion(): void {
    this.expandChildren = !this.expandChildren;
    if (this.expandChildren && this.childGoals.length === 0) {
      this.loadChildGoals();
    }
  }

  goToPublicGoals(): void {
    this.router.navigate(['/public']);
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

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  isOverdue(goal: Goal): boolean {
    if (!goal.deadline) return false;
    return this.getDaysUntilDeadline(goal.deadline) < 0;
  }

  isDeadlineWarning(goal: Goal): boolean {
    if (!goal.deadline) return false;
    const days = this.getDaysUntilDeadline(goal.deadline);
    return days >= 0 && days <= 1;
  }

  getStatusText(goal: Goal): string {
    return goal.completed ? 'Completed' : 'Not Completed';
  }

  getDeadlineColorClass(goal: Goal): string {
    if (!goal.deadline) return 'text-gray-600';

    const days = this.getDaysUntilDeadline(goal.deadline);

    if (days < 0) {
      return 'text-red-600'; // Past deadline (overdue)
    } else if (days <= 1) {
      return 'text-yellow-600'; // Less than 1 day remaining
    } else {
      return 'text-green-600'; // Future deadline (more than 1 day)
    }
  }

  getDaysUntilDeadline(deadline: string): number {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToPublic(): void {
    this.router.navigate(['/public']);
  }

  viewChildGoal(childGoal: Goal): void {
    if (childGoal.publicId) {
      this.router.navigate(['/public', childGoal.publicId]);
    }
  }

  isChildGoalExpanded(childGoal: Goal): boolean {
    return childGoal.publicId
      ? this.expandedChildGoals.has(childGoal.publicId)
      : false;
  }

  loadChildGoalSubChildren(childGoal: Goal): void {
    if (!childGoal.publicId) return;

    this.loadingChildSubGoals.add(childGoal.publicId);

    this.goalsService
      .getPublicGoalChildren(childGoal.publicId, 1, 10)
      .subscribe({
        next: (response: GoalsResponse) => {
          let subGoals: Goal[] = [];

          if (response && response.success === true && response.data) {
            subGoals = response.data.data || [];
          } else if (Array.isArray(response)) {
            subGoals = response;
          }

          this.childGoalSubGoals.set(childGoal.publicId!, subGoals);
          this.loadingChildSubGoals.delete(childGoal.publicId!);
        },
        error: (error: any) => {
          this.loadingChildSubGoals.delete(childGoal.publicId!);
        },
      });
  }

  getChildGoalSubChildren(childGoal: Goal): Goal[] {
    return childGoal.publicId
      ? this.childGoalSubGoals.get(childGoal.publicId) || []
      : [];
  }

  isLoadingChildSubGoals(childGoal: Goal): boolean {
    return childGoal.publicId
      ? this.loadingChildSubGoals.has(childGoal.publicId)
      : false;
  }
}
