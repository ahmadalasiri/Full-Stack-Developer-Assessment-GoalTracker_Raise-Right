import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { UsersService } from '../../users/users.service';
import { GoalsService } from '../../goals/goals.service';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const usersService = app.get(UsersService);
  const goalsService = app.get(GoalsService);

  try {
    // Create a test user
    const testUser = await usersService['usersRepository'].create({
      username: 'testuser',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
    });

    await usersService['usersRepository'].save(testUser);
    console.log('Created test user:', testUser.username);

    // Create sample goals
    // Root goal
    const rootGoal = await goalsService.create(
      {
        title: 'Complete Full Stack Assessment',
        description: 'Finish the Raise Right full stack developer assessment',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        isPublic: true,
        order: 0,
      },
      testUser.id,
    );

    // First level goal
    const childGoal1 = await goalsService.create(
      {
        title: 'Create Backend API',
        description: 'Setup NestJS API with PostgreSQL',
        deadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
        isPublic: false,
        parentId: rootGoal.id,
        order: 0,
      },
      testUser.id,
    );

    // First level goal
    const childGoal2 = await goalsService.create(
      {
        title: 'Build Angular Frontend',
        description: 'Implement Frontend UI using Angular',
        deadline: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), // 18 hours from now
        isPublic: true,
        parentId: rootGoal.id,
        order: 1,
      },
      testUser.id,
    );

    // Second level goal
    const subChildGoal = await goalsService.create(
      {
        title: 'Setup Auth Module',
        description: 'Implement JWT Authentication',
        deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
        isPublic: false,
        parentId: childGoal1.id,
        order: 0,
      },
      testUser.id,
    );

    console.log('Created sample goals');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
