// Import necessary modules and types
import { Job } from "./Job";
import { Task } from "../models/Task";
import { logger } from "../utils/logger";
import { JobResult } from "../types/JobResult";
import { TaskStatus, TaskType } from "../types/JobTypeMap";

// Define the input, output, and meta for the email notification job
export type NotificationInput = {
  recipient: string; // The recipient of the email
};

export type NotificationOutput = {
  success: boolean; // Whether the email was successfully sent
  message: string;  // A message about the notification status
};

export type NotificationMeta = {
  executedAt: string; // Timestamp of when the job was executed
  jobName: TaskType.EmailNotification; // The job type (email notification)
};

// Implement the EmailNotificationJob class that will handle the job logic
export class EmailNotificationJob
  implements Job<NotificationInput, NotificationOutput, NotificationMeta>
{
  // The run method that performs the task of sending an email notification
  async run(
    task: Task // The task that the job is associated with
  ): Promise<JobResult<NotificationInput, NotificationOutput, NotificationMeta>> {
    // Log that the email notification job is starting
    logger.info("Sending email notification...", task.taskId);

    // Extract the recipient from the task (this could be a client ID or email)
    const recipient = task.clientId;

    // Simulate sending an email with a timeout (to mimic async behavior)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Log that the email was successfully sent
    logger.info("Email sent successfully!", task.taskId);

    // Update the task status to completed
    task.status = TaskStatus.Completed;

    // Return the job result including the recipient and notification status
    return {
      input: { recipient }, // Input data (recipient of the email)
      output: {
        success: true, // Email sent successfully
        message: "Notification sent successfully", // Message indicating success
      },
      meta: {
        executedAt: new Date().toISOString(), // Timestamp of execution
        jobName: TaskType.EmailNotification, // The job type (Email Notification)
      },
    };
  }
}
