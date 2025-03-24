import { AppDataSource } from "../data-source";
import { Task } from "../models/Task";
import { TaskRunner } from "./taskRunner";
import { logger } from "../utils/logger";
import { TaskStatus } from "../types/JobTypeMap";
import { Repository } from "typeorm";

// Main worker function that continuously polls for ready-to-run tasks
export async function taskWorker() {
  const taskRepository: Repository<Task> = AppDataSource.getRepository(Task);
  const taskRunner = new TaskRunner(taskRepository);

  logger.info("Task worker started. Polling every 5 seconds...");

  while (true) {
    try {
      // Try to find the next task that is ready to run
      const readyTask = await findReadyTask(taskRepository);

      if (readyTask) {
        logger.info(`Found ready task. Type: ${readyTask.taskType}`, readyTask.taskId);
        // Run the task safely and handle its status
        await runTaskSafely(taskRunner, readyTask);
      } else {
        logger.debug("No ready-to-run tasks found.");
      }

      // Wait for 5 seconds before polling again
      await delay(5000);
    } catch (err) {
      // Catch unexpected errors in the worker loop
      logger.handleError(err, "taskWorker");
    }
  }
}

// Fetches the next task that is in queued state and ready to run (i.e. its dependencies are satisfied)
async function findReadyTask(taskRepository: Repository<Task>): Promise<Task | undefined> {
  const tasks = await taskRepository.find({
    where: { status: TaskStatus.Queued },
    relations: ["workflow", "dependsOnTask"],
    order: { stepNumber: "ASC" },
  });

  // Return the first task that has no dependency or its dependency is already completed
  return tasks.find(
    (task) => !task.dependsOnTask || task.dependsOnTask.status === TaskStatus.Completed
  );
}

// Runs a given task and safely handles any exceptions thrown during execution
async function runTaskSafely(taskRunner: TaskRunner, task: Task) {
  try {
    await taskRunner.run(task);
    logger.info("Task completed (or failed). Status updated.", task.taskId);
  } catch (error) {
    logger.handleError(error, "taskWorker", task.taskId);
  }
}

// Utility function to pause execution for a given duration
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
