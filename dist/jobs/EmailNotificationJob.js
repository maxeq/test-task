"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailNotificationJob = void 0;
const logger_1 = require("../utils/logger");
const taskRunner_1 = require("../workers/taskRunner");
class EmailNotificationJob {
    async run(task) {
        logger_1.logger.info("Sending email notification...", task.taskId);
        const recipient = task.clientId;
        await new Promise((resolve) => setTimeout(resolve, 500));
        logger_1.logger.info("Email sent successfully!", task.taskId);
        task.status = taskRunner_1.TaskStatus.Completed;
        return {
            input: { recipient },
            output: {
                success: true,
                message: "Notification sent successfully",
            },
            meta: {
                executedAt: new Date().toISOString(),
                jobName: "emailNotification",
            },
        };
    }
}
exports.EmailNotificationJob = EmailNotificationJob;
