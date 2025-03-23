import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Workflow } from "../models/Workflow";
import { logger } from "../utils/logger";

const router = Router();

router.get("/:id/results", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const workflowRepository = AppDataSource.getRepository(Workflow);

  try {
    const workflow = await workflowRepository.findOneBy({ workflowId: id });

    if (!workflow) {
      logger.warn(`Workflow not found with ID: ${id}`);
      res.status(404).json({ error: "Workflow not found" });
      return;
    }

    if (workflow.status !== "completed") {
      logger.warn(`Workflow not completed yet. ID: ${id}`);
      res.status(400).json({ error: "Workflow not completed yet" });
      return;
    }

    logger.info(`Returning results for workflow: ${id}`);
    res.json({
      workflowId: workflow.workflowId,
      status: workflow.status,
      finalResult: workflow.finalResult ? JSON.parse(workflow.finalResult) : null,
    });
  } catch (error: unknown) {
    logger.handleError(error, `WorkflowResults:${id}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
