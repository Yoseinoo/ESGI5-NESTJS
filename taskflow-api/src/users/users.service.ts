import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User {
    const user = this.users.find((u) => u.id === id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email);
  }

  create(dto: CreateUserDto): User {
    const existingUser = this.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException(
        `User with email ${dto.email} already exists`,
      );
    }

    const now = new Date();

    const user: User = {
      id: randomUUID(),
      email: dto.email,
      name: dto.name,
      role: dto.role,
      createdAt: now,
      updatedAt: now,
    };

    this.users.push(user);

    return user;
  }

  update(id: string, dto: UpdateUserDto): User {
    const user = this.findOne(id);

    if (dto.email && dto.email !== user.email) {
      const existingUser = this.findByEmail(dto.email);

      if (existingUser) {
        throw new ConflictException(
          `User with email ${dto.email} already exists`,
        );
      }
    }

    if (dto.email !== undefined) {
      user.email = dto.email;
    }

    if (dto.name !== undefined) {
      user.name = dto.name;
    }

    if (dto.role !== undefined) {
      user.role = dto.role;
    }

    user.updatedAt = new Date();

    return user;
  }

  remove(id: string): void {
    const index = this.users.findIndex((u) => u.id === id);

    if (index === -1) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    this.users.splice(index, 1);
  }
}
