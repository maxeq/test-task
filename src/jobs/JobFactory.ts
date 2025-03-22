import { JobTypeMap, TaskType } from "../types/JobTypeMap";
import { DataAnalysisJob } from "./DataAnalysisJob";
import { EmailNotificationJob } from "./EmailNotificationJob";
import { PolygonAreaJob } from "./PolygonAreaJob";
import { ReportGenerationJob } from "./ReportGenerationJob";

const jobMap: {
  [K in TaskType]: () => JobTypeMap[K];
} = {
  [TaskType.DataAnalysis]: () => new DataAnalysisJob(),
  [TaskType.EmailNotification]: () => new EmailNotificationJob(),
  [TaskType.PolygonArea]: () => new PolygonAreaJob(),
  [TaskType.ReportGeneration]: () => new ReportGenerationJob(),
};

export function getJobForTaskType<T extends TaskType>(
  taskType: T
): JobTypeMap[T] {
  const jobFactory = jobMap[taskType];
  if (!jobFactory) {
    throw new Error(`No job found for task type: ${taskType}`);
  }
  return jobFactory();
}
