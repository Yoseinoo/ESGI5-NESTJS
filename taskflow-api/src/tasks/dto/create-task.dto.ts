import {
  IsString,
  MaxLength,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class CreateTaskDto {
  @IsString()
  @MaxLength(200, { message: 'Le titre ne peut pas dépasser 200 caractères' })
  title: string;

  @IsString()
  @MaxLength(2000, { message: 'La description ne peut pas dépasser 2000 caractères' })
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus, {
    message: `Le statut doit être l'un de : ${Object.values(TaskStatus).join(', ')}`,
  })
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority, {
    message: `La priorité doit être l'un de : ${Object.values(TaskPriority).join(', ')}`,
  })
  @IsOptional()
  priority?: TaskPriority;

  @IsUUID('4', { message: 'projectId doit être un UUID v4 valide' })
  projectId: string;

  @IsUUID('4', { message: 'assigneeId doit être un UUID v4 valide' })
  @IsOptional()
  assigneeId?: string;
}
