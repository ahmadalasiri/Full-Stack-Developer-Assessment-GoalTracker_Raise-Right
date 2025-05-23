import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Goal,
  CreateGoalDto,
  UpdateGoalDto,
  ReorderGoalDto,
} from '../models/goal.model';

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  private apiUrl = 'http://localhost:3001/api/goals';

  constructor(private http: HttpClient) {}

  // Get all goals (root level)
  getGoals(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  // Get a specific goal by id
  getGoal(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Get children of a goal
  getGoalChildren(
    id: string,
    page: number = 1,
    limit: number = 10
  ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${id}/children?page=${page}&limit=${limit}`
    );
  }

  // Create a new goal
  createGoal(goal: CreateGoalDto): Observable<any> {
    return this.http.post(this.apiUrl, goal);
  }

  // Update an existing goal
  updateGoal(id: string, goal: UpdateGoalDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, goal);
  }

  // Delete a goal
  deleteGoal(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Reorder a goal
  reorderGoal(id: string, newOrder: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/reorder`, {
      newOrder,
    } as ReorderGoalDto);
  }
}
