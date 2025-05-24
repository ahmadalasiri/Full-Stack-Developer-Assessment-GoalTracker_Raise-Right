import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  GoalsService,
  GoalsResponse,
  GoalResponse,
} from '../../services/goals.service';
import { Goal, CreateGoalDto, UpdateGoalDto } from '../../models/goal.model';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  goals: Goal[] = [];
  selectedGoal: Goal | null = null;
  goalForm: FormGroup;
  isEditMode = false;
  loading = false;
  error = '';
  expandedGoals = new Set<string>();
  childrenGoals: { [key: string]: Goal[] } = {};
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;
  showGoalModal = false;
  detailGoal: Goal | null = null;

  // Infinite scrolling properties
  loadingMoreRootGoals = false;
  allRootGoalsLoaded = false;
  scrollThreshold = 200;
  private scrollTimeout: any;

  // Child goals pagination
  loadingMoreChildGoals = false;
  allChildGoalsLoaded: { [parentId: string]: boolean } = {};
  childGoalsPagination: {
    [parentId: string]: {
      currentPage: number;
      totalPages: number;
      pageSize: number;
    };
  } = {};
  private childScrollTimeout: any;

  @ViewChild('rootGoalsContainer') rootGoalsContainer: ElementRef | undefined;
  @ViewChild('childGoalsContainer') childGoalsContainer: ElementRef | undefined;

  constructor(
    private goalsService: GoalsService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.goalForm = this.createGoalForm();
  }
  ngOnInit(): void {
    this.loadGoals();
  }

  createGoalForm(goal?: Goal): FormGroup {
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 7);
    const defaultDeadlineString = defaultDeadline.toISOString().split('T')[0];

    return this.fb.group({
      title: [goal?.title || '', [Validators.required]],
      description: [goal?.description || '', []],
      deadline: [
        goal?.deadline
          ? new Date(goal.deadline).toISOString().split('T')[0]
          : defaultDeadlineString,
        [Validators.required],
      ],
      isPublic: [goal?.isPublic || false, []],
      parentId: [goal?.parentId || null, []],
      completed: [goal?.completed || false, []],
    });
  }
  loadGoals(page: number = 1, append: boolean = false): void {
    if (page === 1) {
      this.loading = true;
    } else {
      this.loadingMoreRootGoals = true;
    }

    this.goalsService.getGoals(page, this.pageSize).subscribe({
      next: (response: GoalsResponse) => {
        let newGoals: Goal[] = [];

        if (response && response.success === true && response.data) {
          newGoals = response.data.data || [];
          if (response.data.meta) {
            if (response.data.meta.totalPages) {
              this.totalPages = response.data.meta.totalPages;
            } else if (response.data.meta.totalItems) {
              this.totalPages = Math.ceil(
                response.data.meta.totalItems / this.pageSize
              );
            } else {
              this.totalPages = 1;
            }
          } else {
            this.totalPages = 1;
          }
        } else if (Array.isArray(response)) {
          newGoals = response;
          this.totalPages = 1;
        } else if (response && Array.isArray(response.data)) {
          newGoals = response.data;
          this.totalPages = 1;
        } else {
          newGoals = [];
          this.totalPages = 1;
        }

        this.currentPage = page;
        this.allRootGoalsLoaded = page >= this.totalPages;

        if (append) {
          const existingIds = new Set(this.goals.map((goal) => goal.id));
          const uniqueNewGoals = newGoals.filter(
            (goal) => !existingIds.has(goal.id)
          );
          this.goals = [...this.goals, ...uniqueNewGoals];
        } else {
          this.goals = newGoals;
        }

        if (!this.detailGoal && this.goals.length > 0) {
          this.selectGoal(this.goals[0]);
        }

        this.loading = false;
        this.loadingMoreRootGoals = false;
      },
      error: (error: any) => {
        this.error = error.message || 'Failed to load goals';
        this.loading = false;
        this.loadingMoreRootGoals = false;
      },
    });
  }
  loadChildGoals(
    parentId: string,
    page: number = 1,
    append: boolean = false
  ): void {
    if (this.expandedGoals.has(parentId) && page === 1 && !append) {
      this.expandedGoals.delete(parentId);
      return;
    }

    if (!this.childGoalsPagination[parentId]) {
      this.childGoalsPagination[parentId] = {
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
      };
    }

    if (page === 1) {
      this.loading = true;
    } else {
      this.loadingMoreChildGoals = true;
    }

    this.goalsService
      .getGoalChildren(
        parentId,
        page,
        this.childGoalsPagination[parentId].pageSize
      )
      .subscribe({
        next: (response: GoalsResponse) => {
          if (response) {
            let newChildGoals: Goal[] = [];

            if (
              response.success === true &&
              response.data &&
              Array.isArray(response.data.data)
            ) {
              newChildGoals = response.data.data;

              if (response.data.meta) {
                this.childGoalsPagination[parentId] = {
                  currentPage: page,
                  totalPages: response.data.meta.totalPages || 1,
                  pageSize: response.data.meta.limit || 10,
                };

                this.allChildGoalsLoaded[parentId] =
                  page >= (response.data.meta.totalPages || 1);
              }
            } else if (response.data && Array.isArray(response.data)) {
              newChildGoals = response.data;
              this.allChildGoalsLoaded[parentId] = true;
            } else if (Array.isArray(response)) {
              newChildGoals = response;
              this.allChildGoalsLoaded[parentId] = true;
            } else {
              newChildGoals = [];
              this.allChildGoalsLoaded[parentId] = true;
            }

            if (append && this.childrenGoals[parentId]) {
              const existingIds = new Set(
                this.childrenGoals[parentId].map((goal) => goal.id)
              );
              const uniqueNewGoals = newChildGoals.filter(
                (goal) => !existingIds.has(goal.id)
              );

              this.childrenGoals[parentId] = [
                ...this.childrenGoals[parentId],
                ...uniqueNewGoals,
              ];
            } else {
              this.childrenGoals[parentId] = newChildGoals;
            }

            this.expandedGoals.add(parentId);
          } else {
            this.error = 'Failed to load child goals: Invalid response format';
            this.allChildGoalsLoaded[parentId] = true;
          }

          this.loading = false;
          this.loadingMoreChildGoals = false;
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to load child goals';
          this.loading = false;
          this.loadingMoreChildGoals = false;
          this.allChildGoalsLoaded[parentId] = true;
        },
      });
  }
  openGoalModal(goal?: Goal): void {
    this.isEditMode = !!goal;
    this.selectedGoal = goal || null;
    this.goalForm = this.createGoalForm(goal);

    if (!this.isEditMode) {
      this.goalForm.patchValue({ parentId: null });
    }

    this.showGoalModal = true;
  }

  createChildGoal(parentId: string): void {
    this.isEditMode = false;
    this.selectedGoal = null;
    this.goalForm = this.createGoalForm();
    this.goalForm.patchValue({ parentId: parentId });
    this.showGoalModal = true;
  }

  closeGoalModal(): void {
    this.selectedGoal = null;
    this.isEditMode = false;
    this.goalForm.reset();
    this.showGoalModal = false;
  }

  saveGoal(): void {
    if (this.goalForm.valid && !this.loading) {
      this.loading = true;
      const formValue = this.goalForm.value;

      if (this.isEditMode && this.selectedGoal) {
        this.updateGoal(formValue);
      } else {
        this.createGoal(formValue);
      }
    }
  }
  private updateGoal(formValue: any): void {
    if (!this.selectedGoal) {
      console.error('No selected goal for update');
      this.loading = false;
      return;
    }

    const updateDto: UpdateGoalDto = {
      title: formValue.title,
      description: formValue.description,
      deadline: formValue.deadline,
      isPublic: formValue.isPublic,
      completed: formValue.completed,
    };

    this.goalsService.updateGoal(this.selectedGoal.id, updateDto).subscribe({
      next: (response: GoalResponse) => {
        if (response.success && response.data && this.selectedGoal) {
          const selectedGoalId = this.selectedGoal.id; // Store the ID before closing modal
          const index = this.goals.findIndex((g) => g.id === selectedGoalId);
          if (index !== -1) {
            this.goals[index] = response.data;
          }
          this.closeGoalModal();

          if (this.detailGoal?.id === selectedGoalId) {
            this.detailGoal = response.data;
          }

          this.notificationService.success(
            'Goal Updated',
            'Your goal has been successfully updated.'
          );

          this.loadGoals(this.currentPage);
        } else {
          this.error = 'Failed to update goal: Invalid response format';
          this.notificationService.error(
            'Update Failed',
            'Failed to update goal: Invalid response format'
          );
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.error = error.message || 'Failed to update goal';
        this.notificationService.error(
          'Update Failed',
          error.message || 'Failed to update goal'
        );
        this.loading = false;
      },
    });
  }

  private createGoal(formValue: any): void {
    const createDto: CreateGoalDto = {
      title: formValue.title,
      description: formValue.description,
      deadline: formValue.deadline,
      isPublic: formValue.isPublic,
      parentId: formValue.parentId,
      completed: formValue.completed,
    };

    this.goalsService.createGoal(createDto).subscribe({
      next: (response: GoalResponse) => {
        if (response.success && response.data) {
          if (!formValue.parentId) {
            this.goals.push(response.data);
            this.selectGoal(response.data);
            this.notificationService.success(
              'Goal Created',
              'Your new root goal has been successfully created.'
            );
          } else {
            if (this.expandedGoals.has(formValue.parentId)) {
              this.loadChildGoals(formValue.parentId);
            }

            if (this.detailGoal?.id === formValue.parentId) {
              this.expandedGoals.add(formValue.parentId);

              if (this.childrenGoals[formValue.parentId]) {
                this.childrenGoals[formValue.parentId].push(response.data);
              } else {
                this.loadChildGoals(formValue.parentId);
              }
            }
            this.notificationService.success(
              'Sub-Goal Created',
              'Your new sub-goal has been successfully created.'
            );
          }

          this.closeGoalModal();
          this.loadGoals(this.currentPage);
        } else {
          this.error = 'Failed to create goal: Invalid response format';
          this.notificationService.error(
            'Creation Failed',
            'Failed to create goal: Invalid response format'
          );
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.error = error.message || 'Failed to create goal';
        this.notificationService.error(
          'Creation Failed',
          error.message || 'Failed to create goal'
        );
        this.loading = false;
      },
    });
  }
  deleteGoal(id: string): void {
    if (confirm('Are you sure you want to delete this goal?')) {
      this.loading = true;
      this.goalsService.deleteGoal(id).subscribe({
        next: (response: any) => {
          if (
            (response && (response.success || response.status === 204)) ||
            !response
          ) {
            this.goals = this.goals.filter((goal) => goal.id !== id);

            for (const parentId in this.childrenGoals) {
              if (this.childrenGoals[parentId]) {
                this.childrenGoals[parentId] = this.childrenGoals[
                  parentId
                ].filter((goal) => goal.id !== id);
              }
            }

            if (this.detailGoal?.id === id) {
              this.detailGoal = null;

              if (this.goals.length > 0) {
                this.selectGoal(this.goals[0]);
              }
            }

            this.notificationService.success(
              'Goal Deleted',
              'The goal has been successfully deleted.'
            );
          } else {
            this.error = 'Failed to delete goal';
            this.notificationService.error(
              'Deletion Failed',
              'Failed to delete the goal. Please try again.'
            );
          }
          this.loading = false;
        },
        error: (error: any) => {
          this.error = error.message || 'Failed to delete goal';
          this.notificationService.error(
            'Deletion Failed',
            error.message || 'Failed to delete goal'
          );
          this.loading = false;
        },
      });
    }
  }
  toggleCompleted(goal: Goal): void {
    if (!goal || !goal.id) {
      console.error('Invalid goal passed to toggleCompleted:', goal);
      return;
    }

    this.loading = true;
    const updateDto: UpdateGoalDto = {
      completed: !goal.completed,
    };

    this.goalsService.updateGoal(goal.id, updateDto).subscribe({
      next: (response: GoalResponse) => {
        if (response && response.success && response.data) {
          const updatedGoal = response.data;

          // Merge the updated properties with the original goal to preserve all data
          const mergedGoal = { ...goal, ...updatedGoal };
          console.log('Merged goal:', mergedGoal);

          // Update goal in main goals array
          const mainGoalIndex = this.goals.findIndex((g) => g.id === goal.id);
          if (mainGoalIndex !== -1) {
            this.goals[mainGoalIndex] = mergedGoal;
          }

          // Update goal in children goals arrays
          Object.keys(this.childrenGoals).forEach((parentId) => {
            const childIndex = this.childrenGoals[parentId].findIndex(
              (g) => g.id === goal.id
            );
            if (childIndex !== -1) {
              this.childrenGoals[parentId][childIndex] = mergedGoal;
            }
          });

          // Update detail goal if it's the same goal
          if (this.detailGoal?.id === goal.id) {
            this.detailGoal = mergedGoal;
          }
          this.notificationService.success(
            'Goal Updated',
            `Goal ${
              mergedGoal.completed ? 'completed' : 'marked as incomplete'
            } successfully.`
          );
        } else {
          this.error =
            'Failed to update goal completion: Invalid response format';
          this.notificationService.error(
            'Update Failed',
            'Failed to update goal completion: Invalid response format'
          );
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.error = error.message || 'Failed to update goal';
        this.notificationService.error(
          'Update Failed',
          error.message || 'Failed to update goal'
        );
        this.loading = false;
      },
    });
  }

  /**
   * Selects a goal for the detail view and loads its children
   */
  selectGoal(goal: Goal): void {
    this.detailGoal = goal;

    // Load children if not already loaded
    if (!this.childrenGoals[goal.id]) {
      this.loadChildGoals(goal.id);
    }

    // Add to expanded goals to show children in tree
    if (!this.expandedGoals.has(goal.id)) {
      this.expandedGoals.add(goal.id);
    }
  }

  isGoalExpanded(id: string): boolean {
    return this.expandedGoals.has(id);
  }

  toggleGoalExpansion(goalId: string): void {
    if (this.expandedGoals.has(goalId)) {
      this.expandedGoals.delete(goalId);
    } else {
      this.expandedGoals.add(goalId);
    }
  }
  onRootGoalsScroll(event: Event): void {
    if (this.loadingMoreRootGoals || this.allRootGoalsLoaded) {
      return;
    }

    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      const container = event.target as HTMLElement;
      const scrollPosition = container.scrollTop + container.clientHeight;
      const scrollHeight = container.scrollHeight;

      if (scrollHeight - scrollPosition < this.scrollThreshold) {
        this.loadMoreRootGoals();
      }
    }, 150);
  }

  loadMoreRootGoals(): void {
    if (this.loadingMoreRootGoals || this.allRootGoalsLoaded) {
      return;
    }

    const nextPage = this.currentPage + 1;

    if (nextPage <= this.totalPages) {
      this.loadGoals(nextPage, true);
    } else {
      this.allRootGoalsLoaded = true;
    }
  }

  onChildGoalsScroll(event: Event): void {
    if (!this.detailGoal) {
      return;
    }

    const parentId = this.detailGoal.id;

    if (this.loadingMoreChildGoals || this.allChildGoalsLoaded[parentId]) {
      return;
    }

    if (this.childScrollTimeout) {
      clearTimeout(this.childScrollTimeout);
    }

    this.childScrollTimeout = setTimeout(() => {
      const container = event.target as HTMLElement;
      const scrollPosition = container.scrollTop + container.clientHeight;
      const scrollHeight = container.scrollHeight;

      if (scrollHeight - scrollPosition < this.scrollThreshold) {
        this.loadMoreChildGoals();
      }
    }, 150);
  }

  loadMoreChildGoals(): void {
    if (!this.detailGoal) {
      return;
    }

    const parentId = this.detailGoal.id;

    if (this.loadingMoreChildGoals || this.allChildGoalsLoaded[parentId]) {
      return;
    }

    const pagination = this.childGoalsPagination[parentId];
    if (!pagination) {
      return;
    }

    const nextPage = pagination.currentPage + 1;

    if (nextPage <= pagination.totalPages) {
      this.loadChildGoals(parentId, nextPage, true);
    } else {
      this.allChildGoalsLoaded[parentId] = true;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  /**
   * Returns the list of goals that can be selected as parents
   * to enforce the 3-level nesting limit (root -> child -> sub-child)
   */
  getAvailableParentGoals(): Goal[] {
    // Get all goals including children
    const allGoals: Goal[] = [];

    // Add root goals
    allGoals.push(...this.goals);

    // Add child goals
    for (const goalId in this.childrenGoals) {
      if (this.childrenGoals[goalId]) {
        allGoals.push(...this.childrenGoals[goalId]);
      }
    }

    // Filter to allow only root goals and child goals as parents
    // Root goals: goals with no parentId
    // Child goals: goals with parentId but whose parent has no parentId
    return allGoals.filter((goal) => {
      // If it's a root goal (no parent), allow it
      if (!goal.parentId) {
        return true;
      }

      // If it's a child goal, check if its parent is a root goal
      if (goal.parentId) {
        // Find the parent goal
        const parent = allGoals.find((g) => g.id === goal.parentId);

        // Allow if parent exists and parent is a root goal (no grandparent)
        if (parent && !parent.parentId) {
          return true;
        }
      }

      // Don't allow sub-child goals (goals whose parent has a parent)
      return false;
    });
  }

  /**
   * Checks if a goal can have child goals
   * Enforces the 2-level nesting requirement
   */ canAddChildGoal(goal: Goal | null): boolean {
    if (!goal) return false;

    // A goal can have children if:
    // 1. It's a root goal (no parentId)
    // 2. It's a child (has parentId, but not a sub-child)

    // If it has no parent, it's a root goal
    if (!goal.parentId) return true;

    // Find the goal's parent from all available goals
    // First check in main goals array
    let parentGoal = this.goals.find((g) => g.id === goal.parentId);

    // If not found in main goals, search in all child goals
    if (!parentGoal) {
      for (const parentId in this.childrenGoals) {
        const foundParent = this.childrenGoals[parentId]?.find(
          (g) => g.id === goal.parentId
        );
        if (foundParent) {
          parentGoal = foundParent;
          break;
        }
      }
    }

    // If parent has no parent, this is a first-level child, so it can have children
    // Otherwise, it's already a sub-child, so it can't have more children
    return parentGoal ? !parentGoal.parentId : false;
  }

  /**
   * Determines the nesting level of a goal:
   * 0 = root goal
   * 1 = child goal
   * 2 = sub-child (grandchild) goal
   */
  getGoalNestingLevel(goal: Goal | null): number {
    if (!goal) return -1;
    if (!goal.parentId) return 0; // Root goal

    // Find parent goal
    let parentGoal = this.goals.find((g) => g.id === goal.parentId);

    // If not found in main goals, search in all child goals
    if (!parentGoal) {
      for (const parentId in this.childrenGoals) {
        const foundParent = this.childrenGoals[parentId]?.find(
          (g) => g.id === goal.parentId
        );
        if (foundParent) {
          parentGoal = foundParent;
          break;
        }
      }
    }

    // If parent has no parent, this is a first-level child
    if (parentGoal && !parentGoal.parentId) return 1;

    // Otherwise, it's a sub-child
    return 2;
  }
  /**
   * Get deadline color class based on deadline date
   */
  getDeadlineColorClass(deadline: string): string {
    if (!deadline) return 'text-gray-600';

    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'text-red-600 font-semibold'; // Past deadline (overdue)
    } else if (diffDays <= 1) {
      return 'text-yellow-600 font-semibold'; // Less than 1 day remaining
    } else {
      return 'text-green-600'; // Future deadline (more than 1 day)
    }
  }

  /**
   * Get goal status text - simplified to just Completed or Not Completed
   */
  getGoalStatus(goal: Goal): string {
    return goal.completed ? 'Completed' : 'Not Completed';
  }

  /**
   * Get goal status color class
   */
  getGoalStatusColorClass(goal: Goal): string {
    return goal.completed ? 'text-green-600 font-semibold' : 'text-red-600';
  }
  onGoalDrop(event: CdkDragDrop<Goal[]>, parentId?: string): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const goalList = parentId ? this.childrenGoals[parentId] : this.goals;
    const movedGoal = goalList[event.previousIndex];

    moveItemInArray(goalList, event.previousIndex, event.currentIndex);

    const newOrder = event.currentIndex;
    this.goalsService.reorderGoal(movedGoal.id, newOrder).subscribe({
      next: () => {
        this.loadGoals(this.currentPage);
      },
      error: () => {
        moveItemInArray(goalList, event.currentIndex, event.previousIndex);
        this.error = 'Failed to reorder goal. Please try again.';
      },
    });
  }

  /**
   * Navigate to home page
   */
  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Navigate to public goals page
   */
  navigateToPublicGoals(): void {
    this.router.navigate(['/public']);
  }
}
