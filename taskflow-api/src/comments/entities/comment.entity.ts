import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { TaskEntity } from '../../tasks/entities/task.entity';

@Entity({ name: 'comments' })
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => UserEntity, (user) => user.comments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  author: UserEntity;

  @ManyToOne(() => TaskEntity, (task) => task.comments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  task: TaskEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
