import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Task } from "./Task";
import { WorkflowStatus } from "../types/WorkFlow";

// Define the 'Workflow' entity that represents a workflow in the database
@Entity({ name: "workflows" })
export class Workflow {
  // Primary key for the Workflow entity, UUID type
  @PrimaryGeneratedColumn("uuid")
  workflowId!: string;

  // Client identifier for the workflow, linked to the user or client owning the workflow
  @Column()
  clientId!: string;

  // The status of the workflow, with a default value of 'Initial'
  @Column({ default: WorkflowStatus.Initial })
  status!: WorkflowStatus;

  // Optional column for storing the final result of the workflow, if available
  @Column("text", { nullable: true })
  finalResult?: string | null;

  // One-to-many relationship with the Task entity. A workflow can have many tasks associated with it.
  @OneToMany(() => Task, (task) => task.workflow)
  tasks!: Task[];
}
