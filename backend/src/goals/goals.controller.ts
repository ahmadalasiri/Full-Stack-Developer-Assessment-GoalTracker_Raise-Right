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
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { ReorderGoalDto } from './dto/reorder-goal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiResponse } from '../common/responses/api-response';

@ApiTags('goals')
@ApiBearerAuth('JWT-auth')
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new goal' })
  @ApiBody({ type: CreateGoalDto })
  @SwaggerApiResponse({
    status: 201,
    description: 'Goal created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Goal created successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-string' },
            title: { type: 'string', example: 'Learn TypeScript' },
            description: {
              type: 'string',
              example: 'Complete TypeScript course',
            },
            deadline: { type: 'string', format: 'date-time' },
            isPublic: { type: 'boolean', example: false },
            completed: { type: 'boolean', example: false },
            order: { type: 'number', example: 1 },
            parentId: { type: 'string', nullable: true },
            ownerId: { type: 'string', example: 'user-uuid' },
          },
        },
      },
    },
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  async create(@Body() createGoalDto: CreateGoalDto, @CurrentUser() user) {
    const goal = await this.goalsService.create(createGoalDto, user.id);
    return ApiResponse.success(goal, 'Goal created successfully');
  }
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all goals for authenticated user' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Goals retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { type: 'object' } },
            total: { type: 'number', example: 10 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 1 },
          },
        },
      },
    },
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
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
  @ApiOperation({ summary: 'Get a specific goal by ID' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Goal retrieved successfully',
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @SwaggerApiResponse({ status: 404, description: 'Goal not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user) {
    const goal = await this.goalsService.findOne(id, user.id);
    return ApiResponse.success(goal);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a goal' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiBody({ type: UpdateGoalDto })
  @SwaggerApiResponse({ status: 200, description: 'Goal updated successfully' })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @SwaggerApiResponse({ status: 404, description: 'Goal not found' })
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
  @ApiOperation({ summary: 'Delete a goal' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @SwaggerApiResponse({ status: 204, description: 'Goal deleted successfully' })
  @SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @SwaggerApiResponse({ status: 404, description: 'Goal not found' })
  async remove(@Param('id') id: string, @CurrentUser() user) {
    await this.goalsService.remove(id, user.id);
    return ApiResponse.success(null, 'Goal deleted successfully');
  }

  @Get(':id/children')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get child goals of a parent goal' })
  @ApiParam({ name: 'id', description: 'Parent Goal ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Child goals retrieved successfully',
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @SwaggerApiResponse({ status: 404, description: 'Parent goal not found' })
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
  @ApiOperation({ summary: 'Reorder goals' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiBody({ type: ReorderGoalDto })
  @SwaggerApiResponse({
    status: 200,
    description: 'Goal reordered successfully',
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @SwaggerApiResponse({ status: 404, description: 'Goal not found' })
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
