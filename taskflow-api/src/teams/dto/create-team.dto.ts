import { IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
  name: string;

  @IsString()
  @MaxLength(500, { message: 'La description ne peut pas dépasser 500 caractères' })
  @IsOptional()
  description?: string;
}
