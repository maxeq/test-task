import { TaskType } from "../types/JobTypeMap";
import { DataAnalysisJob } from "./DataAnalysisJob";
import { EmailNotificationJob } from "./EmailNotificationJob";
import { PolygonAreaJob } from "./PolygonAreaJob";
import { ReportGenerationJob } from "./ReportGenerationJob";

export function getJobForTaskType(taskType: TaskType) {
  switch (taskType) {
    case TaskType.DataAnalysis:
      return new DataAnalysisJob();
    case TaskType.EmailNotification:
      return new EmailNotificationJob();
    case TaskType.PolygonArea:
      return new PolygonAreaJob();
    case TaskType.ReportGeneration:
      return new ReportGenerationJob();
    default:
      throw new Error(`No job found for task type: ${taskType}`);
  }
}
