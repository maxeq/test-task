
# Backend Coding Challenge

## Project Overview

This backend project manages workflows with interdependent tasks. It executes jobs like polygon area calculation, email notifications, data analysis, and report generation. It supports workflow definitions via YAML and executes tasks in order based on dependencies.

---

## Features

- **PolygonAreaJob** – Calculates area of a polygon using Turf.js.
- **DataAnalysisJob** – Analyzes GeoJSON data and determines which country it belongs to.
- **EmailNotificationJob** – Simulates sending an email notification.
- **ReportGenerationJob** – Aggregates results of all tasks into a final report.
- **Workflow Dependencies** – Tasks only start when all dependencies are completed.
- **Workflow Final Result** – Stored in `finalResult` field and available through API.

---

## API Endpoints

### Create a Workflow
**POST** `/workflow`

**Request Body**
   ```bash
   curl -X POST http://localhost:3000/analysis \
   -H "Content-Type: application/json" \
   -d '{
    "clientId": "client123",
    "geoJson": {
        "type": "Polygon",
        "coordinates": [
            [
                [
                    -63.624885020050996,
                    -10.311050368263523
                ],
                [
                    -63.624885020050996,
                    -10.367865108370523
                ],
                [
                    -63.61278302732815,
                    -10.367865108370523
                ],
                [
                    -63.61278302732815,
                    -10.311050368263523
                ],
                [
                    -63.624885020050996,
                    -10.311050368263523
                ]
            ]
        ]
    }
    }'
   ```
**Expected Response:**
```json
{
  "workflowId": "abc123",
  "message": "Workflow created and tasks queued from YAML definition."
}
```
---

### Get Workflow Status
**GET** `/workflow/:id/status`

```bash
   curl -X GET http://localhost:3000/workflow/3433c76d-f226-4c91-afb5-7dfc7accab24/results
   ```

**Response**
```json
{
  "workflowId": "workflow-id",
  "status": "in_progress",
  "completedTasks": 2,
  "totalTasks": 4
}
```

---

### Get Workflow Results
**GET** `/workflow/:id/results`

```bash
   curl -X GET http://localhost:3000/workflow/3433c76d-f226-4c91-afb5-7dfc7accab24/results
   ```
   
**Example Response**
```json
{
  "workflowId": "3433c76d-f226-4c91-afb5-7dfc7accab24",
  "status": "completed",
  "finalResult": {
    "tasks": [
      {
        "taskId": "6b4e...",
        "type": "dataAnalysis",
        "output": {
          "country": "Spain"
        }
      },
      {
        "taskId": "a7f2...",
        "type": "polygonArea",
        "output": {
          "areaSqMeters": 457829.23
        }
      }
    ],
    "finalReport": "Aggregated data and results"
  }
}
```

---

## Example YAML Workflow

```yaml
name: "example_workflow"
steps:
  - stepNumber: 1
    taskType: "dataAnalysis"
  - stepNumber: 2
    taskType: "emailNotification"
    dependsOn: 1
  - stepNumber: 3
    taskType: "polygonArea"
    dependsOn: 1
  - stepNumber: 4
    taskType: "reportGeneration"
    dependsOn: 2
```

---
## Testing

Use Postman or any REST client to hit the endpoints. You can create a new workflow, monitor its progress, and fetch final results.

📌 Note: If the workflow is not yet completed, the API will return a 400 error. If the workflow ID does not exist, it will return a 404.

---

## License

MIT
