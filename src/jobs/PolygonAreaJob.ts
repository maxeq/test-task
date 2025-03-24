import { Job } from "./Job";
import { Task } from "../models/Task";
import { area } from "@turf/turf";
import { JobResult } from "../types/JobResult";
import { logger } from "../utils/logger";
import { TaskStatus, TaskType } from "../types/JobTypeMap";

export type PolygonInput = {
  geoJson: {
    type: "Polygon";
    coordinates: number[][][];
  };
};

export type PolygonOutput = {
  areaSqMeters: number;
};

export type PolygonMeta = {
  executedAt: string;
  jobName: TaskType.PolygonArea;
};

export class PolygonAreaJob
  implements Job<PolygonInput, PolygonOutput, PolygonMeta>
{
  async run(
    task: Task
  ): Promise<JobResult<PolygonInput, PolygonOutput, PolygonMeta>> {
    logger.info("Running PolygonAreaJob...", task.taskId);

    // Step 1: Parse GeoJSON
    let geoJson;
    try {
      geoJson = this.parseGeoJson(task.geoJson);
    } catch (err) {
      return this.handleGeoJsonError(task, geoJson, "Failed to parse geoJson");
    }

    // Step 2: Validate GeoJSON type
    if (!this.isValidPolygon(geoJson)) {
      return this.handleGeoJsonError(task, geoJson, "Invalid GeoJSON: not a polygon");
    }

    // Step 3: Calculate area
    const areaSqMeters = this.calculateArea(geoJson);

    logger.info(`Calculated area: ${areaSqMeters.toFixed(2)} m²`, task.taskId);

    // Step 4: Mark task as completed
    task.status = TaskStatus.Completed;

    return this.createJobResult(geoJson, areaSqMeters);
  }

  /**
   * Parse the GeoJSON string into an object.
   * @param geoJsonString - GeoJSON as a string
   * @returns Parsed GeoJSON object
   */
  private parseGeoJson(geoJsonString: string) {
    return JSON.parse(geoJsonString);
  }

  /**
   * Check if the GeoJSON is valid and represents a polygon.
   * @param geoJson - GeoJSON object
   * @returns boolean indicating if the GeoJSON is a polygon
   */
  private isValidPolygon(geoJson: any): boolean {
    return geoJson && geoJson.type === "Polygon";
  }

  /**
   * Handle errors when GeoJSON is invalid or cannot be parsed.
   * @param task - The task being processed
   * @param geoJson - The GeoJSON that was being processed
   * @param errorMessage - The error message to log
   * @returns The job result with failure status
   */
  private handleGeoJsonError(
    task: Task,
    geoJson: any,
    errorMessage: string
  ): JobResult<PolygonInput, PolygonOutput, PolygonMeta> {
    logger.handleError(errorMessage, task.taskId);
    task.status = TaskStatus.Failed;
    return {
      input: { geoJson },
      output: { areaSqMeters: 0 },
      meta: {
        executedAt: new Date().toISOString(),
        jobName: TaskType.PolygonArea,
      },
    };
  }

  /**
   * Calculate the area of a polygon from GeoJSON.
   * @param geoJson - The GeoJSON object representing a polygon
   * @returns The area in square meters
   */
  private calculateArea(geoJson: any): number {
    return area({
      type: "Feature",
      geometry: geoJson,
      properties: {},
    });
  }

  /**
   * Create the job result for the PolygonAreaJob.
   * @param geoJson - The input GeoJSON
   * @param areaSqMeters - The calculated area in square meters
   * @param task - The task associated with the job
   * @returns The result of the job with input, output, and metadata
   */
  private createJobResult(
    geoJson: any,
    areaSqMeters: number,
  ): JobResult<PolygonInput, PolygonOutput, PolygonMeta> {
    return {
      input: { geoJson },
      output: { areaSqMeters },
      meta: {
        executedAt: new Date().toISOString(),
        jobName: TaskType.PolygonArea,
      },
    };
  }
}  