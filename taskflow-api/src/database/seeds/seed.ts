import { AppDataSource } from '../data-source';
import { UserEntity } from '../../users/entities/user.entity';
import { TeamEntity } from '../../teams/entities/team.entity';
import { ProjectEntity } from '../../projects/entities/project.entity';
import {
  TaskEntity,
  TaskPriority,
  TaskStatus,
} from '../../tasks/entities/task.entity';
import { CommentEntity } from '../../comments/entities/comment.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/users/interfaces/user.interface';

async function seed() {
  console.log('⏳ Initialisation de la base...');
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(UserEntity);
  const teamRepo = AppDataSource.getRepository(TeamEntity);
  const projectRepo = AppDataSource.getRepository(ProjectEntity);
  const taskRepo = AppDataSource.getRepository(TaskEntity);
  const commentRepo = AppDataSource.getRepository(CommentEntity);

  console.log('🧹 Vidage des tables...');
  await commentRepo.query('TRUNCATE comments CASCADE');
  await taskRepo.query('TRUNCATE tasks CASCADE');
  await projectRepo.query('TRUNCATE projects CASCADE');
  await teamRepo.query('TRUNCATE teams CASCADE');
  await userRepo.query('TRUNCATE users CASCADE');

  console.log('👤 Création des utilisateurs...');
  const alice = userRepo.create({
    email: 'alice@example.com',
    name: 'Alice',
    role: UserRole.ADMIN,
    passwordHash: await bcrypt.hash('password123', 10),
  });
  const bob = userRepo.create({
    email: 'bob@example.com',
    name: 'Bob',
    role: UserRole.MEMBER,
    passwordHash: await bcrypt.hash('password123', 10),
  });
  const charlie = userRepo.create({
    email: 'charlie@example.com',
    name: 'Charlie',
    role: UserRole.VIEWER,
    passwordHash: await bcrypt.hash('password123', 10),
  });

  await userRepo.save([alice, bob, charlie]);
  console.log('✅ Utilisateurs créés');

  console.log('🏢 Création des équipes...');
  const alpha = teamRepo.create({
    name: 'Alpha',
    members: [alice, bob],
  });
  const beta = teamRepo.create({
    name: 'Beta',
    members: [charlie],
  });
  await teamRepo.save([alpha, beta]);
  console.log('✅ Équipes créées');

  console.log('📁 Création des projets...');
  const project1 = projectRepo.create({
    name: 'Project A',
    description: 'Premier projet de l’équipe Alpha',
    team: alpha,
  });
  const project2 = projectRepo.create({
    name: 'Project B',
    description: 'Deuxième projet de l’équipe Alpha',
    team: alpha,
  });
  await projectRepo.save([project1, project2]);
  console.log('✅ Projets créés');

  console.log('📝 Création des tâches...');
  const task1 = taskRepo.create({
    title: 'Task 1',
    description: 'Première tâche',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    project: project1,
    assignee: alice,
  });
  const task2 = taskRepo.create({
    title: 'Task 2',
    description: 'Deuxième tâche',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    project: project1,
    assignee: bob,
  });
  const task3 = taskRepo.create({
    title: 'Task 3',
    description: 'Troisième tâche',
    status: TaskStatus.DONE,
    priority: TaskPriority.LOW,
    project: project1,
    assignee: undefined,
  });
  await taskRepo.save([task1, task2, task3]);
  console.log('✅ Tâches créées');

  console.log('💬 Création des commentaires...');
  const comment1 = commentRepo.create({
    content: 'Premier commentaire sur Task 1',
    task: task1,
    author: bob,
  });
  const comment2 = commentRepo.create({
    content: 'Second commentaire sur Task 2',
    task: task2,
    author: alice,
  });
  await commentRepo.save([comment1, comment2]);
  console.log('✅ Commentaires créés');

  console.log('🔒 Fermeture de la connexion...');
  await AppDataSource.destroy();
  console.log('🎉 Seed terminé !');
}

seed().catch((err) => {
  console.error('❌ Erreur lors du seed :', err);
  process.exit(1);
});
