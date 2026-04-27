import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersPrismaService } from './users-prisma.service';
import { UserEntity } from './entities/user.entity';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [UsersService, UsersPrismaService],
  exports: [UsersService, UsersPrismaService],
})
export class UsersModule {}
