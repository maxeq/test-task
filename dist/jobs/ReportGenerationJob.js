"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGenerationJob = void 0;
const Task_1 = require("../models/Task");
const Result_1 = require("../models/Result");
const taskRunner_1 = require("../workers/taskRunner");
const data_source_1 = require("../data-source");
const logger_1 = require("../utils/logger");
class ReportGenerationJob {
    async run(task) {
        logger_1.logger.info("Generating workflow report...", task.taskId);
        const taskRepository = data_source_1.AppDataSource.getRepository(Task_1.Task);
        const resultRepository = data_source_1.AppDataSource.getRepository(Result_1.Result);
        const workflowId = task.workflow.workflowId;
        const tasks = await taskRepository.find({
            where: { workflow: { workflowId } },
            order: { stepNumber: "ASC" },
        });
        const taskSummaries = [];
        for (const t of tasks) {
            if (!t.resultId) {
                logger_1.logger.warn(`Task ${t.taskId} has no result, skipping...`);
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
        const output = {
            tasks: taskSummaries,
            finalReport: "Aggregated data and results",
        };
        task.status = taskRunner_1.TaskStatus.Completed;
        return {
            input: { workflowId },
            output,
            meta: {
                executedAt: new Date().toISOString(),
                jobName: "reportGeneration",
            },
        };
    }
}
exports.ReportGenerationJob = ReportGenerationJob;
