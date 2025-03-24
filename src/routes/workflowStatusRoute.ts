import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Workflow } from "../models/Workflow";
import { Task } from "../models/Task";
import { logger } from "../utils/logger";

// Create a new Express router instance
const router = Router();

// Define GET endpoint to retrieve the status of a workflow by ID
router.get("/:id/status", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Get repositories for Workflow and Task models from TypeORM
  const workflowRepository = AppDataSource.getRepository(Workflow);
  const taskRepository = AppDataSource.getRepository(Task);

  try {
    // Find the workflow by its ID
    const workflow = await workflowRepository.findOneBy({ workflowId: id });

    // If the workflow doesn't exist, return 404
    if (!workflow) {
      logger.warn(`Workflow not found with ID: ${id}`);
      res.status(404).json({ error: "Workflow not found" });
      return;
    }

    // Fetch all tasks associated with the workflow
    const allTasks = await taskRepository.find({
      where: { workflow: { workflowId: id } },
    });

    // Count how many of the tasks are marked as completed
    const completedTasks = allTasks.filter(t => t.status === "completed").length;

    logger.info(`Retrieved status for workflow: ${id}`);

    // Return workflow status, number of completed tasks, and total tasks
    res.json({
      workflowId: workflow.workflowId,
      status: workflow.status,
      completedTasks,
      totalTasks: allTasks.length,
    });

  } catch (error: unknown) {
    // Handle unexpected errors gracefully and log them
    logger.handleError(error, `WorkflowStatus:${id}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Export the router so it can be used in your Express app
export default router;
