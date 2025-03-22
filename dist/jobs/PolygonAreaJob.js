"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolygonAreaJob = void 0;
const turf_1 = require("@turf/turf");
const taskRunner_1 = require("../workers/taskRunner");
const logger_1 = require("../utils/logger");
class PolygonAreaJob {
    async run(task) {
        logger_1.logger.info("Running PolygonAreaJob...", task.taskId);
        let geoJson;
        try {
            geoJson = JSON.parse(task.geoJson);
        }
        catch (err) {
            logger_1.logger.error("Failed to parse geoJson", task.taskId);
            task.status = taskRunner_1.TaskStatus.Failed;
            return {
                input: { geoJson },
                output: { areaSqMeters: 0 },
                meta: {
                    executedAt: new Date().toISOString(),
                    jobName: "polygonArea",
                },
            };
        }
        if (!geoJson || geoJson.type !== "Polygon") {
            logger_1.logger.warn("Invalid GeoJSON: not a polygon", task.taskId);
            task.status = taskRunner_1.TaskStatus.Failed;
            return {
                input: { geoJson },
                output: { areaSqMeters: 0 },
                meta: {
                    executedAt: new Date().toISOString(),
                    jobName: "polygonArea",
                },
            };
        }
        const areaSqMeters = (0, turf_1.area)({
            type: "Feature",
            geometry: geoJson,
            properties: {},
        });
        logger_1.logger.info(`Calculated area: ${areaSqMeters.toFixed(2)} m²`, task.taskId);
        task.status = taskRunner_1.TaskStatus.Completed;
        return {
            input: { geoJson },
            output: { areaSqMeters },
            meta: {
                executedAt: new Date().toISOString(),
                jobName: "polygonArea",
            },
        };
    }
}
exports.PolygonAreaJob = PolygonAreaJob;
