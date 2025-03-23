import { Job } from "./Job";
import { Task } from "../models/Task";
import { Result } from "../models/Result";
import { JobResult } from "../types/JobResult";
import { AppDataSource } from "../data-source";
import { logger } from "../utils/logger";
import { TaskStatus, TaskType } from "../types/JobTypeMap";

export type ReportInput = {
  workflowId: string;
};

export type TaskSummary = {
  taskId: string;
  type: string;
  output: unknown;
};

export type ReportOutput = {
  tasks: TaskSummary[];
  finalReport: string;
};

export type ReportMeta = {
  executedAt: string;
  jobName: TaskType.ReportGeneration
};

export class ReportGenerationJob
  implements Job<ReportInput, ReportOutput, ReportMeta>
{
  async run(
    task: Task
  ): Promise<JobResult<ReportInput, ReportOutput, ReportMeta>> {
    logger.info("Generating workflow report...", task.taskId);
  
    try {
      const taskRepository = AppDataSource.getRepository(Task);
      const resultRepository = AppDataSource.getRepository(Result);
      const workflowRepository = AppDataSource.getRepository(task.workflow.constructor);
  
      const workflowId = task.workflow.workflowId;
  
      const tasks = await taskRepository.find({
        where: { workflow: { workflowId } },
        order: { stepNumber: "ASC" },
      });
  
      const taskSummaries: TaskSummary[] = [];
  
      for (const t of tasks) {
        if (!t.resultId) {
          logger.warn(`Task ${t.taskId} has no result, skipping...`);
          continue;
        }
  
        const result = await resultRepository.findOneBy({ resultId: t.resultId });
  
        taskSummaries.push({
          taskId: t.taskId,
          type: t.taskType,
          output: result
            ? JSON.parse(result.data || "{}")
            : { error: "Missing result" },
        });
      }
  
      const output: ReportOutput = {
        tasks: taskSummaries,
        finalReport: "Aggregated data and results",
      };
  
      const workflow = await workflowRepository.findOneBy({ workflowId });
      if (workflow) {
        workflow.finalResult = JSON.stringify(output);
        await workflowRepository.save(workflow);
        logger.debug("Saved finalResult to workflow", workflowId);
      }
  
      task.status = TaskStatus.Completed;
  
      return {
        input: { workflowId },
        output,
        meta: {
          executedAt: new Date().toISOString(),
          jobName: TaskType.ReportGeneration,
        },
      };
  
    } catch (error: unknown) {
      logger.handleError(error, "ReportGenerationJob", task.taskId);
      task.status = TaskStatus.Failed;
      throw error;
    }
  }
}  