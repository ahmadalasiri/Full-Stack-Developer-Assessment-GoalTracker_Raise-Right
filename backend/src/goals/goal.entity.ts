import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'timestamp with time zone' })
  deadline: Date;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: false })
  completed: boolean;

  @Column({ nullable: true })
  parentId: string;

  @Column({ default: 0 })
  order: number;

  @Column({ nullable: true, unique: true })
  publicId: string;

  @Column()
  ownerId: string;

  @ManyToOne(() => Goal, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Goal;

  @ManyToOne(() => User, (user) => user.goals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
