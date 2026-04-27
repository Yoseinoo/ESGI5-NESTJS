import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersPrismaService {
  private readonly logger = new Logger(UsersPrismaService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Omit<User, 'passwordHash'>[]> {
    return this.prisma.user.findMany({
      omit: { passwordHash: true },
    });
  }

  async findOne(id: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: { passwordHash: true },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<Omit<User, 'passwordHash'> | null> {
    return this.prisma.user.findUnique({
      where: { email },
      omit: { passwordHash: true },
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(dto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    this.logger.log(`Création d'un utilisateur : ${dto.email}`);
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException(
        `User with email ${dto.email} already exists`,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        role: dto.role ?? 'member',
        passwordHash,
      },
      omit: { passwordHash: true },
    });
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    currentUser: { id: string; role: string },
  ): Promise<Omit<User, 'passwordHash'>> {
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier ce profil",
      );
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Utilisateur ${id} introuvable`);
    }

    if (dto.email && dto.email !== user.email) {
      const taken = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (taken) {
        throw new ConflictException(`L'email ${dto.email} est déjà utilisé`);
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
      omit: { passwordHash: true },
    });
  }

  async remove(id: string): Promise<void> {
    this.logger.warn(`Suppression de l'utilisateur : ${id}`);
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.prisma.user.delete({ where: { id } });
  }
}
