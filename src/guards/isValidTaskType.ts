import { TaskType } from "../types/JobTypeMap";

export function isValidTaskType(taskType: string): taskType is TaskType {
  return Object.values(TaskType).includes(taskType as TaskType);
}