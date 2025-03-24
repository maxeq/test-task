// Import input, output, and metadata types for each job implementation
import {
  AnalysisInput,
  AnalysisMeta,
  AnalysisOutput,
} from "../jobs/DataAnalysisJob";

import {
  NotificationInput,
  NotificationOutput,
  NotificationMeta,
} from "../jobs/EmailNotificationJob";

import { Job } from "../jobs/Job";

import {
  PolygonInput,
  PolygonOutput,
  PolygonMeta,
} from "../jobs/PolygonAreaJob";

import {
  ReportInput,
  ReportMeta,
  ReportOutput,
} from "../jobs/ReportGenerationJob";

// Enum defining all supported task/job types
export enum TaskType {
  ReportGeneration = "reportGeneration",
  PolygonArea = "polygonArea",
  EmailNotification = "emailNotification",
  DataAnalysis = "dataAnalysis",
}

// Enum representing the current status of a task
export enum TaskStatus {
  Queued = "queued",             // Task is waiting to be processed
  InProgress = "in_progress",    // Task is currently running
  Completed = "completed",       // Task has completed successfully
  Failed = "failed",             // Task has failed
}

// Enum representing more detailed progress messages for a task
export enum TaskProgressStatus {
  StartingJob = "Starting job...",                 // Job is about to begin
  ProcessingJob = "Processing job...",             // Job is currently running
  JobCompleted = "Job completed.",                 // Job logic finished
  JobFailed = "Job failed",                        // Job encountered an error
  CompletedSuccessfully = "Completed successfully" // Final confirmation
}

// A mapping of each TaskType to its corresponding Job interface,
// specifying expected input, output, and metadata types.
// This allows type-safe access to job logic by task type.
export interface JobTypeMap {
  [TaskType.DataAnalysis]: Job<AnalysisInput, AnalysisOutput, AnalysisMeta>;
  [TaskType.EmailNotification]: Job<NotificationInput, NotificationOutput, NotificationMeta>;
  [TaskType.PolygonArea]: Job<PolygonInput, PolygonOutput, PolygonMeta>;
  [TaskType.ReportGeneration]: Job<ReportInput, ReportOutput, ReportMeta>;
}
