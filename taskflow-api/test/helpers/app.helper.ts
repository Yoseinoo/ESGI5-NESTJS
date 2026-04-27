import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Charger .env.test avant l'initialisation de l'AppModule
dotenv.config({ path: resolve(__dirname, '../../.env.test'), override: true });

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { GlobalExceptionFilter } from '../../src/common/filters/global-exception.filter';

export async function createTestApp(): Promise<{
  app: INestApplication;
  dataSource: DataSource;
}> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.init();

  const dataSource = app.get(DataSource);
  await dataSource.synchronize(); // create/update schema from entities

  return { app, dataSource };
}

export async function cleanDatabase(dataSource: DataSource) {
  await dataSource.query('TRUNCATE TABLE team_members CASCADE');
  await dataSource.query('TRUNCATE TABLE comments CASCADE');
  await dataSource.query('TRUNCATE TABLE tasks CASCADE');
  await dataSource.query('TRUNCATE TABLE projects CASCADE');
  await dataSource.query('TRUNCATE TABLE teams CASCADE');
  await dataSource.query('TRUNCATE TABLE users CASCADE');
}
