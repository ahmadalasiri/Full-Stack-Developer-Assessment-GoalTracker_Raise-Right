import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGoalDto {
  @ApiProperty({
    description: 'Title of the goal',
    example: 'Learn Advanced TypeScript',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Description of the goal',
    example: 'Complete advanced TypeScript course and build complex projects',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Deadline for the goal',
    example: '2025-12-31T23:59:59.000Z',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiProperty({
    description: 'Whether the goal is public or private',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    description: 'Completion status of the goal',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
