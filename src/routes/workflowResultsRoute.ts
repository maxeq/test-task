import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Workflow } from "../models/Workflow";
import { logger } from "../utils/logger";

// Create a new Express router instance
const router = Router();

// GET endpoint to retrieve the final result of a completed workflow by its ID
router.get("/:id/results", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Get the Workflow repository from the data source (TypeORM)
  const workflowRepository = AppDataSource.getRepository(Workflow);

  try {
    // Attempt to find the workflow by its ID
    const workflow = await workflowRepository.findOneBy({ workflowId: id });

    // If no workflow is found, return a 404 Not Found response
    if (!workflow) {
      logger.warn(`Workflow not found with ID: ${id}`);
      res.status(404).json({ error: "Workflow not found" });
      return;
    }

    // If the workflow is not yet completed, return a 400 Bad Request response
    if (workflow.status !== "completed") {
      logger.warn(`Workflow not completed yet. ID: ${id}`);
      res.status(400).json({ error: "Workflow not completed yet" });
      return;
    }

    // Log success and return the workflow result (parsed from JSON)
    logger.info(`Returning results for workflow: ${id}`);
    res.json({
      workflowId: workflow.workflowId,
      status: workflow.status,
      finalResult: workflow.finalResult ? JSON.parse(workflow.finalResult) : null,
    });
  } catch (error: unknown) {
    // Log and return a 500 Internal Server Error if something goes wrong
    logger.handleError(error, `WorkflowResults:${id}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Export the router to be used in your Express application
export default router;
