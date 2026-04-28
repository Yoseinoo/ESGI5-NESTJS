import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly tasksRepository: Repository<TaskEntity>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(dto: CreateTaskDto): Promise<TaskEntity> {
    const task = this.tasksRepository.create({
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      project: { id: dto.projectId },
      assignee: dto.assigneeId ? { id: dto.assigneeId } : undefined,
    });
    return this.tasksRepository.save(task);
  }

  async findAll(): Promise<TaskEntity[]> {
    return this.tasksRepository.find({
      relations: ['project', 'assignee'],
    });
  }

  async findOne(id: string): Promise<TaskEntity> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['project', 'assignee'],
    });
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskEntity> {
    const task = await this.findOne(id);
    const previousAssigneeId = task.assignee?.id;

    Object.assign(task, {
      ...dto,
      assignee: dto.assigneeId !== undefined
        ? (dto.assigneeId ? { id: dto.assigneeId } : null)
        : task.assignee,
    });

    const updated = await this.tasksRepository.save(task);

    if (dto.assigneeId && dto.assigneeId !== previousAssigneeId) {
      this.notificationsGateway.sendToUser(dto.assigneeId, 'task:assigned', {
        taskId: updated.id,
        taskTitle: updated.title,
        message: `Vous avez été assigné à la tâche "${updated.title}"`,
        timestamp: new Date().toISOString(),
      });
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);
  }
}
