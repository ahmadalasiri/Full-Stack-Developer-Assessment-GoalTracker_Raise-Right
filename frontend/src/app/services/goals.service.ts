import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Goal,
  CreateGoalDto,
  UpdateGoalDto,
  ReorderGoalDto,
} from '../models/goal.model';

export interface GoalsResponse {
  success: boolean;
  data: {
    data: Goal[];
    meta: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

export interface GoalResponse {
  success: boolean;
  data: Goal;
}

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  private apiUrl = `${environment.apiUrl}/goals`;

  constructor(private http: HttpClient) {}

  // Get all goals (root level)
  getGoals(page: number = 1, limit: number = 10): Observable<GoalsResponse> {
    const params = { page: page.toString(), limit: limit.toString() };
    return this.http.get<GoalsResponse>(this.apiUrl, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching goals:', error);
        return throwError(() => error);
      })
    );
  }
  // Get children of a specific goal
  getGoalChildren(
    parentId: string,
    page: number = 1,
    limit: number = 10
  ): Observable<GoalsResponse> {
    const params = { page: page.toString(), limit: limit.toString() };
    return this.http
      .get<GoalsResponse>(`${this.apiUrl}/${parentId}/children`, { params })
      .pipe(
        catchError((error) => {
          console.error(`Error fetching children for goal ${parentId}:`, error);
          return throwError(() => error);
        })
      );
  }

  // Create a new goal
  createGoal(goal: CreateGoalDto): Observable<GoalResponse> {
    return this.http.post<GoalResponse>(this.apiUrl, goal).pipe(
      catchError((error) => {
        console.error('Error creating goal:', error);
        return throwError(() => error);
      })
    );
  }

  // Update an existing goal
  updateGoal(id: string, goal: UpdateGoalDto): Observable<GoalResponse> {
    return this.http.patch<GoalResponse>(`${this.apiUrl}/${id}`, goal).pipe(
      catchError((error) => {
        console.error(`Error updating goal ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  // Delete a goal
  deleteGoal(id: string): Observable<{ success: boolean; status?: number }> {
    return this.http
      .delete<{ success: boolean; status?: number }>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError((error) => {
          console.error(`Error deleting goal ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  // Reorder a goal
  reorderGoal(id: string, newOrder: number): Observable<GoalResponse> {
    const reorderDto: ReorderGoalDto = { newOrder };
    return this.http
      .patch<GoalResponse>(`${this.apiUrl}/${id}/reorder`, reorderDto)
      .pipe(
        catchError((error) => {
          console.error(`Error reordering goal ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  // Get a single goal by ID
  getGoal(id: string): Observable<GoalResponse> {
    return this.http.get<GoalResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Error fetching goal ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
}
