import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalsService } from '../../services/goals.service';
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
  loadGoals(page: number = 1): void {
    this.loading = true;
    this.goalsService.getGoals(page, this.pageSize).subscribe({
      next: (response) => {
        console.log('API Response:', response);

        // Based on the exact API response format from Postman
        // Format: { success: true, data: { data: [...], meta: {...} } }
        if (response && response.success === true && response.data) {
          this.goals = response.data.data || [];

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
          this.goals = response;
          this.totalPages = 1;
        } else if (response && Array.isArray(response.data)) {
          // Response format: { data: [...goals] }
          this.goals = response.data;
          if (response.meta && response.meta.totalItems) {
            this.totalPages = Math.ceil(
              response.meta.totalItems / this.pageSize
            );
          }
        } else {
          console.warn('Unexpected API response format:', response);
          this.goals = [];
          this.totalPages = 1;
        }
        this.currentPage = page;

        // If no goal is currently selected and there are goals, select the first one
        if (!this.detailGoal && this.goals.length > 0) {
          this.selectGoal(this.goals[0]);
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading goals:', error);
        this.error = error.message || 'Failed to load goals';
        this.loading = false;
      },
    });
  }
  loadChildGoals(parentId: string): void {
    if (this.expandedGoals.has(parentId)) {
      this.expandedGoals.delete(parentId);
      return;
    }

    this.loading = true;
    this.goalsService.getGoalChildren(parentId).subscribe({
      next: (response) => {
        console.log('Child goals response:', response);
        if (response) {
          // Handle various response structures
          if (
            response.success === true &&
            response.data &&
            Array.isArray(response.data.data)
          ) {
            this.childrenGoals[parentId] = response.data.data;
          } else if (response.data && Array.isArray(response.data)) {
            this.childrenGoals[parentId] = response.data;
          } else if (Array.isArray(response)) {
            this.childrenGoals[parentId] = response;
          } else {
            this.childrenGoals[parentId] = [];
            console.warn('Unexpected child goals response format:', response);
          }
          this.expandedGoals.add(parentId);
        } else {
          console.error('Invalid response format:', response);
          this.error = 'Failed to load child goals: Invalid response format';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error(`Error loading children for goal ${parentId}:`, error);
        this.error = error.message || 'Failed to load child goals';
        this.loading = false;
      },
    });
  }
  openGoalModal(goal?: Goal): void {
    this.isEditMode = !!goal;
    this.selectedGoal = goal || null;
    this.goalForm = this.createGoalForm(goal);
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
            next: (response) => {
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
            error: (error) => {
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
          next: (response) => {
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
          error: (error) => {
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
        next: (response) => {
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
        error: (error) => {
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
      next: (response) => {
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
      error: (error) => {
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

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadGoals(page);
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
}
