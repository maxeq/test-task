"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskRunner = exports.TaskStatus = void 0;
const JobFactory_1 = require("../jobs/JobFactory");
const WorkflowFactory_1 = require("../workflows/WorkflowFactory");
const Workflow_1 = require("../models/Workflow");
const Result_1 = require("../models/Result");
const logger_1 = require("../utils/logger");
const JobTypeMap_1 = require("../types/JobTypeMap");
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["Queued"] = "queued";
    TaskStatus["InProgress"] = "in_progress";
    TaskStatus["Completed"] = "completed";
    TaskStatus["Failed"] = "failed";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
function isTaskType(value) {
    return Object.values(JobTypeMap_1.TaskTypes).includes(value);
}
class TaskRunner {
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }
    /**
     * Runs the appropriate job based on the task's type, managing the task's status.
     * @param task - The task entity that determines which job to run.
     * @throws If the job fails, it rethrows the error.
     */
    async run(task) {
        task.status = TaskStatus.InProgress;
        task.progress = "starting job...";
        await this.taskRepository.save(task);
        logger_1.logger.info(`Running task type "${task.taskType}"`, task.taskId);
        if (!isTaskType(task.taskType)) {
            logger_1.logger.error(`Unknown task type "${task.taskType}"`, task.taskId);
            task.status = TaskStatus.Failed;
            task.progress = "Invalid task type";
            await this.taskRepository.save(task);
            return;
        }
        const job = (0, JobFactory_1.getJobForTaskType)(task.taskType);
        try {
            const resultRepository = this.taskRepository.manager.getRepository(Result_1.Result);
            const taskResult = await job.run(task);
            logger_1.logger.info(`Job "${task.taskType}" completed`, task.taskId);
            const result = new Result_1.Result();
            result.taskId = task.taskId;
            result.data = JSON.stringify(taskResult || {});
            await resultRepository.save(result);
            task.resultId = result.resultId;
            task.status = TaskStatus.Completed;
            task.progress = null;
            await this.taskRepository.save(task);
            logger_1.logger.debug("Task marked as completed and result saved", task.taskId);
        }
        catch (error) {
            logger_1.logger.error(`Error in job "${task.taskType}": ${error.message}`, task.taskId);
            task.status = TaskStatus.Failed;
            task.progress = null;
            await this.taskRepository.save(task);
            throw error;
        }
        const workflowRepository = this.taskRepository.manager.getRepository(Workflow_1.Workflow);
        const currentWorkflow = await workflowRepository.findOne({
            where: { workflowId: task.workflow.workflowId },
            relations: ["tasks"],
        });
        if (currentWorkflow) {
            const allCompleted = currentWorkflow.tasks.every((t) => t.status === TaskStatus.Completed);
            const anyFailed = currentWorkflow.tasks.some((t) => t.status === TaskStatus.Failed);
            if (anyFailed) {
                currentWorkflow.status = WorkflowFactory_1.WorkflowStatus.Failed;
                logger_1.logger.warn("Workflow marked as failed due to task failure", task.taskId);
            }
            else if (allCompleted) {
                currentWorkflow.status = WorkflowFactory_1.WorkflowStatus.Completed;
                logger_1.logger.info("Workflow completed successfully", task.taskId);
            }
            else {
                currentWorkflow.status = WorkflowFactory_1.WorkflowStatus.InProgress;
                logger_1.logger.debug("Workflow still in progress", task.taskId);
            }
            await workflowRepository.save(currentWorkflow);
        }
    }
}
exports.TaskRunner = TaskRunner;
