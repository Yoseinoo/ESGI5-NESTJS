import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException(
        `User with email ${dto.email} already exists`,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepository.create({
      email: dto.email,
      name: dto.name,
      role: dto.role ?? UserRole.MEMBER,
      passwordHash,
    });

    return this.usersRepository.save(user);
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    currentUser: { id: string; role: string },
  ): Promise<UserEntity> {
    // 🔹 Vérifier la permission
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier ce profil",
      );
    }

    // 🔹 Récupérer l'utilisateur à mettre à jour
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Utilisateur ${id} introuvable`);
    }

    // 🔹 Vérifier si l'email change et est déjà pris
    if (dto.email && dto.email !== user.email) {
      const existing = await this.usersRepository.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException(`L'email ${dto.email} est déjà utilisé`);
      }
    }

    // 🔹 Mettre à jour les champs
    Object.assign(user, dto);
    user.updatedAt = new Date();

    // 🔹 Sauvegarder et retourner
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async findByEmailWithPassword(email: string): Promise<UserEntity | null> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();

    return user ?? null;
  }
}
