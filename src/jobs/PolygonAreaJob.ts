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

    let geoJson;
    try {
      geoJson = JSON.parse(task.geoJson);
    } catch (err) {
      logger.handleError("Failed to parse geoJson", task.taskId);
      task.status = TaskStatus.Failed;
      return {
        input: { geoJson },
        output: { areaSqMeters: 0 },
        meta: {
          executedAt: new Date().toISOString(),
          jobName: TaskType.PolygonArea
        },
      };
    }

    if (!geoJson || geoJson.type !== "Polygon") {
      logger.warn("Invalid GeoJSON: not a polygon", task.taskId);
      task.status = TaskStatus.Failed;
      return {
        input: { geoJson },
        output: { areaSqMeters: 0 },
        meta: {
          executedAt: new Date().toISOString(),
          jobName: TaskType.PolygonArea
        },
      };
    }

    const areaSqMeters = area({
      type: "Feature",
      geometry: geoJson,
      properties: {},
    });

    logger.info(`Calculated area: ${areaSqMeters.toFixed(2)} m²`, task.taskId);

    task.status = TaskStatus.Completed;

    return {
      input: { geoJson },
      output: { areaSqMeters },
      meta: {
        executedAt: new Date().toISOString(),
        jobName: TaskType.PolygonArea
      },
    };
  }
}
