"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobForTaskType = getJobForTaskType;
const JobTypeMap_1 = require("../types/JobTypeMap");
const DataAnalysisJob_1 = require("./DataAnalysisJob");
const EmailNotificationJob_1 = require("./EmailNotificationJob");
const PolygonAreaJob_1 = require("./PolygonAreaJob");
const ReportGenerationJob_1 = require("./ReportGenerationJob");
const jobMap = {
    [JobTypeMap_1.TaskTypes.Analysis]: () => new DataAnalysisJob_1.DataAnalysisJob(),
    [JobTypeMap_1.TaskTypes.Notification]: () => new EmailNotificationJob_1.EmailNotificationJob(),
    [JobTypeMap_1.TaskTypes.PolygonArea]: () => new PolygonAreaJob_1.PolygonAreaJob(),
    [JobTypeMap_1.TaskTypes.ReportGeneration]: () => new ReportGenerationJob_1.ReportGenerationJob(),
};
function getJobForTaskType(taskType) {
    const jobFactory = jobMap[taskType];
    if (!jobFactory) {
        throw new Error(`No job found for task type: ${taskType}`);
    }
    return jobFactory();
}
