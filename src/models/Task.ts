import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Workflow } from './Workflow';
import { TaskProgressStatus, TaskStatus } from '../workers/taskRunner';
import { TaskType } from '../types/JobTypeMap';


@Entity({ name: 'tasks' })
export class Task {
  @PrimaryGeneratedColumn('uuid')
  taskId!: string;

  @Column()
  clientId!: string;

  @Column('text')
  geoJson!: string;

  @Column()
  status!: TaskStatus;

  @Column({ nullable: true, type: 'text' })
  progress?: TaskProgressStatus | null;

  @Column({ nullable: true })
  resultId?: string;

  @Column()
  taskType!: TaskType;

  @Column({ default: 1 })
  stepNumber!: number;

  @ManyToOne(() => Workflow, workflow => workflow.tasks)
  workflow!: Workflow;

  @ManyToOne(() => Task, { nullable: true })
  @JoinColumn({ name: 'dependsOnTaskId' }) 
  dependsOnTask?: Task;

  @Column({ nullable: true })
  dependsOnTaskId?: string;
}
