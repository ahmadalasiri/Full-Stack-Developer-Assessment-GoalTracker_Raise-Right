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
  private publicApiUrl = `${environment.apiUrl}/public-goals`;

  constructor(private http: HttpClient) {}
  getGoals(page: number = 1, limit: number = 10): Observable<GoalsResponse> {
    const params = { page: page.toString(), limit: limit.toString() };
    return this.http.get<GoalsResponse>(this.apiUrl, { params }).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

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
          return throwError(() => error);
        })
      );
  }

  createGoal(goal: CreateGoalDto): Observable<GoalResponse> {
    return this.http.post<GoalResponse>(this.apiUrl, goal).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  updateGoal(id: string, goal: UpdateGoalDto): Observable<GoalResponse> {
    return this.http.put<GoalResponse>(`${this.apiUrl}/${id}`, goal).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  deleteGoal(id: string): Observable<{ success: boolean; status?: number }> {
    return this.http
      .delete<{ success: boolean; status?: number }>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  reorderGoal(id: string, newOrder: number): Observable<GoalResponse> {
    const reorderDto: ReorderGoalDto = { newOrder };
    return this.http
      .put<GoalResponse>(`${this.apiUrl}/${id}/reorder`, reorderDto)
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  getGoal(id: string): Observable<GoalResponse> {
    return this.http.get<GoalResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
  // ==== PUBLIC GOALS METHODS ====

  getPublicGoals(
    page: number = 1,
    limit: number = 100
  ): Observable<GoalsResponse> {
    const params = { page: page.toString(), limit: limit.toString() };
    return this.http.get<GoalsResponse>(this.publicApiUrl, { params }).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getPublicGoal(publicId: string): Observable<GoalResponse> {
    return this.http.get<GoalResponse>(`${this.publicApiUrl}/${publicId}`).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getPublicGoalChildren(
    publicId: string,
    page: number = 1,
    limit: number = 20
  ): Observable<GoalsResponse> {
    const params = { page: page.toString(), limit: limit.toString() };
    return this.http
      .get<GoalsResponse>(`${this.publicApiUrl}/${publicId}/children`, {
        params,
      })
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }
}
