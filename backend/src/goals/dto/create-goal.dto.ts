import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGoalDto {
  @ApiProperty({
    description: 'Title of the goal',
    example: 'Learn TypeScript',
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Description of the goal',
    example: 'Complete TypeScript course and build a project',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Deadline for the goal',
    example: '2025-12-31T23:59:59.000Z',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  deadline: string;

  @ApiProperty({
    description: 'Whether the goal is public or private',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    description: 'Parent goal ID for nested goals (max 2 levels)',
    example: 'parent-goal-uuid',
    required: false,
  })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({
    description: 'Completion status of the goal',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
