

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

export enum TaskType {
  ReportGeneration = "reportGeneration",
  PolygonArea = "polygonArea",
  EmailNotification = "emailNotification",
  DataAnalysis = "dataAnalysis",
}

export enum TaskStatus {
  Queued = "queued",
  InProgress = "in_progress",
  Completed = "completed",
  Failed = "failed",
}

export enum TaskProgressStatus {
  StartingJob = "Starting job...",
  ProcessingJob = "Processing job...",
  JobCompleted = "Job completed.",
  JobFailed = "Job failed",
  CompletedSuccessfully = "Completed successfully",
}

export interface JobTypeMap {
  [TaskType.DataAnalysis]: Job<AnalysisInput, AnalysisOutput, AnalysisMeta>;
  [TaskType.EmailNotification]: Job<NotificationInput, NotificationOutput, NotificationMeta>;
  [TaskType.PolygonArea]: Job<PolygonInput, PolygonOutput, PolygonMeta>;
  [TaskType.ReportGeneration]: Job<ReportInput, ReportOutput, ReportMeta>;
}