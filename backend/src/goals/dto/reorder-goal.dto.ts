import { IsNotEmpty, IsNumber, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderGoalDto {
  @ApiProperty({
    description: 'New order position for the goal',
    example: 3,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  @Min(0)
  newOrder: number;
}
