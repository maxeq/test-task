import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Workflow } from "../models/Workflow";
import { Task } from "../models/Task";
import { logger } from "../utils/logger";

const router = Router();

router.get("/:id/status", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const workflowRepository = AppDataSource.getRepository(Workflow);
  const taskRepository = AppDataSource.getRepository(Task);

  try {
    const workflow = await workflowRepository.findOneBy({ workflowId: id });

    if (!workflow) {
      logger.warn(`Workflow not found with ID: ${id}`);
      res.status(404).json({ error: "Workflow not found" });
      return;
    }

    const allTasks = await taskRepository.find({
      where: { workflow: { workflowId: id } },
    });

    const completedTasks = allTasks.filter(t => t.status === "completed").length;

    logger.info(`Retrieved status for workflow: ${id}`);
    res.json({
      workflowId: workflow.workflowId,
      status: workflow.status,
      completedTasks,
      totalTasks: allTasks.length,
    });
  } catch (error: unknown) {
    logger.handleError(error, `WorkflowStatus:${id}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
