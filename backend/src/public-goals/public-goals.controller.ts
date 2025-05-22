import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicGoalsService } from './public-goals.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiResponse } from '../common/responses/api-response';

@Controller('public-goals')
export class PublicGoalsController {
  constructor(private readonly publicGoalsService: PublicGoalsService) {}

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const paginatedResult = await this.publicGoalsService.findAll(
      paginationDto.page,
      paginationDto.limit,
    );
    return ApiResponse.success(paginatedResult);
  }

  @Get(':publicId')
  async findOne(@Param('publicId') publicId: string) {
    const goal = await this.publicGoalsService.findOneByPublicId(publicId);
    return ApiResponse.success(goal);
  }

  @Get(':publicId/children')
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
