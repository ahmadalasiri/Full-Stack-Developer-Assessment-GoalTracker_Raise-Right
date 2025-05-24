import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to insert test data from SQL files
 * This script will read the SQL files and execute them against the database
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('Running test data SQL scripts...');

    // First insert the users data
    console.log('Inserting test users...');
    const usersFilePath = path.join(__dirname, 'users-test-data.sql');
    if (fs.existsSync(usersFilePath)) {
      const usersSql = fs.readFileSync(usersFilePath, 'utf8');
      await dataSource.query(usersSql);
      console.log('Successfully inserted test users!');
    } else {
      console.warn('Users test data file not found:', usersFilePath);
    }

    // Then insert the goals data
    console.log('Inserting test goals...');
    const goalsFilePath = path.join(__dirname, 'goals-test-data.sql');
    if (fs.existsSync(goalsFilePath)) {
      const goalsSql = fs.readFileSync(goalsFilePath, 'utf8');
      await dataSource.query(goalsSql);
      console.log('Successfully inserted test goals!');
    } else {
      console.warn('Goals test data file not found:', goalsFilePath);
    }

    console.log('Test data loading completed successfully!');
  } catch (error) {
    console.error('Error loading test data:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
