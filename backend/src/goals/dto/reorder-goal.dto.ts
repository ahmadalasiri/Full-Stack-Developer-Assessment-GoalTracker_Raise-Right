import { IsNotEmpty, IsNumber, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderGoalDto {
  @ApiProperty({
    description: 'The new order position for the goal',
    example: 2,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  @Min(0)
  newOrder: number;
}
