import { Job } from "./Job";
import { Task } from "../models/Task";
import { logger } from "../utils/logger";
import { JobResult } from "../types/JobResult";
import { TaskStatus, TaskType } from "../types/JobTypeMap";

export type NotificationInput = {
  recipient: string;
};

export type NotificationOutput = {
  success: boolean;
  message: string;
};

export type NotificationMeta = {
  executedAt: string;
  jobName: TaskType.EmailNotification,
};

export class EmailNotificationJob
  implements Job<NotificationInput, NotificationOutput, NotificationMeta>
{
  async run(
    task: Task
  ): Promise<
    JobResult<NotificationInput, NotificationOutput, NotificationMeta>
  > {
    logger.info("Sending email notification...", task.taskId);

    const recipient = task.clientId;

    await new Promise((resolve) => setTimeout(resolve, 500));

    logger.info("Email sent successfully!", task.taskId);

    task.status = TaskStatus.Completed;

    return {
      input: { recipient },
      output: {
        success: true,
        message: "Notification sent successfully",
      },
      meta: {
        executedAt: new Date().toISOString(),
        jobName: TaskType.EmailNotification,
      },
    };
  }
}
