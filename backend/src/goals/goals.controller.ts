import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { ReorderGoalDto } from './dto/reorder-goal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiResponse } from '../common/responses/api-response';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createGoalDto: CreateGoalDto, @CurrentUser() user) {
    const goal = await this.goalsService.create(createGoalDto, user.id);
    return ApiResponse.success(goal, 'Goal created successfully');
  }
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@CurrentUser() user, @Query() paginationDto: PaginationDto) {
    const paginatedResult = await this.goalsService.findAll(
      user.id,
      paginationDto.page,
      paginationDto.limit,
    );
    return ApiResponse.success(paginatedResult);
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user) {
    const goal = await this.goalsService.findOne(id, user.id);
    return ApiResponse.success(goal);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
    @CurrentUser() user,
  ) {
    const goal = await this.goalsService.update(id, updateGoalDto, user.id);
    return ApiResponse.success(goal, 'Goal updated successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user) {
    await this.goalsService.remove(id, user.id);
    return ApiResponse.success(null, 'Goal deleted successfully');
  }
  @Get('public/all')
  async findPublicGoals(@Query() paginationDto: PaginationDto) {
    const paginatedResult = await this.goalsService.findPublicGoals(
      paginationDto.page,
      paginationDto.limit,
    );
    return ApiResponse.success(paginatedResult);
  }
  @Get('public/:publicId')
  async findPublicGoal(@Param('publicId') publicId: string) {
    const goal = await this.goalsService.findPublicGoalByPublicId(publicId);
    return ApiResponse.success(goal);
  }
  @Get(':id/children')
  @UseGuards(JwtAuthGuard)
  async findChildren(
    @Param('id') id: string,
    @CurrentUser() user,
    @Query() paginationDto: PaginationDto,
  ) {
    const paginatedResult = await this.goalsService.findChildren(
      id,
      user.id,
      paginationDto.page,
      paginationDto.limit,
    );
    return ApiResponse.success(paginatedResult);
  }
  @Put(':id/reorder')
  @UseGuards(JwtAuthGuard)
  async reorderGoal(
    @Param('id') id: string,
    @Body() reorderGoalDto: ReorderGoalDto,
    @CurrentUser() user,
  ) {
    const goal = await this.goalsService.reorderGoals(
      id,
      reorderGoalDto.newOrder,
      user.id,
    );
    return ApiResponse.success(goal, 'Goal reordered successfully');
  }
}
