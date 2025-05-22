import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to insert test goals from SQL file
 * This script will read the SQL file and execute it against the database
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('Running test data SQL script...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'goals-test-data.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL statements
    await dataSource.query(sql);
    
    console.log('Successfully inserted test goals data!');
  } catch (error) {
    console.error('Error loading test data:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
