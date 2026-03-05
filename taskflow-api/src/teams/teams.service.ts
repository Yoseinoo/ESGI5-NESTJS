import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamEntity } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teamsRepository: Repository<TeamEntity>,
    private readonly usersService: UsersService,
  ) {}

  async findAll(): Promise<TeamEntity[]> {
    return this.teamsRepository.find({ relations: ['members'] });
  }

  async findOne(id: string): Promise<TeamEntity> {
    const team = await this.teamsRepository.findOne({
      where: { id },
      relations: ['members', 'projects'],
    });
    if (!team) {
      throw new NotFoundException(`Team with id ${id} not found`);
    }
    return team;
  }

  async create(dto: CreateTeamDto): Promise<TeamEntity> {
    const team = this.teamsRepository.create(dto);
    return this.teamsRepository.save(team);
  }

  async update(id: string, dto: UpdateTeamDto): Promise<TeamEntity> {
    const team = await this.findOne(id);
    Object.assign(team, dto);
    return this.teamsRepository.save(team);
  }

  async remove(id: string): Promise<void> {
    const team = await this.findOne(id);
    await this.teamsRepository.remove(team);
  }

  async addMember(teamId: string, userId: string): Promise<TeamEntity> {
    const team = await this.teamsRepository.findOne({
      where: { id: teamId },
      relations: ['members'],
    });
    if (!team) throw new NotFoundException(`Team with id ${teamId} not found`);

    const user: UserEntity = await this.usersService.findOne(userId);

    if (team.members.some((m) => m.id === user.id)) {
      throw new ConflictException(`User with id ${userId} is already a member`);
    }

    team.members.push(user);
    return this.teamsRepository.save(team);
  }

  async removeMember(teamId: string, userId: string): Promise<TeamEntity> {
    const team = await this.teamsRepository.findOne({
      where: { id: teamId },
      relations: ['members'],
    });
    if (!team) throw new NotFoundException(`Team with id ${teamId} not found`);

    const filteredMembers = team.members.filter((m) => m.id !== userId);
    team.members = filteredMembers;

    return this.teamsRepository.save(team);
  }
}
