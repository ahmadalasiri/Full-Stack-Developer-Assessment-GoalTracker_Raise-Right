import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
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
  detailGoal: Goal | null = null; // Currently selected goal for details view
  // Infinite scrolling for root goals
  loadingMoreRootGoals = false;
  allRootGoalsLoaded = false;
  scrollThreshold = 200; // pixels from bottom to trigger loading more
  private scrollTimeout: any;

  // Infinite scrolling for child goals
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
    private router: Router
  ) {
    this.goalForm = this.createGoalForm();
  }

  ngOnInit(): void {
    this.loadGoals();
  }

  createGoalForm(goal?: Goal): FormGroup {
    return this.fb.group({
      title: [goal?.title || '', [Validators.required]],
      description: [goal?.description || '', []],
      deadline: [
        goal?.deadline
          ? new Date(goal.deadline).toISOString().split('T')[0]
          : '',
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
        console.log('API Response:', response);

        let newGoals: Goal[] = [];

        // Based on the exact API response format from Postman
        // Format: { success: true, data: { data: [...], meta: {...} } }
        if (response && response.success === true && response.data) {
          newGoals = response.data.data || [];

          // Use totalPages directly if available, otherwise calculate from totalItems
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
          // Response format: [...goals]
          newGoals = response;
          this.totalPages = 1;
        } else if (response && Array.isArray(response.data)) {
          // Response format: { data: [...goals] }
          newGoals = response.data;
          // No meta in this case
          this.totalPages = 1;
        } else {
          console.warn('Unexpected API response format:', response);
          newGoals = [];
          this.totalPages = 1;
        }

        this.currentPage = page;

        // Determine if we've loaded all goals
        this.allRootGoalsLoaded = page >= this.totalPages;

        // Set or append goals based on the append flag
        if (append) {
          // Filter out any duplicate goals that might already be in the array
          const existingIds = new Set(this.goals.map((goal) => goal.id));
          const uniqueNewGoals = newGoals.filter(
            (goal) => !existingIds.has(goal.id)
          );
          this.goals = [...this.goals, ...uniqueNewGoals];
        } else {
          this.goals = newGoals;
        }

        // If no goal is currently selected and there are goals, select the first one
        if (!this.detailGoal && this.goals.length > 0) {
          this.selectGoal(this.goals[0]);
        }

        this.loading = false;
        this.loadingMoreRootGoals = false;
      },
      error: (error: any) => {
        console.error('Error loading goals:', error);
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
    // For toggle functionality when clicking on a parent goal with children
    if (this.expandedGoals.has(parentId) && page === 1 && !append) {
      this.expandedGoals.delete(parentId);
      return;
    }

    // Initialize pagination for this parent if not already done
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
          console.log('Child goals response:', response);
          if (response) {
            let newChildGoals: Goal[] = [];

            // Handle various response structures
            if (
              response.success === true &&
              response.data &&
              Array.isArray(response.data.data)
            ) {
              newChildGoals = response.data.data;

              // Update pagination info
              if (response.data.meta) {
                this.childGoalsPagination[parentId] = {
                  currentPage: page,
                  totalPages: response.data.meta.totalPages || 1,
                  pageSize: response.data.meta.limit || 10,
                };

                // Check if all child goals are loaded
                this.allChildGoalsLoaded[parentId] =
                  page >= (response.data.meta.totalPages || 1);
              }
            } else if (response.data && Array.isArray(response.data)) {
              newChildGoals = response.data;
              this.allChildGoalsLoaded[parentId] = true; // Assume all loaded since no pagination info
            } else if (Array.isArray(response)) {
              newChildGoals = response;
              this.allChildGoalsLoaded[parentId] = true; // Assume all loaded since no pagination info
            } else {
              newChildGoals = [];
              console.warn('Unexpected child goals response format:', response);
              this.allChildGoalsLoaded[parentId] = true; // Assume all loaded due to error
            }

            if (append && this.childrenGoals[parentId]) {
              // Filter out duplicates
              const existingIds = new Set(
                this.childrenGoals[parentId].map((goal) => goal.id)
              );
              const uniqueNewGoals = newChildGoals.filter(
                (goal) => !existingIds.has(goal.id)
              );

              // Append new goals to existing ones
              this.childrenGoals[parentId] = [
                ...this.childrenGoals[parentId],
                ...uniqueNewGoals,
              ];
            } else {
              this.childrenGoals[parentId] = newChildGoals;
            }

            this.expandedGoals.add(parentId);
          } else {
            console.error('Invalid response format:', response);
            this.error = 'Failed to load child goals: Invalid response format';
            this.allChildGoalsLoaded[parentId] = true; // Assume all loaded due to error
          }
          this.loading = false;
          this.loadingMoreChildGoals = false;
        },
        error: (error: any) => {
          console.error(`Error loading children for goal ${parentId}:`, error);
          this.error = error.message || 'Failed to load child goals';
          this.loading = false;
          this.loadingMoreChildGoals = false;
          this.allChildGoalsLoaded[parentId] = true; // Assume all loaded due to error
        },
      });
  }
  openGoalModal(goal?: Goal): void {
    this.isEditMode = !!goal;
    this.selectedGoal = goal || null;
    this.goalForm = this.createGoalForm(goal);

    // When creating a new goal (not editing), ensure parentId is null
    // This way the main "Create New Goal" button always creates root goals
    if (!this.isEditMode) {
      this.goalForm.patchValue({ parentId: null });
    }

    this.showGoalModal = true;
  }

  createChildGoal(parentId: string): void {
    // Create a new goal form with the parent ID pre-filled
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
        // Update existing goal
        const updateDto: UpdateGoalDto = {
          title: formValue.title,
          description: formValue.description,
          deadline: formValue.deadline,
          isPublic: formValue.isPublic,
          completed: formValue.completed,
        };
        this.goalsService
          .updateGoal(this.selectedGoal.id, updateDto)
          .subscribe({
            next: (response: GoalResponse) => {
              if (response.success && response.data) {
                // Update the goal in the list
                const index = this.goals.findIndex(
                  (g) => g.id === this.selectedGoal!.id
                );
                if (index !== -1) {
                  this.goals[index] = response.data;
                }
                this.closeGoalModal();

                // If this was the detail goal, update it
                if (this.detailGoal?.id === this.selectedGoal!.id) {
                  this.detailGoal = response.data;
                }

                // Reload goals to ensure proper order
                this.loadGoals(this.currentPage);
              } else {
                console.error('Invalid response format:', response);
                this.error = 'Failed to update goal: Invalid response format';
              }
              this.loading = false;
            },
            error: (error: any) => {
              console.error('Error updating goal:', error);
              this.error = error.message || 'Failed to update goal';
              this.loading = false;
            },
          });
      } else {
        // Create new goal
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
                // Add to the main goals list if it's a root goal
                this.goals.push(response.data);
                // Select the newly created goal
                this.selectGoal(response.data);
              } else {
                // If it's a child goal, refresh the parent's children
                if (this.expandedGoals.has(formValue.parentId)) {
                  this.loadChildGoals(formValue.parentId);
                }

                // If we're adding a child to the current detail goal, ensure it's expanded
                if (this.detailGoal?.id === formValue.parentId) {
                  this.expandedGoals.add(formValue.parentId);

                  // If the children are already loaded, add this goal to the list
                  if (this.childrenGoals[formValue.parentId]) {
                    this.childrenGoals[formValue.parentId].push(response.data);
                  } else {
                    // Otherwise load the children
                    this.loadChildGoals(formValue.parentId);
                  }
                }
              }

              this.closeGoalModal();
              // Reload goals to ensure proper order
              this.loadGoals(this.currentPage);
            } else {
              console.error('Invalid response format:', response);
              this.error = 'Failed to create goal: Invalid response format';
            }
            this.loading = false;
          },
          error: (error: any) => {
            console.error('Error creating goal:', error);
            this.error = error.message || 'Failed to create goal';
            this.loading = false;
          },
        });
      }
    }
  }
  deleteGoal(id: string): void {
    if (confirm('Are you sure you want to delete this goal?')) {
      this.loading = true;
      this.goalsService.deleteGoal(id).subscribe({
        next: (response: any) => {
          if (response.success || response.status === 204) {
            this.goals = this.goals.filter((goal) => goal.id !== id);

            // If the deleted goal was the detail goal, clear it
            if (this.detailGoal?.id === id) {
              this.detailGoal = null;

              // Select another goal if possible
              if (this.goals.length > 0) {
                this.selectGoal(this.goals[0]);
              }
            }
          } else {
            console.error('Failed to delete goal:', response);
            this.error = 'Failed to delete goal';
          }
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error deleting goal:', error);
          this.error = error.message || 'Failed to delete goal';
          this.loading = false;
        },
      });
    }
  }
  toggleCompleted(goal: Goal): void {
    this.loading = true;
    const updateDto: UpdateGoalDto = {
      completed: !goal.completed,
    };
    this.goalsService.updateGoal(goal.id, updateDto).subscribe({
      next: (response: any) => {
        console.log('Toggle completed response:', response);
        // Check for any valid response and toggle the state regardless of response format
        // as long as there's no error
        if (response) {
          goal.completed = !goal.completed;
        } else {
          console.error('Invalid response format:', response);
          this.error =
            'Failed to update goal completion: Invalid response format';
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error toggling goal completion:', error);
        this.error = error.message || 'Failed to update goal';
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
  // Handle scrolling in the root goals container with throttling
  onRootGoalsScroll(event: Event): void {
    if (this.loadingMoreRootGoals || this.allRootGoalsLoaded) {
      return;
    }

    // Clear any existing timeout to prevent multiple rapid calls
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Throttle scroll event to prevent excessive calls
    this.scrollTimeout = setTimeout(() => {
      const container = event.target as HTMLElement;
      const scrollPosition = container.scrollTop + container.clientHeight;
      const scrollHeight = container.scrollHeight;

      // If we're near the bottom, load more
      if (scrollHeight - scrollPosition < this.scrollThreshold) {
        console.log(
          `Triggering infinite scroll for root goals. Current page: ${this.currentPage}, Total pages: ${this.totalPages}`
        );
        this.loadMoreRootGoals();
      }
    }, 150); // 150ms throttle time
  }
  // Load more root goals
  loadMoreRootGoals(): void {
    if (this.loadingMoreRootGoals || this.allRootGoalsLoaded) {
      return;
    }

    const nextPage = this.currentPage + 1;
    console.log(
      `Loading more root goals - Page ${nextPage} of ${this.totalPages}`
    );

    if (nextPage <= this.totalPages) {
      this.loadGoals(nextPage, true);
    } else {
      // Mark as all loaded if we've reached the end
      this.allRootGoalsLoaded = true;
      console.log('All root goals have been loaded');
    }
  }

  // Handle scrolling in the child goals container with throttling
  onChildGoalsScroll(event: Event): void {
    if (!this.detailGoal) {
      return;
    }

    const parentId = this.detailGoal.id;

    // Skip if already loading or all goals are loaded for this parent
    if (this.loadingMoreChildGoals || this.allChildGoalsLoaded[parentId]) {
      return;
    }

    // Clear any existing timeout to prevent multiple rapid calls
    if (this.childScrollTimeout) {
      clearTimeout(this.childScrollTimeout);
    }

    // Throttle scroll event to prevent excessive calls
    this.childScrollTimeout = setTimeout(() => {
      const container = event.target as HTMLElement;
      const scrollPosition = container.scrollTop + container.clientHeight;
      const scrollHeight = container.scrollHeight;

      // If we're near the bottom, load more
      if (scrollHeight - scrollPosition < this.scrollThreshold) {
        console.log(
          `Triggering infinite scroll for child goals of parent: ${parentId}`
        );
        this.loadMoreChildGoals();
      }
    }, 150); // 150ms throttle time
  }

  // Load more child goals for the current detail goal
  loadMoreChildGoals(): void {
    if (!this.detailGoal) {
      console.warn('No detail goal selected for loading more child goals');
      return;
    }

    const parentId = this.detailGoal.id;

    // Prevent duplicate requests
    if (this.loadingMoreChildGoals || this.allChildGoalsLoaded[parentId]) {
      return;
    }

    const pagination = this.childGoalsPagination[parentId];
    if (!pagination) {
      console.warn(`No pagination info found for parent: ${parentId}`);
      return;
    }

    const nextPage = pagination.currentPage + 1;
    console.log(
      `Loading page ${nextPage} of child goals for parent: ${parentId}`
    );

    if (nextPage <= pagination.totalPages) {
      this.loadChildGoals(parentId, nextPage, true);
    } else {
      // Mark as all loaded if we've reached the end
      this.allChildGoalsLoaded[parentId] = true;
      console.log(`All child goals loaded for parent: ${parentId}`);
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
}
