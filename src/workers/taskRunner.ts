import { Repository } from "typeorm";
import { Task } from "../models/Task";
import { getJobForTaskType } from "../jobs/JobFactory";
import { Workflow } from "../models/Workflow";
import { Result } from "../models/Result";
import { logger } from "../utils/logger";
import { TaskProgressStatus, TaskStatus, TaskType } from "../types/JobTypeMap";
import { WorkflowStatus } from "../types/WorkFlow";

export class TaskRunner {
  constructor(private taskRepository: Repository<Task>) {}

  async run(task: Task): Promise<void> {
    task.status = TaskStatus.InProgress;
    task.progress = TaskProgressStatus.ProcessingJob;
    await this.taskRepository.save(task);

    logger.info(`Running task type "${task.taskType}"`, task.taskId);

    const job = getJobForTaskType(task.taskType);

    try {
      const resultRepository = this.taskRepository.manager.getRepository(Result);
      const taskResult = await job.run(task);

      task.progress = TaskProgressStatus.JobCompleted;
      logger.info(`Job "${task.taskType}" completed`, task.taskId);
      logger.debug(`Saving result: ${JSON.stringify(taskResult)}`, task.taskId);

      const result = new Result();
      result.taskId = task.taskId!;
      result.data = JSON.stringify(taskResult || {});
      await resultRepository.save(result);

      task.resultId = result.resultId!;
      task.status = TaskStatus.Completed;
      task.progress = TaskProgressStatus.JobCompleted;
      await this.taskRepository.save(task);

      logger.debug("Task marked as completed and result saved", task.taskId);
    } catch (error: unknown) {
      task.status = TaskStatus.Failed;
      task.progress = TaskProgressStatus.JobFailed;
      await this.taskRepository.save(task);
      logger.handleError(error, `TaskRunner:${task.taskType}`, task.taskId);
      throw error;
    }

    const workflowRepository = this.taskRepository.manager.getRepository(Workflow);
    const currentWorkflow = await workflowRepository.findOne({
      where: { workflowId: task.workflow.workflowId },
      relations: ["tasks"]
    });

    if (currentWorkflow) {
      const allCompleted = currentWorkflow.tasks.every(t => t.status === TaskStatus.Completed);
      const anyFailed = currentWorkflow.tasks.some(t => t.status === TaskStatus.Failed);

      if (anyFailed) {
        currentWorkflow.status = WorkflowStatus.Failed;
        logger.warn("Workflow marked as failed due to task failure", task.taskId);
      } else if (allCompleted) {
        currentWorkflow.status = WorkflowStatus.Completed;
        logger.info("Workflow completed successfully", task.taskId);

        const reportTask = currentWorkflow.tasks.find(
          t => t.taskType === TaskType.ReportGeneration && t.resultId
        );
        if (reportTask) {
          const resultRepository = this.taskRepository.manager.getRepository(Result);
          const finalResult = await resultRepository.findOneBy({ resultId: reportTask.resultId });
          currentWorkflow.finalResult = finalResult?.data || null;
        }
      } else {
        currentWorkflow.status = WorkflowStatus.InProgress;
        logger.debug("Workflow still in progress", task.taskId);
      }

      await workflowRepository.save(currentWorkflow);
    }
  }
}
