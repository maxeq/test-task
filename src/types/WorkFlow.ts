import { TaskType } from "./JobTypeMap";

export enum WorkflowStatus {
  Initial = "initial",
  InProgress = "in_progress",
  Completed = "completed",
  Failed = "failed",
}

export interface WorkflowStep {
  taskType: TaskType;
  stepNumber: number;
  dependsOn?: number;
}

export interface WorkflowDefinition {
  name: string;
  steps: WorkflowStep[];
}