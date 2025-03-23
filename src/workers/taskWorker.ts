import { AppDataSource } from "../data-source";
import { Task } from "../models/Task";
import { TaskRunner } from "./taskRunner";
import { logger } from "../utils/logger";
import { TaskStatus } from "../types/JobTypeMap";

export async function taskWorker() {
  const taskRepository = AppDataSource.getRepository(Task);
  const taskRunner = new TaskRunner(taskRepository);

  logger.info("Task worker started. Polling every 5 seconds...");

  while (true) {
    try {
      const tasks = await taskRepository.find({
        where: { status: TaskStatus.Queued },
        relations: ["workflow", "dependsOnTask"],
        order: { stepNumber: "ASC" }
      });

      const readyTask = tasks.find(
        (task) =>
          !task.dependsOnTask ||
          task.dependsOnTask.status === TaskStatus.Completed
      );

      if (readyTask) {
        logger.info(`Found ready task. Type: ${readyTask.taskType}`, readyTask.taskId);

        try {
          await taskRunner.run(readyTask);
          logger.info("Task completed (or failed). Status updated.", readyTask.taskId);
        } catch (error) {
          logger.handleError(error, "taskWorker", readyTask.taskId);
        }
      } else {
        logger.debug("No ready-to-run tasks found.");
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (err) {
      logger.handleError(err, "taskWorker");
    }
  }
}
