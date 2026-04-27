import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('teams')
@ApiBearerAuth('JWT-auth')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister toutes les équipes' })
  @ApiOkResponse({ description: 'Liste des équipes' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  findAll() {
    return this.teamsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une équipe par ID' })
  @ApiOkResponse({ description: 'Équipe trouvée' })
  @ApiNotFoundResponse({ description: 'Équipe introuvable' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une équipe' })
  @ApiCreatedResponse({ description: 'Équipe créée' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une équipe' })
  @ApiOkResponse({ description: 'Équipe mise à jour' })
  @ApiNotFoundResponse({ description: 'Équipe introuvable' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une équipe' })
  @ApiNoContentResponse({ description: 'Équipe supprimée' })
  @ApiNotFoundResponse({ description: 'Équipe introuvable' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamsService.remove(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Ajouter un membre à une équipe' })
  @ApiCreatedResponse({ description: 'Membre ajouté' })
  @ApiNotFoundResponse({ description: 'Équipe ou utilisateur introuvable' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  addMember(
    @Param('id', ParseUUIDPipe) teamId: string,
    @Body('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.teamsService.addMember(teamId, userId);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Retirer un membre d\'une équipe' })
  @ApiNoContentResponse({ description: 'Membre retiré' })
  @ApiNotFoundResponse({ description: 'Équipe ou membre introuvable' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  removeMember(
    @Param('id', ParseUUIDPipe) teamId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.teamsService.removeMember(teamId, userId);
  }
}
