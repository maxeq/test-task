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
   * Creates a workflow and corresponding tasks from a YAML file.
   * @param filePath - Path to the YAML definition file.
   * @param clientId - Unique identifier for the client.
   * @param geoJson - GeoJSON data used by the tasks.
   * @returns The created workflow entity.
   */
  async createWorkflowFromYAML(
    filePath: string,
    clientId: string,
    geoJson: string
  ): Promise<Workflow> {
    try {
      // Parse and load the YAML workflow definition
      const workflowDef = this.loadWorkflowDefinition(filePath);

      // Create the workflow entry in the database
      const savedWorkflow = await this.createWorkflow(clientId);

      // Create task instances based on YAML definition
      const createdTasks = this.constructTasksFromDefinition(workflowDef, clientId, geoJson, savedWorkflow);
      await this.saveTasks(createdTasks); // Save tasks without dependencies first

      // Set dependencies between tasks (if any) and save again
      this.linkTaskDependencies(workflowDef, createdTasks);
      await this.saveTasks(createdTasks); // Save updated tasks with dependencies

      return savedWorkflow;
    } catch (error: unknown) {
      logger.handleError(error, "WorkflowFactory");
      throw error;
    }
  }

  /**
   * Reads and parses the YAML file from the file system.
   */
  private loadWorkflowDefinition(filePath: string): WorkflowDefinition {
    const fileContent = fs.readFileSync(filePath, "utf8");
    return yaml.load(fileContent) as WorkflowDefinition;
  }

  /**
   * Creates and saves a new Workflow entity.
   */
  private async createWorkflow(clientId: string): Promise<Workflow> {
    const workflowRepository = this.dataSource.getRepository(Workflow);
    const workflow = new Workflow();
    workflow.clientId = clientId;
    workflow.status = WorkflowStatus.Initial;
    return await workflowRepository.save(workflow);
  }

  /**
   * Converts YAML steps into Task entities linked to a workflow.
   */
  private constructTasksFromDefinition(
    workflowDef: WorkflowDefinition,
    clientId: string,
    geoJson: string,
    workflow: Workflow
  ): Task[] {
    return workflowDef.steps.map(step => {
      if (!isValidTaskType(step.taskType)) {
        throw new Error(`Invalid task type: ${step.taskType}`);
      }

      const task = new Task();
      task.clientId = clientId;
      task.geoJson = geoJson;
      task.status = TaskStatus.Queued;
      task.taskType = step.taskType;
      task.stepNumber = step.stepNumber;
      task.workflow = workflow;
      return task;
    });
  }

  /**
   * Links task dependencies based on the YAML `dependsOn` values.
   */
  private linkTaskDependencies(workflowDef: WorkflowDefinition, tasks: Task[]): void {
    for (const step of workflowDef.steps) {
      if (step.dependsOn) {
        const current = tasks.find(t => t.stepNumber === step.stepNumber);
        const dependency = tasks.find(t => t.stepNumber === step.dependsOn);
        if (current && dependency) {
          current.dependsOnTask = dependency;
        }
      }
    }
  }

  /**
   * Saves the list of Task entities into the database.
   */
  private async saveTasks(tasks: Task[]) {
    const taskRepository = this.dataSource.getRepository(Task);
    await taskRepository.save(tasks);
  }
}
