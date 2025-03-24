import { Repository } from "typeorm";
import { Task } from "../models/Task";
import { getJobForTaskType } from "../jobs/JobFactory";
import { Workflow } from "../models/Workflow";
import { Result } from "../models/Result";
import { logger } from "../utils/logger";
import { TaskProgressStatus, TaskStatus, TaskType } from "../types/JobTypeMap";
import { WorkflowStatus } from "../types/WorkFlow";

// The TaskRunner is responsible for executing a single task and updating its workflow status
export class TaskRunner {
  constructor(private taskRepository: Repository<Task>) {}

  // Runs the task: updates its status, executes the job, and updates the workflow
  async run(task: Task): Promise<void> {
    // Set task to "in progress" before execution
    task.status = TaskStatus.InProgress;
    task.progress = TaskProgressStatus.ProcessingJob;
    await this.taskRepository.save(task);

    logger.info(`Running task type "${task.taskType}"`, task.taskId);

    try {
      await this.executeJob(task);               // Execute the actual job
      await this.updateWorkflowStatus(task);     // Update workflow status after job execution
    } catch (error: unknown) {
      // On error, mark task as failed and log the error
      task.status = TaskStatus.Failed;
      task.progress = TaskProgressStatus.JobFailed;
      await this.taskRepository.save(task);
      logger.handleError(error, `TaskRunner:${task.taskType}`, task.taskId);
      throw error;
    }
  }

  // Executes the job for the given task and saves the result
  private async executeJob(task: Task): Promise<void> {
    const resultRepository = this.taskRepository.manager.getRepository(Result);
    const job = getJobForTaskType(task.taskType);
    const taskResult = await job.run(task);

    logger.info(`Job "${task.taskType}" completed`, task.taskId);
    logger.debug(`Saving result: ${JSON.stringify(taskResult)}`, task.taskId);

    // Save result to the database
    const result = new Result();
    result.taskId = task.taskId!;
    result.data = JSON.stringify(taskResult || {});
    await resultRepository.save(result);

    // Mark task as completed
    task.resultId = result.resultId!;
    task.status = TaskStatus.Completed;
    task.progress = TaskProgressStatus.JobCompleted;
    await this.taskRepository.save(task);

    logger.debug("Task marked as completed and result saved", task.taskId);
  }

  // Updates the workflow status depending on the state of all its tasks
  private async updateWorkflowStatus(task: Task): Promise<void> {
    const workflowRepository = this.taskRepository.manager.getRepository(Workflow);
    const currentWorkflow = await workflowRepository.findOne({
      where: { workflowId: task.workflow.workflowId },
      relations: ["tasks"] // Load related tasks for evaluation
    });

    if (!currentWorkflow) return;

    const allCompleted = currentWorkflow.tasks.every(t => t.status === TaskStatus.Completed);
    const anyFailed = currentWorkflow.tasks.some(t => t.status === TaskStatus.Failed);

    if (anyFailed) {
      // If any task failed, mark workflow as failed
      currentWorkflow.status = WorkflowStatus.Failed;
      logger.warn("Workflow marked as failed due to task failure", task.taskId);
    } else if (allCompleted) {
      // If all tasks completed, mark workflow as completed and optionally attach final result
      currentWorkflow.status = WorkflowStatus.Completed;
      logger.info("Workflow completed successfully", task.taskId);

      // If there is a reportGeneration task, extract its result as final report
      const reportTask = currentWorkflow.tasks.find(
        t => t.taskType === TaskType.ReportGeneration && t.resultId
      );
      if (reportTask) {
        const resultRepository = this.taskRepository.manager.getRepository(Result);
        const finalResult = await resultRepository.findOneBy({ resultId: reportTask.resultId });
        currentWorkflow.finalResult = finalResult?.data || null;
      }
    } else {
      // If some tasks are still running, keep workflow in progress
      currentWorkflow.status = WorkflowStatus.InProgress;
      logger.debug("Workflow still in progress", task.taskId);
    }

    await workflowRepository.save(currentWorkflow);
  }
}
