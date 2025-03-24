import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Workflow } from './Workflow';
import { TaskProgressStatus, TaskStatus, TaskType } from '../types/JobTypeMap';

// Define the 'Task' entity that represents a task in the database
@Entity({ name: 'tasks' })
export class Task {
  // Primary key for the Task entity, UUID type
  @PrimaryGeneratedColumn('uuid')
  taskId!: string;

  // Client identifier for the task, linked to the user or client who owns the task
  @Column()
  clientId!: string;

  // GeoJSON data related to the task, stored as text
  @Column('text')
  geoJson!: string;

  // The status of the task, indicating whether it's queued, in progress, or completed
  @Column()
  status!: TaskStatus;

  // Progress status of the task, nullable, representing the current stage of the task
  @Column({ nullable: true, type: 'text' })
  progress?: TaskProgressStatus | null;

  // Optional resultId referencing the result of the task, nullable
  @Column({ nullable: true })
  resultId?: string;

  // Type of the task, such as 'dataAnalysis', 'polygonArea', etc.
  @Column()
  taskType!: TaskType;

  // Step number representing the sequence of the task in the workflow
  @Column({ default: 1 })
  stepNumber!: number;

  // Many-to-one relationship with the 'Workflow' entity, indicating that each task belongs to a workflow
  @ManyToOne(() => Workflow, workflow => workflow.tasks)
  workflow!: Workflow;

  // Self-referencing many-to-one relationship for tasks that depend on another task (dependency)
  @ManyToOne(() => Task, { nullable: true })
  @JoinColumn({ name: 'dependsOnTaskId' }) 
  dependsOnTask?: Task;

  // ID of the task this task depends on, nullable
  @Column({ nullable: true })
  dependsOnTaskId?: string;
}
