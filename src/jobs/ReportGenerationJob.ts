import { Job } from "./Job";
import { Task } from "../models/Task";
import { Result } from "../models/Result";
import { JobResult } from "../types/JobResult";
import { AppDataSource } from "../data-source";
import { logger } from "../utils/logger";
import { TaskStatus, TaskType } from "../types/JobTypeMap";
import { Workflow } from "../models/Workflow";
import { AnalysisOutput } from "./DataAnalysisJob";
import { PolygonOutput } from "./PolygonAreaJob";
import { NotificationOutput } from "./EmailNotificationJob";

// Define the input structure for the Report Generation Job
export type ReportInput = {
  workflowId: string; // The unique identifier of the workflow
};

// Define the structure for each task summary in the report
export type TaskSummary = {
  taskId: string;  // The task identifier
  type: string;    // The type of the task
  output: AnalysisOutput | PolygonOutput | ReportOutput | NotificationOutput; 
};

// Define the output structure for the report generation job
export type ReportOutput = {
  tasks: TaskSummary[];  // A list of task summaries
  finalReport: string;    // The final aggregated report string
};

// Define the metadata structure for the report generation job
export type ReportMeta = {
  executedAt: string;  // Timestamp of when the job was executed
  jobName: TaskType.ReportGeneration;  // The name of the job being executed
};

// The ReportGenerationJob implements the Job interface for report generation
export class ReportGenerationJob
  implements Job<ReportInput, ReportOutput, ReportMeta>
{
  // The main method to run the report generation job
  async run(
    task: Task
  ): Promise<JobResult<ReportInput, ReportOutput, ReportMeta>> {
    logger.info("Generating workflow report...", task.taskId);

    try {
      const workflowId = task.workflow.workflowId; // Get the workflow ID from the task

      // Fetch task summaries associated with the workflow
      const taskSummaries = await this.fetchTaskSummaries(workflowId);

      // Create the output for the report using the fetched task summaries
      const output = this.createReportOutput(taskSummaries);

      // Update the workflow with the final result of the report generation
      await this.updateWorkflowWithFinalResult(workflowId, output);

      task.status = TaskStatus.Completed;  // Mark task as completed

      return {
        input: { workflowId },
        output,
        meta: {
          executedAt: new Date().toISOString(),
          jobName: TaskType.ReportGeneration,
        },
      };
    } catch (error: unknown) {
      // Handle error if any occurs during the report generation process
      logger.handleError(error, "ReportGenerationJob", task.taskId);
      task.status = TaskStatus.Failed;  // Mark task as failed if there was an error
      throw error;  // Re-throw the error
    }
  }

  // Fetches task summaries for the report by workflowId
  private async fetchTaskSummaries(workflowId: string): Promise<TaskSummary[]> {
    const taskRepository = AppDataSource.getRepository(Task);
    const resultRepository = AppDataSource.getRepository(Result);

    // Fetch tasks associated with the given workflowId and order them by stepNumber
    const tasks = await taskRepository.find({
      where: { workflow: { workflowId } },
      order: { stepNumber: "ASC" },
    });

    const taskSummaries: TaskSummary[] = [];

    for (const t of tasks) {
      if (!t.resultId) {
        logger.warn(`Task ${t.taskId} has no result, skipping...`);
        continue;  // Skip tasks that don't have results
      }

      // Fetch the result associated with the task
      const result = await resultRepository.findOneBy({ resultId: t.resultId });

      // Add the task summary to the taskSummaries list
      taskSummaries.push({
        taskId: t.taskId,
        type: t.taskType,
        output: result ? JSON.parse(result.data || "{}") : { error: "Missing result" },
      });
    }

    return taskSummaries;  // Return the collected task summaries
  }

  // Creates the final report output from the task summaries
  private createReportOutput(taskSummaries: TaskSummary[]): ReportOutput {
    return {
      tasks: taskSummaries,
      finalReport: "Aggregated data and results", 
    };
  }

  // Updates the workflow with the final result after report generation
  private async updateWorkflowWithFinalResult(
    workflowId: string,
    output: ReportOutput
  ): Promise<void> {
    const workflowRepository = AppDataSource.getRepository(Workflow);
    const workflow = await workflowRepository.findOneBy({ workflowId });

    if (workflow) {
      // Store the final result in the workflow
      workflow.finalResult = JSON.stringify(output);
      await workflowRepository.save(workflow);
      logger.debug("Saved finalResult to workflow", workflowId);  // Log success
    }
  }
}
