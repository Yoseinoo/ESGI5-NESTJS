import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
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

@ApiTags('projects')
@ApiBearerAuth('JWT-auth')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un projet' })
  @ApiCreatedResponse({ description: 'Projet créé' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les projets' })
  @ApiOkResponse({ description: 'Liste des projets' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un projet par ID' })
  @ApiOkResponse({ description: 'Projet trouvé' })
  @ApiNotFoundResponse({ description: 'Projet introuvable' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un projet' })
  @ApiOkResponse({ description: 'Projet mis à jour' })
  @ApiNotFoundResponse({ description: 'Projet introuvable' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un projet' })
  @ApiNoContentResponse({ description: 'Projet supprimé' })
  @ApiNotFoundResponse({ description: 'Projet introuvable' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }
}
