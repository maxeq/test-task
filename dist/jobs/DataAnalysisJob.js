"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataAnalysisJob = void 0;
const boolean_within_1 = __importDefault(require("@turf/boolean-within"));
const world_data_json_1 = __importDefault(require("../data/world_data.json"));
const taskRunner_1 = require("../workers/taskRunner");
const logger_1 = require("../utils/logger");
class DataAnalysisJob {
    async run(task) {
        logger_1.logger.info("Running DataAnalysisJob...", task.taskId);
        let inputGeometry;
        try {
            inputGeometry = JSON.parse(task.geoJson);
        }
        catch (err) {
            logger_1.logger.error("Failed to parse geoJson", task.taskId);
            task.status = taskRunner_1.TaskStatus.Failed;
            return {
                input: { geoJson: null },
                output: { country: "Invalid GeoJSON" },
                meta: {
                    executedAt: new Date().toISOString(),
                    jobName: "dataAnalysis",
                },
            };
        }
        for (const countryFeature of world_data_json_1.default.features) {
            if (countryFeature.geometry.type === "Polygon" ||
                countryFeature.geometry.type === "MultiPolygon") {
                const isWithin = (0, boolean_within_1.default)(inputGeometry, countryFeature);
                if (isWithin) {
                    const country = countryFeature.properties?.name || "Unknown";
                    logger_1.logger.info(`Polygon is within "${country}"`, task.taskId);
                    task.status = taskRunner_1.TaskStatus.Completed;
                    return {
                        input: { geoJson: inputGeometry },
                        output: { country },
                        meta: {
                            executedAt: new Date().toISOString(),
                            jobName: "dataAnalysis",
                        },
                    };
                }
            }
        }
        logger_1.logger.warn("No matching country found", task.taskId);
        task.status = taskRunner_1.TaskStatus.Completed;
        return {
            input: { geoJson: inputGeometry },
            output: { country: "No country found" },
            meta: {
                executedAt: new Date().toISOString(),
                jobName: "dataAnalysis",
            },
        };
    }
}
exports.DataAnalysisJob = DataAnalysisJob;
