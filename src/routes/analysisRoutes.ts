import { Router } from "express";
import { AppDataSource } from "../data-source";
import { WorkflowFactory } from "../workflows/WorkflowFactory";
import path from "path";
import { logger } from "../utils/logger";

// Create a new Express router
const router = Router();

// Instantiate the WorkflowFactory with the database connection
const workflowFactory = new WorkflowFactory(AppDataSource);

// POST endpoint to create a new workflow from a YAML definition
router.post("/", async (req, res) => {
  const { clientId, geoJson } = req.body;

  // Define the path to the YAML file that contains the workflow definition
  const workflowFile = path.join(__dirname, "../workflows/example_workflow.yml");

  try {
    // Use the WorkflowFactory to create a new workflow based on the YAML definition
    const workflow = await workflowFactory.createWorkflowFromYAML(
      workflowFile,
      clientId,
      JSON.stringify(geoJson) // Ensure geoJson is serialized
    );

    // Log the created workflow's ID
    logger.info(`Workflow created with ID: ${workflow.workflowId}`, workflow.workflowId);

    // Return the workflow ID and confirmation message
    res.status(202).json({
      workflowId: workflow.workflowId,
      message: "Workflow created and tasks queued from YAML definition.",
    });
  } catch (error: unknown) {
    // Log the error with context and return a 500 Internal Server Error
    logger.handleError(error, "AnalysisRoutes", req.body.clientId);
    res.status(500).json({ message: "Failed to create workflow" });
  }
});

// Export the router so it can be used in the main Express app
export default router;
