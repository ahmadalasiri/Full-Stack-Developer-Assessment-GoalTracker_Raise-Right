import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Goal } from './goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { PaginationResponse } from '../common/interfaces/pagination.interface';
import { PaginationUtil } from '../common/utils/pagination.util';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private goalsRepository: Repository<Goal>,
  ) {}
  async create(createGoalDto: CreateGoalDto, userId: string): Promise<Goal> {
    const { parentId } = createGoalDto;

    // Validate parent if provided
    if (parentId) {
      await this.validateParentGoal(parentId, userId);
    }

    // Find the maximum order value for goals with the same parent
    const queryBuilder = this.goalsRepository
      .createQueryBuilder('goal')
      .select('MAX(goal.order)', 'maxOrder')
      .where('goal.ownerId = :userId', { userId });

    if (parentId) {
      queryBuilder.andWhere('goal.parentId = :parentId', { parentId });
    } else {
      queryBuilder.andWhere('goal.parentId IS NULL');
    }

    const { maxOrder } = await queryBuilder.getRawOne();
    const newOrder = maxOrder !== null ? maxOrder + 1 : 0;

    // Generate a public ID if the goal is public
    const publicId = createGoalDto.isPublic ? uuidv4() : undefined;

    // Create the goal entity
    const goal = this.goalsRepository.create({
      ...createGoalDto,
      ownerId: userId,
      publicId,
      order: newOrder,
    } as unknown as Goal);

    // Save and return the goal
    return this.goalsRepository.save(goal);
  }
  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginationResponse<Goal>> {
    // Get only root goals
    const [goals, total] = await this.goalsRepository.findAndCount({
      where: {
        ownerId: userId,
        parentId: IsNull(),
      },
      order: { order: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    // Generate enhanced pagination metadata
    const meta = PaginationUtil.createPaginationMeta(page, limit, total);

    return {
      data: goals,
      meta,
    };
  }

  async findOne(id: string, userId: string): Promise<Goal> {
    const goal = await this.goalsRepository.findOne({
      where: { id, ownerId: userId },
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID "${id}" not found`);
    }

    return goal;
  }
  async update(
    id: string,
    updateGoalDto: UpdateGoalDto,
    userId: string,
  ): Promise<Goal> {
    const goal = await this.findOne(id, userId);

    // If updating public status, generate or clear publicId
    if (typeof updateGoalDto.isPublic !== 'undefined') {
      if (updateGoalDto.isPublic && !goal.publicId) {
        updateGoalDto['publicId'] = uuidv4();
      } else if (!updateGoalDto.isPublic) {
        updateGoalDto['publicId'] = null;
      }
    }

    Object.assign(goal, updateGoalDto);

    return this.goalsRepository.save(goal);
  }
  async remove(id: string, userId: string): Promise<void> {
    const goal = await this.findOne(id, userId);
    await this.goalsRepository.remove(goal);
  }
  private async validateParentGoal(
    parentId: string,
    userId: string,
  ): Promise<void> {
    const parent = await this.goalsRepository.findOne({
      where: { id: parentId, ownerId: userId },
      relations: ['parent', 'parent.parent'],
    });

    if (!parent) {
      throw new NotFoundException(
        `Parent goal with ID "${parentId}" not found`,
      );
    }

    // Check if the parent already has a grandparent (to enforce max 3 level nesting)
    // This allows for root > child > sub-child structure
    if (parent.parent && parent.parent.parent) {
      throw new BadRequestException(
        'Maximum nesting depth reached. Goals can only be nested 3 levels deep (root > child > sub-child).',
      );
    }
  } /**
   * Find all child goals of a parent goal with pagination
   */
  async findChildren(
    parentId: string,
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginationResponse<Goal>> {
    const parent = await this.findOne(parentId, userId);

    const [children, total] = await this.goalsRepository.findAndCount({
      where: { parentId: parent.id, ownerId: userId },
      order: { order: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    // Generate enhanced pagination metadata
    const meta = PaginationUtil.createPaginationMeta(page, limit, total);

    return {
      data: children,
      meta,
    };
  }
  /**
   * Reorder goals by updating their order property
   * This implementation correctly handles shifting other goals to maintain order integrity
   */
  async reorderGoals(
    goalId: string,
    newOrder: number,
    userId: string,
  ): Promise<Goal> {
    // Find the goal to reorder
    const goal = await this.findOne(goalId, userId);
    const oldOrder = goal.order;

    if (oldOrder === newOrder) {
      return goal;
    }

    // Get the parent ID (or null for root goals)
    const parentId = goal.parentId;

    // Start a transaction to ensure all updates are atomic
    const queryRunner =
      this.goalsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update orders of other goals in the same level
      if (oldOrder < newOrder) {
        // Moving down: shift goals between old and new position up by 1
        await queryRunner.manager
          .createQueryBuilder()
          .update(Goal)
          .set({ order: () => '"order" - 1' })
          .where('ownerId = :userId', { userId })
          .andWhere(
            parentId ? 'parentId = :parentId' : 'parentId IS NULL',
            parentId ? { parentId } : {},
          )
          .andWhere('"order" > :oldOrder', { oldOrder })
          .andWhere('"order" <= :newOrder', { newOrder })
          .execute();
      } else {
        // Moving up: shift goals between new and old position down by 1
        await queryRunner.manager
          .createQueryBuilder()
          .update(Goal)
          .set({ order: () => '"order" + 1' })
          .where('ownerId = :userId', { userId })
          .andWhere(
            parentId ? 'parentId = :parentId' : 'parentId IS NULL',
            parentId ? { parentId } : {},
          )
          .andWhere('"order" >= :newOrder', { newOrder })
          .andWhere('"order" < :oldOrder', { oldOrder })
          .execute();
      }

      // Update the target goal's order
      goal.order = newOrder;
      await queryRunner.manager.save(goal);

      // Commit the transaction
      await queryRunner.commitTransaction();

      return goal;
    } catch (error) {
      // Rollback in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
}
