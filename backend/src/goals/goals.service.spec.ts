import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoalsService } from './goals.service';
import { Goal } from './goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('GoalsService', () => {
  let service: GoalsService;
  let repository: Repository<Goal>;

  const mockGoal: Goal = {
    id: '1',
    title: 'Test Goal',
    description: 'Test Description',
    deadline: new Date('2024-12-31'),
    completed: false,
    isPublic: false,
    userId: 'user1',
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    children: [],
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    })),
    update: jest.fn(),
    delete: jest.fn(),
    manager: {
      transaction: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalsService,
        {
          provide: getRepositoryToken(Goal),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<GoalsService>(GoalsService);
    repository = module.get<Repository<Goal>>(getRepositoryToken(Goal));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new goal successfully', async () => {
      const createGoalDto: CreateGoalDto = {
        title: 'New Goal',
        description: 'New Description',
        deadline: new Date('2024-12-31'),
        isPublic: false,
        parentId: null,
      };

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ maxOrder: 0 }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);
      mockRepository.create.mockReturnValue(mockGoal);
      mockRepository.save.mockResolvedValue(mockGoal);

      const result = await service.create(createGoalDto, 'user1');

      expect(result).toEqual(mockGoal);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createGoalDto,
        userId: 'user1',
        order: 1,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockGoal);
    });

    it('should throw BadRequestException for invalid parent goal', async () => {
      const createGoalDto: CreateGoalDto = {
        title: 'New Goal',
        description: 'New Description',
        deadline: new Date('2024-12-31'),
        isPublic: false,
        parentId: 'invalid-parent',
      };

      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.create(createGoalDto, 'user1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated goals for a user', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockGoal], 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll('user1', 1, 10);

      expect(result.data).toEqual([mockGoal]);
      expect(result.meta.totalItems).toBe(1);
      expect(result.meta.itemCount).toBe(1);
      expect(result.meta.currentPage).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a goal by id for the owner', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockGoal);

      const result = await service.findOne('1', 'user1');

      expect(result).toEqual(mockGoal);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        id: '1',
        userId: 'user1',
      });
    });

    it('should throw NotFoundException when goal not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a goal successfully', async () => {
      const updateGoalDto: UpdateGoalDto = {
        title: 'Updated Goal',
        completed: true,
      };

      mockRepository.findOneBy.mockResolvedValue(mockGoal);
      mockRepository.save.mockResolvedValue({ ...mockGoal, ...updateGoalDto });

      const result = await service.update('1', updateGoalDto, 'user1');

      expect(result.title).toBe('Updated Goal');
      expect(result.completed).toBe(true);
    });

    it('should throw NotFoundException when updating non-existent goal', async () => {
      const updateGoalDto: UpdateGoalDto = {
        title: 'Updated Goal',
      };

      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update('1', updateGoalDto, 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a goal successfully', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockGoal);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('1', 'user1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when deleting non-existent goal', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPublicGoals', () => {
    it('should return public goals', async () => {
      const publicGoal = { ...mockGoal, isPublic: true };
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[publicGoal], 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getPublicGoals(1, 10);

      expect(result.data).toEqual([publicGoal]);
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'goal.isPublic = :isPublic',
        {
          isPublic: true,
        },
      );
    });
  });
});
