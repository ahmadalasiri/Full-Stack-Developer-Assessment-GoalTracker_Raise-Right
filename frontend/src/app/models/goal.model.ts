export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO Date
  isPublic: boolean;
  parentId?: string | null;
  order: number; // For custom ordering
  publicId?: string; // Public read-only share link
  ownerId: string;
  completed?: boolean;
  children?: Goal[];
}

export interface CreateGoalDto {
  title: string;
  description: string;
  deadline: string;
  isPublic: boolean;
  parentId?: string | null;
  completed?: boolean;
}

export interface UpdateGoalDto {
  title?: string;
  description?: string;
  deadline?: string;
  isPublic?: boolean;
  parentId?: string | null;
  completed?: boolean;
}

export interface ReorderGoalDto {
  newOrder: number;
}
