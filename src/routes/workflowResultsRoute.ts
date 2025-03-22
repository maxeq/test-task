import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Workflow } from "../models/Workflow";

const router = Router();

router.get("/:id/results", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const workflowRepository = AppDataSource.getRepository(Workflow);

  try {
    const workflow = await workflowRepository.findOneBy({ workflowId: id });

    if (!workflow) {
      res.status(404).json({ error: "Workflow not found" });
      return;
    }

    if (workflow.status !== "completed") {
      res.status(400).json({ error: "Workflow not completed yet" });
      return;
    }

    res.json({
      workflowId: workflow.workflowId,
      status: workflow.status,
      finalResult: workflow.finalResult ? JSON.parse(workflow.finalResult) : null,
    });
  } catch (error) {
    console.error("Error retrieving workflow results:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
