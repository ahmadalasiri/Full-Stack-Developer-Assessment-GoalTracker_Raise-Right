import { IsNotEmpty, IsNumber, IsInt, Min } from 'class-validator';

export class ReorderGoalDto {
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  @Min(0)
  newOrder: number;
}
