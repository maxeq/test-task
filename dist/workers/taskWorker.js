"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskWorker = taskWorker;
const data_source_1 = require("../data-source");
const Task_1 = require("../models/Task");
const taskRunner_1 = require("./taskRunner");
const logger_1 = require("../utils/logger");
async function taskWorker() {
    const taskRepository = data_source_1.AppDataSource.getRepository(Task_1.Task);
    const taskRunner = new taskRunner_1.TaskRunner(taskRepository);
    logger_1.logger.info("Task worker started. Polling every 5 seconds...");
    while (true) {
        try {
            const task = await taskRepository.findOne({
                where: { status: taskRunner_1.TaskStatus.Queued },
                relations: ["workflow"],
            });
            if (task) {
                logger_1.logger.info(`Found queued task. Type: ${task.taskType}`, task.taskId);
                try {
                    await taskRunner.run(task);
                    logger_1.logger.info("Task completed (or failed). Status updated.", task.taskId);
                }
                catch (error) {
                    logger_1.logger.error("Task execution failed. TaskRunner already updated status.", task.taskId);
                    logger_1.logger.error(error.stack || String(error), task.taskId);
                }
            }
            else {
                logger_1.logger.debug("No queued tasks found.");
            }
            // wait before next check
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        catch (err) {
            logger_1.logger.error("Unexpected error inside task worker loop");
            logger_1.logger.error(err.stack || String(err));
        }
    }
}
