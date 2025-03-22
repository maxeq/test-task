import { Job } from "../jobs/Job";
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

export interface JobTypeMap {
  [TaskType.DataAnalysis]: Job<AnalysisInput, AnalysisOutput, AnalysisMeta>;
  [TaskType.EmailNotification]: Job<NotificationInput, NotificationOutput, NotificationMeta>;
  [TaskType.PolygonArea]: Job<PolygonInput, PolygonOutput, PolygonMeta>;
  [TaskType.ReportGeneration]: Job<ReportInput, ReportOutput, ReportMeta>;
}