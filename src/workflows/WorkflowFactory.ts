import * as fs from "fs";
import * as yaml from "js-yaml";
import { DataSource } from "typeorm";
import { Workflow } from "../models/Workflow";
import { Task } from "../models/Task";
import { isValidTaskType } from "../guards/isValidTaskType";
import { WorkflowDefinition, WorkflowStatus } from "../types/WorkFlow";
import { TaskStatus } from "../types/JobTypeMap";
import { logger } from "../utils/logger";

export class WorkflowFactory {
  constructor(private dataSource: DataSource) {}

  /**
   * Creates a workflow by reading a YAML file and constructing the Workflow and Task entities.
   * @param filePath - Path to the YAML file.
   * @param clientId - Client identifier for the workflow.
   * @param geoJson - The geoJson data string for tasks (customize as needed).
   * @returns A promise that resolves to the created Workflow.
   */
  async createWorkflowFromYAML(
    filePath: string,
    clientId: string,
    geoJson: string
  ): Promise<Workflow> {
    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const workflowDef = yaml.load(fileContent) as WorkflowDefinition;
  
      const workflowRepository = this.dataSource.getRepository(Workflow);
      const taskRepository = this.dataSource.getRepository(Task);
  
      const workflow = new Workflow();
      workflow.clientId = clientId;
      workflow.status = WorkflowStatus.Initial;
      const savedWorkflow = await workflowRepository.save(workflow);
  
      const createdTasks: Task[] = [];
  
      for (const step of workflowDef.steps) {
        if (!isValidTaskType(step.taskType)) {
          logger.error(`Invalid task type: ${step.taskType}`);
          throw new Error(`Invalid task type: ${step.taskType}`);
        }
  
        const task = new Task();
        task.clientId = clientId;
        task.geoJson = geoJson;
        task.status = TaskStatus.Queued;
        task.taskType = step.taskType;
        task.stepNumber = step.stepNumber;
        task.workflow = savedWorkflow;
        createdTasks.push(task);
      }
  
      await taskRepository.save(createdTasks);
  
      for (const step of workflowDef.steps) {
        if (step.dependsOn) {
          const currentTask = createdTasks.find(t => t.stepNumber === step.stepNumber);
          const dependsOnTask = createdTasks.find(t => t.stepNumber === step.dependsOn);
          if (currentTask && dependsOnTask) {
            currentTask.dependsOnTask = dependsOnTask;
          }
        }
      }
  
      await taskRepository.save(createdTasks);
  
      return savedWorkflow;
    } catch (error: any) {
      logger.error(`Failed to create workflow from YAML: ${error.message}`);
      throw new Error("Workflow creation failed.");
    }
  }
}  