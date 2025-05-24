import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GoalsService, GoalsResponse, GoalResponse } from './goals.service';
import { Goal, CreateGoalDto, UpdateGoalDto } from '../models/goal.model';
import { environment } from '../../environments/environment';

describe('GoalsService', () => {
  let service: GoalsService;
  let httpMock: HttpTestingController;

  const mockGoal: Goal = {
    id: '1',
    title: 'Test Goal',
    description: 'Test Description',
    deadline: new Date('2024-12-31'),
    completed: false,
    isPublic: false,
    userId: 'user1',
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    children: []
  };

  const mockGoalsResponse: GoalsResponse = {
    success: true,
    data: {
      data: [mockGoal],
      meta: {
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        limit: 10
      }
    }
  };

  const mockGoalResponse: GoalResponse = {
    success: true,
    data: mockGoal
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GoalsService]
    });
    service = TestBed.inject(GoalsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getGoals', () => {
    it('should fetch goals with default pagination', () => {
      service.getGoals().subscribe(response => {
        expect(response).toEqual(mockGoalsResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/goals?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGoalsResponse);
    });

    it('should fetch goals with custom pagination', () => {
      service.getGoals(2, 20).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/goals?page=2&limit=20`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGoalsResponse);
    });

    it('should handle errors when fetching goals', () => {
      spyOn(console, 'error');

      service.getGoals().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(console.error).toHaveBeenCalledWith('Error fetching goals:', jasmine.any(Object));
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/goals?page=1&limit=10`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getGoalChildren', () => {
    it('should fetch goal children with default pagination', () => {
      const parentId = 'parent-1';

      service.getGoalChildren(parentId).subscribe(response => {
        expect(response).toEqual(mockGoalsResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/goals/${parentId}/children?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGoalsResponse);
    });

    it('should fetch goal children with custom pagination', () => {
      const parentId = 'parent-1';

      service.getGoalChildren(parentId, 3, 15).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/goals/${parentId}/children?page=3&limit=15`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGoalsResponse);
    });
  });

  describe('createGoal', () => {
    it('should create a new goal', () => {
      const createGoalDto: CreateGoalDto = {
        title: 'New Goal',
        description: 'New Description',
        deadline: new Date('2024-12-31'),
        isPublic: false,
        parentId: null
      };

      service.createGoal(createGoalDto).subscribe(response => {
        expect(response).toEqual(mockGoalResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/goals`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createGoalDto);
      req.flush(mockGoalResponse);
    });

    it('should handle errors when creating a goal', () => {
      spyOn(console, 'error');
      const createGoalDto: CreateGoalDto = {
        title: 'New Goal',
        description: 'New Description',
        deadline: new Date('2024-12-31'),
        isPublic: false,
        parentId: null
      };

      service.createGoal(createGoalDto).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(console.error).toHaveBeenCalledWith('Error creating goal:', jasmine.any(Object));
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/goals`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateGoal', () => {
    it('should update an existing goal', () => {
      const goalId = '1';
      const updateGoalDto: UpdateGoalDto = {
        title: 'Updated Goal',
        description: 'Updated Description'
      };

      service.updateGoal(goalId, updateGoalDto).subscribe(response => {
        expect(response).toEqual(mockGoalResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/goals/${goalId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateGoalDto);
      req.flush(mockGoalResponse);
    });

    it('should handle errors when updating a goal', () => {
      spyOn(console, 'error');
      const goalId = '1';
      const updateGoalDto: UpdateGoalDto = { title: 'Updated Goal' };

      service.updateGoal(goalId, updateGoalDto).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(console.error).toHaveBeenCalledWith('Error updating goal 1:', jasmine.any(Object));
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/goals/${goalId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteGoal', () => {
    it('should delete a goal', () => {
      const goalId = '1';
      const deleteResponse = { success: true };

      service.deleteGoal(goalId).subscribe(response => {
        expect(response).toEqual(deleteResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/goals/${goalId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(deleteResponse);
    });

    it('should handle errors when deleting a goal', () => {
      spyOn(console, 'error');
      const goalId = '1';

      service.deleteGoal(goalId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(console.error).toHaveBeenCalledWith('Error deleting goal 1:', jasmine.any(Object));
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/goals/${goalId}`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('reorderGoal', () => {
    it('should reorder a goal', () => {
      const goalId = '1';
      const newOrder = 5;

      service.reorderGoal(goalId, newOrder).subscribe(response => {
        expect(response).toEqual(mockGoalResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/goals/${goalId}/reorder`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ newOrder });
      req.flush(mockGoalResponse);
    });
  });
});
