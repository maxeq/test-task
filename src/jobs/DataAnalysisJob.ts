import { Job } from "./Job";
import { Task } from "../models/Task";
import booleanWithin from "@turf/boolean-within";
import { Feature, Polygon } from "geojson";
import countryMapping from "../data/world_data.json";
import { JobResult } from "../types/JobResult";
import { logger } from "../utils/logger";
import { TaskStatus, TaskType } from "../types/JobTypeMap";


export type AnalysisInput = {
  geoJson: Feature<Polygon>;
};

export type AnalysisOutput = {
  country: string;
};

export type AnalysisMeta = {
  executedAt: string;
  jobName: TaskType.DataAnalysis;
};

export class DataAnalysisJob
  implements Job<AnalysisInput, AnalysisOutput, AnalysisMeta>
{
  async run(
    task: Task
  ): Promise<JobResult<AnalysisInput, AnalysisOutput, AnalysisMeta>> {
    logger.info("Running DataAnalysisJob...", task.taskId);

    let inputGeometry: Feature<Polygon>;
    try {
      inputGeometry = JSON.parse(task.geoJson);
    } catch (err) {
      logger.handleError("Failed to parse geoJson", task.taskId);
      task.status = TaskStatus.Failed;
      return {
        input: { geoJson: null as any },
        output: { country: "Invalid GeoJSON" },
        meta: {
          executedAt: new Date().toISOString(),
          jobName: TaskType.DataAnalysis,
        },
      };
    }

    for (const countryFeature of countryMapping.features) {
      if (
        countryFeature.geometry.type === "Polygon" ||
        countryFeature.geometry.type === "MultiPolygon"
      ) {
        const isWithin = booleanWithin(
          inputGeometry,
          countryFeature as Feature<Polygon>
        );
        if (isWithin) {
          const country = countryFeature.properties?.name || "Unknown";
          logger.info(`Polygon is within "${country}"`, task.taskId);
          task.status = TaskStatus.Completed;
          return {
            input: { geoJson: inputGeometry },
            output: { country },
            meta: {
              executedAt: new Date().toISOString(),
              jobName: TaskType.DataAnalysis,
            },
          };
        }
      }
    }

    logger.warn("No matching country found", task.taskId);
    task.status = TaskStatus.Completed;
    return {
      input: { geoJson: inputGeometry },
      output: { country: "No country found" },
      meta: {
        executedAt: new Date().toISOString(),
        jobName: TaskType.DataAnalysis,
      },
    };
  }
}
