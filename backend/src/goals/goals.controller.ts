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
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { ReorderGoalDto } from './dto/reorder-goal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiResponse } from '../common/responses/api-response';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('goals')
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new goal' })
  @SwaggerResponse({
    status: 201,
    description: 'The goal has been successfully created.',
  })
  async create(@Body() createGoalDto: CreateGoalDto, @CurrentUser() user) {
    const goal = await this.goalsService.create(createGoalDto, user.id);
    return ApiResponse.success(goal, 'Goal created successfully');
  }
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all root-level user goals with pagination' })
  async findAll(
    @CurrentUser() user,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const paginatedResult = await this.goalsService.findAll(
      user.id,
      page,
      limit,
    );
    return ApiResponse.success(paginatedResult);
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific goal by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user) {
    const goal = await this.goalsService.findOne(id, user.id);
    return ApiResponse.success(goal);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a specific goal' })
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
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a specific goal' })
  async remove(@Param('id') id: string, @CurrentUser() user) {
    await this.goalsService.remove(id, user.id);
    return ApiResponse.success(null, 'Goal deleted successfully');
  }
  @Get('public/all')
  @ApiOperation({ summary: 'Get all public goals with pagination' })
  async findPublicGoals(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const paginatedResult = await this.goalsService.findPublicGoals(
      page,
      limit,
    );
    return ApiResponse.success(paginatedResult);
  }
  @Get('public/:publicId')
  @ApiOperation({ summary: 'Get a specific public goal by its publicId' })
  async findPublicGoal(@Param('publicId') publicId: string) {
    const goal = await this.goalsService.findPublicGoalByPublicId(publicId);
    return ApiResponse.success(goal);
  }
  @Get(':id/children')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all children goals of a specific goal with pagination',
  })
  async findChildren(
    @Param('id') id: string,
    @CurrentUser() user,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const paginatedResult = await this.goalsService.findChildren(
      id,
      user.id,
      page,
      limit,
    );
    return ApiResponse.success(paginatedResult);
  }
  @Put(':id/reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder a goal by updating its order property' })
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
