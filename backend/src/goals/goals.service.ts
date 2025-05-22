import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Goal } from './goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

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

    // Generate a public ID if the goal is public
    const publicId = createGoalDto.isPublic ? uuidv4() : undefined;

    // Create the goal entity
    const goal = this.goalsRepository.create({
      ...createGoalDto,
      ownerId: userId,
      publicId,
    } as unknown as Goal);

    // Save and return the goal
    return this.goalsRepository.save(goal);
  }

  async findAll(userId: string): Promise<Goal[]> {
    return this.goalsRepository.find({
      where: { ownerId: userId },
      order: { order: 'ASC' },
    });
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

    // If updating parent, validate it
    if (updateGoalDto.parentId) {
      await this.validateParentGoal(updateGoalDto.parentId, userId);

      // Prevent circular references
      if (updateGoalDto.parentId === id) {
        throw new BadRequestException('Goal cannot be its own parent');
      }
    }

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

  async findPublicGoals(): Promise<Goal[]> {
    return this.goalsRepository.find({
      where: { isPublic: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findPublicGoalByPublicId(publicId: string): Promise<Goal> {
    const goal = await this.goalsRepository.findOne({
      where: { publicId, isPublic: true },
      relations: ['parent'],
    });

    if (!goal) {
      throw new NotFoundException(`Public goal not found`);
    }

    return goal;
  }
  private async validateParentGoal(
    parentId: string,
    userId: string,
  ): Promise<void> {
    const parent = await this.goalsRepository.findOne({
      where: { id: parentId, ownerId: userId },
      relations: ['parent'],
    });

    if (!parent) {
      throw new NotFoundException(
        `Parent goal with ID "${parentId}" not found`,
      );
    }

    // Check if the parent already has a parent (to enforce max 2 level nesting)
    if (parent.parent) {
      throw new BadRequestException(
        'Maximum nesting depth reached. Goals can only be nested 2 levels deep.',
      );
    }
  }

  /**
   * Find all child goals of a parent goal
   */
  async findChildren(parentId: string, userId: string): Promise<Goal[]> {
    const parent = await this.findOne(parentId, userId);

    return this.goalsRepository.find({
      where: { parentId: parent.id, ownerId: userId },
      order: { order: 'ASC' },
    });
  }

  /**
   * Reorder goals by updating their order property
   */
  async reorderGoals(
    goalId: string,
    newOrder: number,
    userId: string,
  ): Promise<Goal> {
    const goal = await this.findOne(goalId, userId);

    // Update the order of the goal
    goal.order = newOrder;

    // Save and return the updated goal
    return this.goalsRepository.save(goal);
  }

  /**
   * Get user's goal statistics
   */ async getStatistics(userId: string): Promise<{
    totalGoals: number;
    totalPublicGoals: number;
    totalPrivateGoals: number;
    rootGoals: number;
    childGoals: number;
  }> {
    const totalGoals = await this.goalsRepository.count({
      where: { ownerId: userId },
    });

    const totalPublicGoals = await this.goalsRepository.count({
      where: { ownerId: userId, isPublic: true },
    });

    // Find goals with no parent (root goals)
    const rootGoals = await this.goalsRepository
      .createQueryBuilder('goal')
      .where('goal.ownerId = :userId', { userId })
      .andWhere('goal.parentId IS NULL')
      .getCount();

    // Find goals with a parent (child goals)
    const childGoals = await this.goalsRepository
      .createQueryBuilder('goal')
      .where('goal.ownerId = :userId', { userId })
      .andWhere('goal.parentId IS NOT NULL')
      .getCount();

    return {
      totalGoals,
      totalPublicGoals,
      totalPrivateGoals: totalGoals - totalPublicGoals,
      rootGoals,
      childGoals,
    };
  }
}
