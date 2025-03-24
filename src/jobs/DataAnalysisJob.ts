// Import necessary modules and types
import { Job } from "./Job";
import { Task } from "../models/Task";
import booleanWithin from "@turf/boolean-within"; // Library to check if a geometry is within another geometry
import { Feature, Polygon } from "geojson"; // GeoJSON types for geometric data
import countryMapping from "../data/world_data.json"; // Data file with country geometries
import { JobResult } from "../types/JobResult";
import { logger } from "../utils/logger";
import { TaskStatus, TaskType } from "../types/JobTypeMap";

// Define input, output, and metadata types for the data analysis job
export type AnalysisInput = {
  geoJson: Feature<Polygon>; // The geoJson polygon to analyze
};

export type AnalysisOutput = {
  country: string; // The country where the polygon is located
};

export type AnalysisMeta = {
  executedAt: string; // Timestamp of when the job was executed
  jobName: TaskType.DataAnalysis; // Job type (Data Analysis)
};

// Implementation of the DataAnalysisJob class that processes the analysis task
export class DataAnalysisJob
  implements Job<AnalysisInput, AnalysisOutput, AnalysisMeta>
{
  // The run method executes the data analysis job logic
  async run(
    task: Task // The task that is being processed
  ): Promise<JobResult<AnalysisInput, AnalysisOutput, AnalysisMeta>> {
    logger.info("Running DataAnalysisJob...", task.taskId); // Log the start of the job

    let inputGeometry: Feature<Polygon>; // Define the variable for storing the input polygon geometry

    try {
      // Attempt to parse the geoJson from the task
      inputGeometry = JSON.parse(task.geoJson);
    } catch (err) {
      // Handle errors during GeoJSON parsing
      logger.handleError("Failed to parse geoJson", task.taskId);
      task.status = TaskStatus.Failed; // Mark the task as failed
      return this.createErrorResult(); // Return the error result
    }

    // Iterate through the country data to find which country the polygon is within
    for (const countryFeature of countryMapping.features) {
      if (
        countryFeature.geometry.type === "Polygon" ||
        countryFeature.geometry.type === "MultiPolygon"
      ) {
        // Check if the input polygon is within the current country's polygon
        const isWithin = booleanWithin(
          inputGeometry,
          countryFeature as Feature<Polygon>
        );
        
        if (isWithin) {
          // If the polygon is within a country, return the country name
          const country = countryFeature.properties?.name || "Unknown";
          logger.info(`Polygon is within "${country}"`, task.taskId);
          task.status = TaskStatus.Completed; // Mark task as completed
          return this.createSuccessResult(country, inputGeometry); // Return successful result
        }
      }
    }

    // If no matching country is found, log the warning and return a default response
    logger.warn("No matching country found", task.taskId);
    task.status = TaskStatus.Completed; // Mark task as completed
    return this.createNoCountryFoundResult(inputGeometry); // Return result indicating no country found
  }

  // Helper function to create a successful result
  private createSuccessResult(
    country: string,
    geoJson: Feature<Polygon>
  ): JobResult<AnalysisInput, AnalysisOutput, AnalysisMeta> {
    return {
      input: { geoJson },
      output: { country },
      meta: {
        executedAt: new Date().toISOString(),
        jobName: TaskType.DataAnalysis,
      },
    };
  }

  // Helper function to create an error result (GeoJSON parsing error)
  private createErrorResult(): JobResult<AnalysisInput, AnalysisOutput, AnalysisMeta> {
    return {
      input: { geoJson: null as any },
      output: { country: "Invalid GeoJSON" },
      meta: {
        executedAt: new Date().toISOString(),
        jobName: TaskType.DataAnalysis,
      },
    };
  }

  // Helper function to create a result when no country is found
  private createNoCountryFoundResult(
    geoJson: Feature<Polygon>
  ): JobResult<AnalysisInput, AnalysisOutput, AnalysisMeta> {
    return {
      input: { geoJson },
      output: { country: "No country found" },
      meta: {
        executedAt: new Date().toISOString(),
        jobName: TaskType.DataAnalysis,
      },
    };
  }
}
