import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoggerService } from '../core/services/logger.service';
import { ErrorHandlerService } from '../core/services/error-handler.service';
import { APP_CONSTANTS, GOAL_CONSTANTS } from '../core/constants/app.constants';
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
      pageSize: number;
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
  private readonly apiUrl = `${environment.apiUrl}/goals`;

  constructor(
    private http: HttpClient,
    private logger: LoggerService,
    private errorHandler: ErrorHandlerService
  ) {
    this.logger.info('GoalsService initialized');
  }
  // Get all goals (root level)
  getGoals(
    page: number = 1,
    limit: number = GOAL_CONSTANTS.DEFAULT_PAGE_SIZE
  ): Observable<GoalsResponse> {
    this.logger.info(`Fetching goals - page: ${page}, limit: ${limit}`);
    const params = { page: page.toString(), limit: limit.toString() };

    return this.http.get<GoalsResponse>(this.apiUrl, { params }).pipe(
      catchError((error) => {
        this.logger.error('Error fetching goals', error);
        return this.errorHandler.handleError(error);
      })
    );
  }

  // Get a specific goal by id
  getGoal(id: string): Observable<GoalResponse> {
    this.logger.info(`Fetching goal with id: ${id}`);
    return this.http.get<GoalResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching goal ${id}`, error);
        return this.errorHandler.handleError(error);
      })
    );
  }

  // Get children of a goal
  getGoalChildren(
    id: string,
    page: number = 1,
    limit: number = 100
  ): Observable<GoalsResponse> {
    this.logger.info(
      `Fetching children for goal ${id} - page: ${page}, limit: ${limit}`
    );
    const params = { page: page.toString(), limit: limit.toString() };

    return this.http
      .get<GoalsResponse>(`${this.apiUrl}/${id}/children`, { params })
      .pipe(
        catchError((error) => {
          this.logger.error(`Error fetching children for goal ${id}`, error);
          return this.errorHandler.handleError(error);
        })
      );
  }

  // Create a new goal
  createGoal(goal: CreateGoalDto): Observable<GoalResponse> {
    this.logger.info('Creating new goal', {
      title: goal.title,
      parentId: goal.parentId,
    });
    return this.http.post<GoalResponse>(this.apiUrl, goal).pipe(
      catchError((error) => {
        this.logger.error('Error creating goal', error);
        return this.errorHandler.handleError(error);
      })
    );
  }

  // Update an existing goal
  updateGoal(id: string, goal: UpdateGoalDto): Observable<GoalResponse> {
    this.logger.info(`Updating goal ${id}`, goal);
    return this.http.put<GoalResponse>(`${this.apiUrl}/${id}`, goal).pipe(
      catchError((error) => {
        this.logger.error(`Error updating goal ${id}`, error);
        return this.errorHandler.handleError(error);
      })
    );
  }

  // Delete a goal
  deleteGoal(id: string): Observable<{ success: boolean; status?: number }> {
    this.logger.info(`Deleting goal ${id}`);
    return this.http
      .delete<{ success: boolean; status?: number }>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError((error) => {
          this.logger.error(`Error deleting goal ${id}`, error);
          return this.errorHandler.handleError(error);
        })
      );
  }

  // Reorder a goal
  reorderGoal(id: string, newOrder: number): Observable<GoalResponse> {
    this.logger.info(`Reordering goal ${id} to position ${newOrder}`);
    const reorderDto: ReorderGoalDto = { newOrder };

    return this.http
      .put<GoalResponse>(`${this.apiUrl}/${id}/reorder`, reorderDto)
      .pipe(
        catchError((error) => {
          this.logger.error(`Error reordering goal ${id}`, error);
          return this.errorHandler.handleError(error);
        })
      );
  }
}
