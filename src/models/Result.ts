import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

// Define the 'Result' entity that represents a result associated with a task
@Entity({ name: "results" })
export class Result {
  // Primary key for the Result entity, UUID type
  @PrimaryGeneratedColumn("uuid")
  resultId!: string;

  // Foreign key that links the result to a specific task
  @Column()
  taskId!: string;

  // The data associated with the result, stored as text. 
  // Could be JSON or any serialized format depending on the task's result.
  @Column("text")
  data!: string | null; // Can be null if no data is present
}
