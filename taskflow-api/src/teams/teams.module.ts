import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsService } from './teams.service';
import { TeamEntity } from './entities/team.entity';
import { UsersModule } from '../users/users.module';
import { TeamsController } from './teams.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamEntity]),
    UsersModule, // pour injecter UsersService dans TeamsService
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
