import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PublicGoalsService } from './public-goals.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiResponse } from '../common/responses/api-response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('public-goals')
@ApiBearerAuth('JWT-auth')
@Controller('public-goals')
export class PublicGoalsController {
  constructor(private readonly publicGoalsService: PublicGoalsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all public goals' })
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
    description: 'Public goals retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  deadline: { type: 'string', format: 'date-time' },
                  publicId: { type: 'string' },
                  completed: { type: 'boolean' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
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
  async findAll(@Query() paginationDto: PaginationDto) {
    const paginatedResult = await this.publicGoalsService.findAll(
      paginationDto.page,
      paginationDto.limit,
    );
    return ApiResponse.success(paginatedResult);
  }

  @Get(':publicId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific public goal by public ID' })
  @ApiParam({ name: 'publicId', description: 'Public Goal ID' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Public goal retrieved successfully',
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @SwaggerApiResponse({ status: 404, description: 'Public goal not found' })
  async findOne(@Param('publicId') publicId: string) {
    const goal = await this.publicGoalsService.findOneByPublicId(publicId);
    return ApiResponse.success(goal);
  }

  @Get(':publicId/children')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get child goals of a public goal' })
  @ApiParam({ name: 'publicId', description: 'Public Goal ID' })
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
    description: 'Public goal children retrieved successfully',
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @SwaggerApiResponse({ status: 404, description: 'Public goal not found' })
  async findChildren(
    @Param('publicId') publicId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const paginatedResult = await this.publicGoalsService.findChildren(
      publicId,
      paginationDto.page,
      paginationDto.limit,
    );
    return ApiResponse.success(paginatedResult);
  }
}
