import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Goal } from '../goals/goal.entity';
import { PaginationResponse } from '../common/interfaces/pagination.interface';
import { PaginationUtil } from '../common/utils/pagination.util';

@Injectable()
export class PublicGoalsService {
  constructor(
    @InjectRepository(Goal)
    private goalsRepository: Repository<Goal>,
  ) {}

  /**
   * Find all public root goals with pagination
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationResponse<Goal>> {
    const [goals, total] = await this.goalsRepository.findAndCount({
      where: {
        isPublic: true,
        parentId: IsNull(), // Only return root-level goals
      },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    // Generate pagination metadata
    const meta = PaginationUtil.createPaginationMeta(page, limit, total);

    return {
      data: goals,
      meta,
    };
  }

  /**
   * Find a specific public goal by its publicId
   */
  async findOneByPublicId(publicId: string): Promise<Goal> {
    const goal = await this.goalsRepository.findOne({
      where: { publicId, isPublic: true },
      relations: ['parent'],
    });

    if (!goal) {
      throw new NotFoundException(`Public goal not found`);
    }

    return goal;
  }

  /**
   * Find all public child goals of a parent goal with pagination
   */
  async findChildren(
    parentPublicId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationResponse<Goal>> {
    const parent = await this.findOneByPublicId(parentPublicId);

    const [children, total] = await this.goalsRepository.findAndCount({
      where: { parentId: parent.id, isPublic: true },
      order: { order: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    // Generate pagination metadata
    const meta = PaginationUtil.createPaginationMeta(page, limit, total);

    return {
      data: children,
      meta,
    };
  }
}
