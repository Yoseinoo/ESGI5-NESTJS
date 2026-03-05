import {
  IsString,
  MaxLength,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';

export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DRAFT = 'draft',
}

export class CreateProjectDto {
  @IsString()
  @MaxLength(200, { message: 'Le nom ne peut pas dépasser 200 caractères' })
  name: string;

  @IsString()
  @MaxLength(1000, { message: 'La description ne peut pas dépasser 1000 caractères' })
  @IsOptional()
  description?: string;

  @IsEnum(ProjectStatus, {
    message: `Le statut doit être l'un de : ${Object.values(ProjectStatus).join(', ')}`,
  })
  @IsOptional()
  status?: ProjectStatus;

  @IsUUID('4', { message: 'teamId doit être un UUID v4 valide' })
  teamId: string;
}