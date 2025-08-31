// Auto-generated seed file from current database state
// Generated on: 2025-08-31T12:02:15.780Z
// This file contains the exact replica of the current database

const seedData = {
  "auditlogs": [
    {
      "_id": "68b1ac6d83002d97995648ad",
      "actor": "68b1ac6a83002d979956478f",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d979956478f",
      "before": null,
      "after": null,
      "metadata": {
        "loginMethod": "email_password",
        "deviceType": "desktop",
        "browser": "Chrome"
      },
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "timestamp": "2025-08-29T13:34:37.737Z",
      "riskLevel": "low",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2026-08-29T13:34:37.738Z",
      "description": "User logged in user 68b1ac6a83002d979956478f"
    },
    {
      "_id": "68b1ac6d83002d97995648af",
      "actor": "68b1ac6a83002d9799564808",
      "action": "create",
      "entityType": "Candidate",
      "entityId": "68b1ac6b83002d979956482e",
      "before": null,
      "after": {
        "status": "active",
        "rating": 4.8,
        "tags": [
          "Senior",
          "Full-Stack",
          "React"
        ]
      },
      "metadata": {
        "source": "manual_entry",
        "recruitmentChannel": "linkedin"
      },
      "ipAddress": "10.0.0.50",
      "timestamp": "2025-08-29T13:34:37.762Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2026-08-29T13:34:37.762Z",
      "description": "User created candidate 68b1ac6b83002d979956482e"
    },
    {
      "_id": "68b1ac6d83002d97995648b1",
      "actor": "68b1ac6a83002d97995647b4",
      "action": "create",
      "entityType": "Job",
      "entityId": "68b1ac6b83002d9799564837",
      "before": null,
      "after": {
        "title": "Senior React Developer",
        "status": "open",
        "urgency": "high"
      },
      "metadata": {
        "companyId": "68b1ac6b83002d9799564827",
        "approvalRequired": false
      },
      "ipAddress": "172.16.0.25",
      "timestamp": "2025-08-29T13:34:37.785Z",
      "riskLevel": "medium",
      "businessProcess": "job_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T13:34:37.786Z",
      "description": "User created job 68b1ac6b83002d9799564837"
    },
    {
      "_id": "68b1ac6d83002d97995648b3",
      "actor": "68b1ac6b83002d9799564820",
      "action": "create",
      "entityType": "Application",
      "entityId": "68b1ac6c83002d979956484e",
      "before": null,
      "after": {
        "status": "submitted",
        "stage": "applied"
      },
      "metadata": {
        "applicationSource": "direct_apply",
        "resumeUploaded": true
      },
      "ipAddress": "203.0.113.42",
      "timestamp": "2025-08-29T13:34:37.808Z",
      "riskLevel": "low",
      "businessProcess": "application_processing",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2026-08-29T13:34:37.809Z",
      "description": "User created application 68b1ac6c83002d979956484e"
    },
    {
      "_id": "68b1ac6d83002d97995648b5",
      "actor": "68b1ac6b83002d9799564820",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6b83002d9799564820",
      "before": null,
      "after": null,
      "metadata": {
        "loginMethod": "email_password",
        "failureReason": "invalid_password",
        "attemptCount": 1
      },
      "ipAddress": "198.51.100.15",
      "timestamp": "2025-08-29T13:34:37.832Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": false,
      "errorMessage": "Invalid password provided",
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T13:34:37.833Z",
      "description": "User logged in user 68b1ac6b83002d9799564820"
    },
    {
      "_id": "68b1ac6d83002d97995648b7",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b1ac6b83002d979956482e",
      "before": null,
      "after": null,
      "metadata": {
        "exportType": "candidate_data",
        "recordCount": 150,
        "exportFormat": "csv",
        "reason": "monthly_report"
      },
      "ipAddress": "192.168.1.100",
      "timestamp": "2025-08-29T13:34:37.854Z",
      "riskLevel": "high",
      "businessProcess": "data_export",
      "complianceCategory": "gdpr",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T13:34:37.854Z",
      "description": "User viewed candidate 68b1ac6b83002d979956482e"
    },
    {
      "_id": "68b1acba47a851111c425f9e",
      "actor": "68b1ac6a83002d97995647b4",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d97995647b4",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T13:35:54.889Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T13:35:54.917Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T13:35:54.919Z",
      "description": "User logged in user 68b1ac6a83002d97995647b4"
    },
    {
      "_id": "68b1acbd47a851111c425fb0",
      "actor": "68b1ac6a83002d97995647b4",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b1acbd47a851111c425faf",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedTo": "68b1ac6a83002d97995647b4"
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T13:35:57.660Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T13:35:57.662Z"
    },
    {
      "_id": "68b1acca47a851111c425fd4",
      "actor": "68b1ac6a83002d97995647b4",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b1acca47a851111c425fd3",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "stats",
        "statsData": {
          "byStatus": [
            {
              "_id": "completed",
              "count": 1
            },
            {
              "_id": "scheduled",
              "count": 2
            },
            {
              "_id": "cancelled",
              "count": 1
            },
            {
              "_id": "confirmed",
              "count": 1
            }
          ],
          "todayCount": 0
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T13:36:10.753Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved interview statistics",
      "changes": [],
      "retentionUntil": "2026-08-29T13:36:10.754Z"
    },
    {
      "_id": "68b1acca47a851111c425fda",
      "actor": "68b1ac6a83002d97995647b4",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b1acca47a851111c425fd9",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 5
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T13:36:10.932Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 5 interviews",
      "changes": [],
      "retentionUntil": "2026-08-29T13:36:10.933Z"
    },
    {
      "_id": "68b1ad6647a851111c426003",
      "actor": "68b1ac6a83002d97995647b4",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b1ad6647a851111c426002",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "stats",
        "statsData": {
          "byStatus": [
            {
              "_id": "confirmed",
              "count": 1
            },
            {
              "_id": "completed",
              "count": 1
            },
            {
              "_id": "scheduled",
              "count": 2
            },
            {
              "_id": "cancelled",
              "count": 1
            }
          ],
          "todayCount": 0
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T13:38:46.442Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved interview statistics",
      "changes": [],
      "retentionUntil": "2026-08-29T13:38:46.442Z"
    },
    {
      "_id": "68b1ad6647a851111c426009",
      "actor": "68b1ac6a83002d97995647b4",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b1ad6647a851111c426008",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 5
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T13:38:46.499Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 5 interviews",
      "changes": [],
      "retentionUntil": "2026-08-29T13:38:46.500Z"
    },
    {
      "_id": "68b1ada247a851111c426020",
      "actor": "68b1ac6a83002d97995647b4",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b1ada247a851111c42601f",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedTo": "68b1ac6a83002d97995647b4"
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T13:39:46.382Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T13:39:46.383Z"
    },
    {
      "_id": "68b1ada447a851111c426042",
      "actor": "68b1ac6a83002d97995647b4",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b1ada447a851111c426041",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "stats",
        "statsData": {
          "byStatus": [
            {
              "_id": "confirmed",
              "count": 1
            },
            {
              "_id": "completed",
              "count": 1
            },
            {
              "_id": "scheduled",
              "count": 2
            },
            {
              "_id": "cancelled",
              "count": 1
            }
          ],
          "todayCount": 0
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T13:39:48.056Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved interview statistics",
      "changes": [],
      "retentionUntil": "2026-08-29T13:39:48.057Z"
    },
    {
      "_id": "68b1ada447a851111c42604a",
      "actor": "68b1ac6a83002d97995647b4",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b1ada447a851111c426049",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 5
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T13:39:48.118Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 5 interviews",
      "changes": [],
      "retentionUntil": "2026-08-29T13:39:48.119Z"
    },
    {
      "_id": "68b1adae47a851111c426066",
      "actor": "68b1ac6a83002d97995647b4",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b1adae47a851111c426065",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedTo": "68b1ac6a83002d97995647b4"
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T13:39:58.310Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T13:39:58.311Z"
    },
    {
      "_id": "68b1adb147a851111c42608a",
      "actor": "68b1ac6a83002d97995647b4",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b1adb147a851111c426089",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "stats",
        "statsData": {
          "byStatus": [
            {
              "_id": "completed",
              "count": 1
            },
            {
              "_id": "scheduled",
              "count": 2
            },
            {
              "_id": "cancelled",
              "count": 1
            },
            {
              "_id": "confirmed",
              "count": 1
            }
          ],
          "todayCount": 0
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T13:40:01.001Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved interview statistics",
      "changes": [],
      "retentionUntil": "2026-08-29T13:40:01.001Z"
    },
    {
      "_id": "68b1adb147a851111c426090",
      "actor": "68b1ac6a83002d97995647b4",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b1adb147a851111c42608f",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 5
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T13:40:01.058Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 5 interviews",
      "changes": [],
      "retentionUntil": "2026-08-29T13:40:01.059Z"
    },
    {
      "_id": "68b1be5c3ce7ade2bc92ff42",
      "actor": "68b1ac6a83002d979956478f",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d979956478f",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T14:51:08.244Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T14:51:08.490Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T14:51:08.497Z",
      "description": "User logged in user 68b1ac6a83002d979956478f"
    },
    {
      "_id": "68b1be623ce7ade2bc92ff5a",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b1be623ce7ade2bc92ff59",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T14:51:14.007Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T14:51:14.008Z"
    },
    {
      "_id": "68b1be633ce7ade2bc92ff6b",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b1be633ce7ade2bc92ff6a",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T14:51:15.345Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T14:51:15.346Z"
    },
    {
      "_id": "68b1be6e3ce7ade2bc92ff7c",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b1be6e3ce7ade2bc92ff7b",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T14:51:26.309Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T14:51:26.310Z"
    },
    {
      "_id": "68b1be6e3ce7ade2bc92ff8e",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b1be6e3ce7ade2bc92ff8d",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T14:51:26.912Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T14:51:26.913Z"
    },
    {
      "_id": "68b1be703ce7ade2bc92ffa7",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b1be703ce7ade2bc92ffa6",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T14:51:28.210Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T14:51:28.211Z"
    },
    {
      "_id": "68b1be723ce7ade2bc92ffb4",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b1be723ce7ade2bc92ffb3",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "stats",
        "statsData": {
          "byStatus": [
            {
              "_id": "confirmed",
              "count": 1
            },
            {
              "_id": "scheduled",
              "count": 2
            },
            {
              "_id": "completed",
              "count": 1
            },
            {
              "_id": "cancelled",
              "count": 1
            }
          ],
          "todayCount": 0
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T14:51:30.052Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved interview statistics",
      "changes": [],
      "retentionUntil": "2026-08-29T14:51:30.053Z"
    },
    {
      "_id": "68b1be723ce7ade2bc92ffbc",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b1be723ce7ade2bc92ffbb",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 5
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T14:51:30.167Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 5 interviews",
      "changes": [],
      "retentionUntil": "2026-08-29T14:51:30.169Z"
    },
    {
      "_id": "68b1be9b3ce7ade2bc92ffce",
      "actor": "68b1ac6b83002d9799564820",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6b83002d9799564820",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T14:52:11.621Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T14:52:11.643Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T14:52:11.644Z",
      "description": "User logged in user 68b1ac6b83002d9799564820"
    },
    {
      "_id": "68b1ef283ce7ade2bc930006",
      "actor": "68b1ac6b83002d9799564820",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6b83002d9799564820",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T18:19:19.931Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T18:19:20.008Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T18:19:20.029Z",
      "description": "User logged in user 68b1ac6b83002d9799564820"
    },
    {
      "_id": "68b203fa5e03216d3c3d6894",
      "actor": "68b1ac6b83002d9799564820",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6b83002d9799564820",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T19:48:10.952Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T19:48:10.977Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T19:48:10.979Z",
      "description": "User logged in user 68b1ac6b83002d9799564820"
    },
    {
      "_id": "68b2093e418cf3e90ee13b1e",
      "actor": "68b1ac6a83002d979956478f",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d979956478f",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T20:10:38.341Z"
      },
      "ipAddress": "::1",
      "userAgent": "curl/8.5.0",
      "timestamp": "2025-08-29T20:10:38.373Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T20:10:38.376Z",
      "description": "User logged in user 68b1ac6a83002d979956478f"
    },
    {
      "_id": "68b2093e418cf3e90ee13b23",
      "actor": "68b1ac6a83002d9799564808",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d9799564808",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T20:10:38.634Z"
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "curl/8.5.0",
      "timestamp": "2025-08-29T20:10:38.661Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T20:10:38.662Z",
      "description": "User logged in user 68b1ac6a83002d9799564808"
    },
    {
      "_id": "68b20fa9c523b80f4515f856",
      "actor": "68b1ac6b83002d9799564820",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6b83002d9799564820",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T20:38:01.044Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:38:01.082Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T20:38:01.084Z",
      "description": "User logged in user 68b1ac6b83002d9799564820"
    },
    {
      "_id": "68b20fcdc523b80f4515f895",
      "actor": "68b1ac6a83002d979956478f",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d979956478f",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T20:38:37.303Z"
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:38:37.332Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T20:38:37.333Z",
      "description": "User logged in user 68b1ac6a83002d979956478f"
    },
    {
      "_id": "68b21029c523b80f4515f8a6",
      "actor": "68b1ac6b83002d9799564820",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6b83002d9799564820",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T20:40:09.067Z"
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
      "timestamp": "2025-08-29T20:40:09.095Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T20:40:09.096Z",
      "description": "User logged in user 68b1ac6b83002d9799564820"
    },
    {
      "_id": "68b2103dc523b80f4515f8ce",
      "actor": "68b1ac6b83002d9799564820",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6b83002d9799564820",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T20:40:29.704Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
      "timestamp": "2025-08-29T20:40:29.735Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T20:40:29.735Z",
      "description": "User logged in user 68b1ac6b83002d9799564820"
    },
    {
      "_id": "68b2104bc523b80f4515f90b",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b2104bc523b80f4515f90a",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:40:43.799Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T20:40:43.800Z"
    },
    {
      "_id": "68b2104cc523b80f4515f921",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b2104cc523b80f4515f920",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:40:44.907Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T20:40:44.907Z"
    },
    {
      "_id": "68b2104ec523b80f4515f93f",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b2104ec523b80f4515f93e",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "stats",
        "statsData": {
          "byStatus": [
            {
              "_id": "confirmed",
              "count": 1
            },
            {
              "_id": "scheduled",
              "count": 2
            },
            {
              "_id": "completed",
              "count": 1
            },
            {
              "_id": "cancelled",
              "count": 1
            }
          ],
          "todayCount": 0
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:40:46.595Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved interview statistics",
      "changes": [],
      "retentionUntil": "2026-08-29T20:40:46.595Z"
    },
    {
      "_id": "68b2104ec523b80f4515f943",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b2104ec523b80f4515f942",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 5
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:40:46.631Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 5 interviews",
      "changes": [],
      "retentionUntil": "2026-08-29T20:40:46.631Z"
    },
    {
      "_id": "68b210a4c523b80f4515f994",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b210a4c523b80f4515f993",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:42:12.985Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T20:42:12.985Z"
    },
    {
      "_id": "68b210a8c523b80f4515f9b1",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b210a8c523b80f4515f9b0",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:42:16.003Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T20:42:16.003Z"
    },
    {
      "_id": "68b210d5c523b80f4515f9db",
      "actor": "68b1ac6a83002d97995647b4",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d97995647b4",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T20:43:01.651Z"
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
      "timestamp": "2025-08-29T20:43:01.677Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T20:43:01.678Z",
      "description": "User logged in user 68b1ac6a83002d97995647b4"
    },
    {
      "_id": "68b210dfc523b80f4515f9f5",
      "actor": "68b1ac6a83002d97995647b4",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b210dfc523b80f4515f9f4",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedTo": "68b1ac6a83002d97995647b4"
        }
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
      "timestamp": "2025-08-29T20:43:11.741Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T20:43:11.743Z"
    },
    {
      "_id": "68b2134cc523b80f4515fa19",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b2134cc523b80f4515fa18",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:53:32.772Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T20:53:32.772Z"
    },
    {
      "_id": "68b2137dc523b80f4515fa23",
      "actor": "68b1ac6b83002d9799564820",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6b83002d9799564820",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T20:54:21.326Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:54:21.351Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T20:54:21.352Z",
      "description": "User logged in user 68b1ac6b83002d9799564820"
    },
    {
      "_id": "68b21395c523b80f4515fa49",
      "actor": "68b1ac6a83002d979956478f",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d979956478f",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T20:54:45.292Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:54:45.328Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T20:54:45.328Z",
      "description": "User logged in user 68b1ac6a83002d979956478f"
    },
    {
      "_id": "68b21396c523b80f4515fa61",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b21396c523b80f4515fa60",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:54:46.952Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T20:54:46.952Z"
    },
    {
      "_id": "68b213a2c523b80f4515fa83",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b213a2c523b80f4515fa82",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 5
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:54:58.415Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 5 interviews",
      "changes": [],
      "retentionUntil": "2026-08-29T20:54:58.415Z"
    },
    {
      "_id": "68b213a2c523b80f4515fa86",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b213a2c523b80f4515fa85",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "stats",
        "statsData": {
          "byStatus": [
            {
              "_id": "completed",
              "count": 1
            },
            {
              "_id": "cancelled",
              "count": 1
            },
            {
              "_id": "confirmed",
              "count": 1
            },
            {
              "_id": "scheduled",
              "count": 2
            }
          ],
          "todayCount": 0
        }
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:54:58.420Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved interview statistics",
      "changes": [],
      "retentionUntil": "2026-08-29T20:54:58.420Z"
    },
    {
      "_id": "68b213c4c523b80f4515fab5",
      "actor": "68b1ac6b83002d9799564820",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6b83002d9799564820",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T20:55:32.797Z"
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:55:32.832Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T20:55:32.832Z",
      "description": "User logged in user 68b1ac6b83002d9799564820"
    },
    {
      "_id": "68b213f6c523b80f4515fb0f",
      "actor": "68b1ac6a83002d9799564808",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d9799564808",
      "before": null,
      "after": null,
      "metadata": {
        "success": false,
        "reason": "invalid_password"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:56:22.931Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": false,
      "errorMessage": "Invalid password",
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T20:56:22.932Z",
      "description": "User logged in user 68b1ac6a83002d9799564808"
    },
    {
      "_id": "68b213ffc523b80f4515fb13",
      "actor": "68b1ac6a83002d9799564808",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d9799564808",
      "before": null,
      "after": null,
      "metadata": {
        "success": false,
        "reason": "invalid_password"
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:56:31.217Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": false,
      "errorMessage": "Invalid password",
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T20:56:31.218Z",
      "description": "User logged in user 68b1ac6a83002d9799564808"
    },
    {
      "_id": "68b21413c523b80f4515fb19",
      "actor": "68b1ac6a83002d9799564808",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d9799564808",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T20:56:51.591Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:56:51.618Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T20:56:51.618Z",
      "description": "User logged in user 68b1ac6a83002d9799564808"
    },
    {
      "_id": "68b2141dc523b80f4515fb31",
      "actor": "68b1ac6a83002d9799564808",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b2141dc523b80f4515fb30",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 2,
        "assignedCandidateCount": 2,
        "filter": {
          "_id": {
            "$in": [
              "68b1ac6b83002d979956482e",
              "68b1ac6b83002d9799564831"
            ]
          }
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:57:01.772Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 2 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-29T20:57:01.773Z"
    },
    {
      "_id": "68b21426c523b80f4515fb45",
      "actor": "68b1ac6a83002d9799564808",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b21426c523b80f4515fb44",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedBy": "68b1ac6a83002d9799564808"
        }
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:57:10.239Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T20:57:10.240Z"
    },
    {
      "_id": "68b21430c523b80f4515fb5d",
      "actor": "68b1ac6a83002d9799564808",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b21430c523b80f4515fb5c",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 2,
        "assignedCandidateCount": 2,
        "filter": {
          "_id": {
            "$in": [
              "68b1ac6b83002d979956482e",
              "68b1ac6b83002d9799564831"
            ]
          }
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:57:20.600Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 2 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-29T20:57:20.601Z"
    },
    {
      "_id": "68b21433c523b80f4515fb70",
      "actor": "68b1ac6a83002d9799564808",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b21433c523b80f4515fb6f",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 2,
        "assignedCandidateCount": 2,
        "filter": {
          "_id": {
            "$in": [
              "68b1ac6b83002d979956482e",
              "68b1ac6b83002d9799564831"
            ]
          }
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:57:23.573Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 2 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-29T20:57:23.574Z"
    },
    {
      "_id": "68b21434c523b80f4515fb89",
      "actor": "68b1ac6a83002d9799564808",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b21434c523b80f4515fb88",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedBy": "68b1ac6a83002d9799564808"
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:57:24.453Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T20:57:24.454Z"
    },
    {
      "_id": "68b21441c523b80f4515fb9f",
      "actor": "68b1ac6a83002d9799564808",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b21441c523b80f4515fb9e",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 2,
        "assignedCandidateCount": 2,
        "filter": {
          "_id": {
            "$in": [
              "68b1ac6b83002d979956482e",
              "68b1ac6b83002d9799564831"
            ]
          }
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:57:37.047Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 2 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-29T20:57:37.048Z"
    },
    {
      "_id": "68b21458c523b80f4515fbb5",
      "actor": "68b1ac6a83002d9799564808",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b21458c523b80f4515fbb4",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedBy": "68b1ac6a83002d9799564808"
        }
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:58:00.760Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T20:58:00.761Z"
    },
    {
      "_id": "68b2145ec523b80f4515fbc7",
      "actor": "68b1ac6a83002d9799564808",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b2145ec523b80f4515fbc6",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedBy": "68b1ac6a83002d9799564808"
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:58:06.646Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T20:58:06.648Z"
    },
    {
      "_id": "68b21463c523b80f4515fbd6",
      "actor": "68b1ac6b83002d9799564820",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6b83002d9799564820",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T20:58:11.646Z"
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:58:11.674Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T20:58:11.675Z",
      "description": "User logged in user 68b1ac6b83002d9799564820"
    },
    {
      "_id": "68b21477c523b80f4515fc2e",
      "actor": "68b1ac6b83002d9799564820",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6b83002d9799564820",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T20:58:31.228Z"
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-29T20:58:31.264Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T20:58:31.265Z",
      "description": "User logged in user 68b1ac6b83002d9799564820"
    },
    {
      "_id": "68b214ab081680ad82260239",
      "actor": "68b1ac6b83002d9799564820",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6b83002d9799564820",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T20:59:23.291Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T20:59:23.433Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T20:59:23.443Z",
      "description": "User logged in user 68b1ac6b83002d9799564820"
    },
    {
      "_id": "68b218e4c523b80f4515fc8b",
      "actor": "68b1ac6b83002d9799564820",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6b83002d9799564820",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T21:17:23.985Z"
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T21:17:24.023Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T21:17:24.024Z",
      "description": "User logged in user 68b1ac6b83002d9799564820"
    },
    {
      "_id": "68b23320081680ad8226030c",
      "actor": "68b1ac6a83002d979956478f",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d979956478f",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T23:09:20.047Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:09:20.085Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T23:09:20.087Z",
      "description": "User logged in user 68b1ac6a83002d979956478f"
    },
    {
      "_id": "68b2332b081680ad82260331",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b2332b081680ad82260330",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:09:31.470Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T23:09:31.470Z"
    },
    {
      "_id": "68b23339081680ad8226034b",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b23339081680ad8226034a",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:09:45.918Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T23:09:45.920Z"
    },
    {
      "_id": "68b23353081680ad8226036b",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b23353081680ad8226036a",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "stats",
        "statsData": {
          "byStatus": [
            {
              "_id": "scheduled",
              "count": 2
            },
            {
              "_id": "completed",
              "count": 1
            },
            {
              "_id": "cancelled",
              "count": 1
            },
            {
              "_id": "confirmed",
              "count": 1
            }
          ],
          "todayCount": 1
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:10:11.574Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved interview statistics",
      "changes": [],
      "retentionUntil": "2026-08-29T23:10:11.575Z"
    },
    {
      "_id": "68b23353081680ad82260373",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b23353081680ad82260372",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 5
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:10:11.685Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 5 interviews",
      "changes": [],
      "retentionUntil": "2026-08-29T23:10:11.686Z"
    },
    {
      "_id": "68b233a0081680ad82260394",
      "actor": "68b1ac6a83002d9799564808",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d9799564808",
      "before": null,
      "after": null,
      "metadata": {
        "success": false,
        "reason": "invalid_password"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:11:28.471Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": false,
      "errorMessage": "Invalid password",
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T23:11:28.471Z",
      "description": "User logged in user 68b1ac6a83002d9799564808"
    },
    {
      "_id": "68b233aa081680ad82260399",
      "actor": "68b1ac6a83002d9799564808",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d9799564808",
      "before": null,
      "after": null,
      "metadata": {
        "success": false,
        "reason": "invalid_password"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:11:38.347Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": false,
      "errorMessage": "Invalid password",
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T23:11:38.347Z",
      "description": "User logged in user 68b1ac6a83002d9799564808"
    },
    {
      "_id": "68b233ddc523b80f4515fcfe",
      "actor": "68b1ac6a83002d9799564808",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d9799564808",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T23:12:29.963Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:12:29.994Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T23:12:29.995Z",
      "description": "User logged in user 68b1ac6a83002d9799564808"
    },
    {
      "_id": "68b233e1c523b80f4515fd19",
      "actor": "68b1ac6a83002d9799564808",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b233e1c523b80f4515fd18",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 2,
        "assignedCandidateCount": 2,
        "filter": {
          "_id": {
            "$in": [
              "68b1ac6b83002d979956482e",
              "68b1ac6b83002d9799564831"
            ]
          }
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:12:33.003Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 2 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-29T23:12:33.004Z"
    },
    {
      "_id": "68b233f7c523b80f4515fd23",
      "actor": "68b1ac6b83002d9799564820",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6b83002d9799564820",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T23:12:55.179Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
      "timestamp": "2025-08-29T23:12:55.215Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T23:12:55.216Z",
      "description": "User logged in user 68b1ac6b83002d9799564820"
    },
    {
      "_id": "68b23401c523b80f4515fd4a",
      "actor": "68b1ac6a83002d9799564808",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b23401c523b80f4515fd49",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedBy": "68b1ac6a83002d9799564808"
        }
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:13:05.001Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T23:13:05.001Z"
    },
    {
      "_id": "68b23406c523b80f4515fd67",
      "actor": "68b1ac6a83002d9799564808",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b23406c523b80f4515fd66",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedBy": "68b1ac6a83002d9799564808"
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:13:10.046Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T23:13:10.046Z"
    },
    {
      "_id": "68b23673c523b80f4515fe31",
      "actor": "68b1ac6a83002d9799564808",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d9799564808",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T23:23:31.599Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
      "timestamp": "2025-08-29T23:23:31.630Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T23:23:31.630Z",
      "description": "User logged in user 68b1ac6a83002d9799564808"
    },
    {
      "_id": "68b236a1c523b80f4515fe4f",
      "actor": "68b1ac6a83002d9799564808",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b236a1c523b80f4515fe4e",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 2,
        "assignedCandidateCount": 2,
        "filter": {
          "_id": {
            "$in": [
              "68b1ac6b83002d979956482e",
              "68b1ac6b83002d9799564831"
            ]
          }
        }
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
      "timestamp": "2025-08-29T23:24:17.610Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 2 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-29T23:24:17.610Z"
    },
    {
      "_id": "68b236d0c523b80f4515fe67",
      "actor": "68b1ac6a83002d9799564808",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b236d0c523b80f4515fe66",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedBy": "68b1ac6a83002d9799564808"
        }
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
      "timestamp": "2025-08-29T23:25:04.584Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T23:25:04.584Z"
    },
    {
      "_id": "68b237b0c523b80f4515fe89",
      "actor": "68b1ac6a83002d9799564808",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b237b0c523b80f4515fe88",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedBy": "68b1ac6a83002d9799564808"
        }
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
      "timestamp": "2025-08-29T23:28:48.119Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T23:28:48.119Z"
    },
    {
      "_id": "68b23813c523b80f4515fe95",
      "actor": "68b1ac6a83002d97995647b4",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d97995647b4",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T23:30:27.181Z"
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
      "timestamp": "2025-08-29T23:30:27.205Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T23:30:27.205Z",
      "description": "User logged in user 68b1ac6a83002d97995647b4"
    },
    {
      "_id": "68b23845c523b80f4515feab",
      "actor": "68b1ac6a83002d97995647b4",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b23845c523b80f4515feaa",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedTo": "68b1ac6a83002d97995647b4"
        }
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
      "timestamp": "2025-08-29T23:31:17.211Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T23:31:17.212Z"
    },
    {
      "_id": "68b23862c523b80f4515feb2",
      "actor": "68b1ac6a83002d97995647e8",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d97995647e8",
      "before": null,
      "after": null,
      "metadata": {
        "success": false,
        "reason": "invalid_password"
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
      "timestamp": "2025-08-29T23:31:46.235Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": false,
      "errorMessage": "Invalid password",
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T23:31:46.236Z",
      "description": "User logged in user 68b1ac6a83002d97995647e8"
    },
    {
      "_id": "68b2386fc523b80f4515feb7",
      "actor": "68b1ac6a83002d97995647e8",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d97995647e8",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T23:31:59.082Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
      "timestamp": "2025-08-29T23:31:59.112Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T23:31:59.112Z",
      "description": "User logged in user 68b1ac6a83002d97995647e8"
    },
    {
      "_id": "68b238dac523b80f4515fec3",
      "actor": "68b1ac6a83002d97995647e8",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b238dac523b80f4515fec2",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 0,
        "filter": {
          "assignedTo": "68b1ac6a83002d97995647e8"
        }
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
      "timestamp": "2025-08-29T23:33:46.607Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 0 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T23:33:46.607Z"
    },
    {
      "_id": "68b2396b081680ad822603a0",
      "actor": "68b1ac6a83002d9799564808",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d9799564808",
      "before": null,
      "after": null,
      "metadata": {
        "success": false,
        "reason": "invalid_password"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:36:11.749Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": false,
      "errorMessage": "Invalid password",
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T23:36:11.753Z",
      "description": "User logged in user 68b1ac6a83002d9799564808"
    },
    {
      "_id": "68b23a10c523b80f4515fecd",
      "actor": "68b1ac6b83002d9799564820",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6b83002d9799564820",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T23:38:56.225Z"
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:38:56.258Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T23:38:56.258Z",
      "description": "User logged in user 68b1ac6b83002d9799564820"
    },
    {
      "_id": "68b23a43c523b80f4515ff68",
      "actor": "68b1ac6a83002d979956478f",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d979956478f",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-29T23:39:46.990Z"
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:39:47.027Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-27T23:39:47.028Z",
      "description": "User logged in user 68b1ac6a83002d979956478f"
    },
    {
      "_id": "68b23a46c523b80f4515ff91",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b23a46c523b80f4515ff90",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:39:50.107Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T23:39:50.107Z"
    },
    {
      "_id": "68b23a53c523b80f4515ffab",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b23a53c523b80f4515ffaa",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:40:03.974Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T23:40:03.975Z"
    },
    {
      "_id": "68b23a5cc523b80f4515ffcb",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b23a5cc523b80f4515ffca",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "stats",
        "statsData": {
          "byStatus": [
            {
              "_id": "completed",
              "count": 1
            },
            {
              "_id": "scheduled",
              "count": 2
            },
            {
              "_id": "cancelled",
              "count": 1
            },
            {
              "_id": "confirmed",
              "count": 1
            }
          ],
          "todayCount": 0
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:40:12.696Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved interview statistics",
      "changes": [],
      "retentionUntil": "2026-08-29T23:40:12.696Z"
    },
    {
      "_id": "68b23a5cc523b80f4515ffd3",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b23a5cc523b80f4515ffd2",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 5
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:40:12.786Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 5 interviews",
      "changes": [],
      "retentionUntil": "2026-08-29T23:40:12.787Z"
    },
    {
      "_id": "68b23a73c523b80f4516001b",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b23a73c523b80f4516001a",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:40:35.601Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T23:40:35.602Z"
    },
    {
      "_id": "68b23a74c523b80f45160044",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b23a74c523b80f45160043",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:40:36.681Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T23:40:36.681Z"
    },
    {
      "_id": "68b23a8ec523b80f4516006d",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b23a8ec523b80f4516006c",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:41:02.038Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T23:41:02.038Z"
    },
    {
      "_id": "68b23a97c523b80f45160087",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b23a97c523b80f45160086",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:41:11.374Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T23:41:11.374Z"
    },
    {
      "_id": "68b23aa8c523b80f451600a7",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b23aa8c523b80f451600a6",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "stats",
        "statsData": {
          "byStatus": [
            {
              "_id": "confirmed",
              "count": 1
            },
            {
              "_id": "completed",
              "count": 1
            },
            {
              "_id": "scheduled",
              "count": 2
            },
            {
              "_id": "cancelled",
              "count": 1
            }
          ],
          "todayCount": 0
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:41:28.557Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved interview statistics",
      "changes": [],
      "retentionUntil": "2026-08-29T23:41:28.557Z"
    },
    {
      "_id": "68b23aa8c523b80f451600af",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b23aa8c523b80f451600ae",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 5
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:41:28.677Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 5 interviews",
      "changes": [],
      "retentionUntil": "2026-08-29T23:41:28.677Z"
    },
    {
      "_id": "68b23b23c523b80f451600ec",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b23b23c523b80f451600eb",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:43:31.306Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T23:43:31.306Z"
    },
    {
      "_id": "68b23b2fc523b80f45160115",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b23b2fc523b80f45160114",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-29T23:43:43.525Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-29T23:43:43.525Z"
    },
    {
      "_id": "68b2b07fc523b80f4516011e",
      "actor": "68b1ac6a83002d9799564808",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d9799564808",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-30T08:04:15.455Z"
      },
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-30T08:04:15.485Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-28T08:04:15.485Z",
      "description": "User logged in user 68b1ac6a83002d9799564808"
    },
    {
      "_id": "68b2b086c523b80f4516013e",
      "actor": "68b1ac6a83002d9799564808",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b2b086c523b80f4516013d",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 2,
        "assignedCandidateCount": 2,
        "filter": {
          "_id": {
            "$in": [
              "68b1ac6b83002d979956482e",
              "68b1ac6b83002d9799564831"
            ]
          }
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-30T08:04:22.223Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "production"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 2 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-30T08:04:22.223Z"
    },
    {
      "_id": "68b3ebdf1f53c816e76615af",
      "actor": "68b1ac6a83002d979956478f",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d979956478f",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T06:29:51.557Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:29:51.679Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T06:29:51.682Z",
      "description": "User logged in user 68b1ac6a83002d979956478f"
    },
    {
      "_id": "68b3ebed1f53c816e76615d9",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3ebed1f53c816e76615d8",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:30:05.775Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T06:30:05.777Z"
    },
    {
      "_id": "68b3ebf71f53c816e7661603",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3ebf71f53c816e7661602",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:30:15.732Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T06:30:15.733Z"
    },
    {
      "_id": "68b3ec191f53c816e7661639",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3ec191f53c816e7661638",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:30:49.890Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T06:30:49.891Z"
    },
    {
      "_id": "68b3ec991f53c816e7661663",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3ec991f53c816e7661662",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:32:57.757Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T06:32:57.757Z"
    },
    {
      "_id": "68b3ecde1f53c816e766167d",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b3ecde1f53c816e766167c",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:34:06.253Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T06:34:06.253Z"
    },
    {
      "_id": "68b3ece21f53c816e766169f",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b3ece21f53c816e766169e",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "stats",
        "statsData": {
          "byStatus": [
            {
              "_id": "completed",
              "count": 1
            },
            {
              "_id": "scheduled",
              "count": 2
            },
            {
              "_id": "cancelled",
              "count": 1
            },
            {
              "_id": "confirmed",
              "count": 1
            }
          ],
          "todayCount": 1
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:34:10.272Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved interview statistics",
      "changes": [],
      "retentionUntil": "2026-08-31T06:34:10.273Z"
    },
    {
      "_id": "68b3ece21f53c816e76616a5",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b3ece21f53c816e76616a4",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 5
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:34:10.491Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 5 interviews",
      "changes": [],
      "retentionUntil": "2026-08-31T06:34:10.492Z"
    },
    {
      "_id": "68b3ed181f53c816e76616ea",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3ed181f53c816e76616e9",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:35:04.113Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T06:35:04.115Z"
    },
    {
      "_id": "68b3f031896f9c4de42107ac",
      "actor": "68b1ac6b83002d9799564820",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6b83002d9799564820",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T06:48:17.569Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:48:17.716Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T06:48:17.721Z",
      "description": "User logged in user 68b1ac6b83002d9799564820"
    },
    {
      "_id": "68b3f042896f9c4de42107d4",
      "actor": "68b1ac6a83002d979956478f",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d979956478f",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T06:48:34.553Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:48:34.681Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T06:48:34.681Z",
      "description": "User logged in user 68b1ac6a83002d979956478f"
    },
    {
      "_id": "68b3f045896f9c4de42107fd",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f045896f9c4de42107fc",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:48:37.482Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T06:48:37.484Z"
    },
    {
      "_id": "68b3f04a896f9c4de4210832",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f04a896f9c4de4210831",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:48:42.751Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T06:48:42.752Z"
    },
    {
      "_id": "68b3f052896f9c4de4210848",
      "actor": "68b1ac6a83002d979956478f",
      "action": "update",
      "entityType": "AgentAssignment",
      "entityId": "68b1ac6d83002d97995648a4",
      "before": {
        "_id": "68b1ac6d83002d97995648a4",
        "agentId": "68b1ac6a83002d9799564808",
        "assignedHRs": [
          "68b1ac6a83002d97995647b4",
          "68b1ac6a83002d97995647e8"
        ],
        "assignedCandidates": [
          "68b1ac6b83002d979956482e",
          "68b1ac6b83002d9799564831"
        ],
        "assignedBy": "68b1ac6a83002d979956478f",
        "status": "active",
        "notes": "Primary agent handling TechCorp and GrowthStart accounts with experienced developers.",
        "assignedAt": "2025-08-29T13:34:37.593Z",
        "createdAt": "2025-08-29T13:34:37.594Z",
        "updatedAt": "2025-08-29T13:34:37.594Z",
        "__v": 0,
        "hrCount": 2,
        "candidateCount": 2,
        "isActive": true,
        "id": "68b1ac6d83002d97995648a4"
      },
      "after": {
        "_id": "68b1ac6d83002d97995648a4",
        "agentId": "68b1ac6a83002d9799564808",
        "assignedHRs": [
          "68b1ac6a83002d97995647b4",
          "68b1ac6a83002d97995647e8"
        ],
        "assignedCandidates": [
          "68b1ac6b83002d9799564823"
        ],
        "assignedBy": "68b1ac6a83002d979956478f",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-29T13:34:37.593Z",
        "createdAt": "2025-08-29T13:34:37.594Z",
        "updatedAt": "2025-08-31T06:48:50.426Z",
        "__v": 1,
        "hrCount": 2,
        "candidateCount": 1,
        "isActive": true,
        "id": "68b1ac6d83002d97995648a4"
      },
      "metadata": {
        "agentId": "68b1ac6a83002d9799564808",
        "hrCount": 2,
        "candidateCount": 1
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:48:50.514Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [
        {
          "field": "assignedCandidates",
          "oldValue": [
            "68b1ac6b83002d979956482e",
            "68b1ac6b83002d9799564831"
          ],
          "newValue": [
            "68b1ac6b83002d9799564823"
          ],
          "dataType": "object"
        },
        {
          "field": "notes",
          "oldValue": "Primary agent handling TechCorp and GrowthStart accounts with experienced developers.",
          "newValue": "",
          "dataType": "string"
        },
        {
          "field": "updatedAt",
          "oldValue": "2025-08-29T13:34:37.594Z",
          "newValue": "2025-08-31T06:48:50.426Z",
          "dataType": "object"
        },
        {
          "field": "__v",
          "oldValue": 0,
          "newValue": 1,
          "dataType": "number"
        },
        {
          "field": "candidateCount",
          "oldValue": 2,
          "newValue": 1,
          "dataType": "number"
        }
      ],
      "retentionUntil": "2026-08-31T06:48:50.514Z",
      "description": "User updated agentassignment 68b1ac6d83002d97995648a4"
    },
    {
      "_id": "68b3f052896f9c4de4210856",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f052896f9c4de4210855",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:48:50.839Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T06:48:50.839Z"
    },
    {
      "_id": "68b3f06aa566542e9c701bd3",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b3f06aa566542e9c701bd2",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:49:14.730Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T06:49:14.737Z"
    },
    {
      "_id": "68b3f06da566542e9c701bfc",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f06da566542e9c701bfb",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:49:17.116Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T06:49:17.117Z"
    },
    {
      "_id": "68b3f082a566542e9c701c0c",
      "actor": "68b1ac6a83002d9799564808",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d9799564808",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T06:49:38.694Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:49:38.808Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T06:49:38.808Z",
      "description": "User logged in user 68b1ac6a83002d9799564808"
    },
    {
      "_id": "68b3f087a566542e9c701c2c",
      "actor": "68b1ac6a83002d9799564808",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b3f087a566542e9c701c2b",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 0,
        "assignedCandidateCount": 1,
        "filter": {
          "_id": {
            "$in": [
              "68b1ac6b83002d9799564823"
            ]
          }
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:49:43.274Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 0 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-31T06:49:43.276Z"
    },
    {
      "_id": "68b3f095a566542e9c701c58",
      "actor": "68b1ac6a83002d9799564808",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b3f095a566542e9c701c57",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 0,
        "assignedCandidateCount": 1,
        "filter": {
          "_id": {
            "$in": [
              "68b1ac6b83002d9799564823"
            ]
          }
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:49:57.111Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 0 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-31T06:49:57.112Z"
    },
    {
      "_id": "68b3f0b4a566542e9c701c72",
      "actor": "68b1ac6a83002d9799564808",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b3f0b4a566542e9c701c71",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedBy": "68b1ac6a83002d9799564808"
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:50:28.361Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T06:50:28.363Z"
    },
    {
      "_id": "68b3f0b6a566542e9c701c92",
      "actor": "68b1ac6a83002d9799564808",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b3f0b6a566542e9c701c91",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 0,
        "assignedCandidateCount": 1,
        "filter": {
          "_id": {
            "$in": [
              "68b1ac6b83002d9799564823"
            ]
          }
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:50:30.004Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 0 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-31T06:50:30.006Z"
    },
    {
      "_id": "68b3f0d1a566542e9c701ca2",
      "actor": "68b1ac6a83002d979956478f",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d979956478f",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T06:50:57.255Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:50:57.395Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T06:50:57.395Z",
      "description": "User logged in user 68b1ac6a83002d979956478f"
    },
    {
      "_id": "68b3f0d3a566542e9c701ccb",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f0d3a566542e9c701cca",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:50:59.707Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T06:50:59.709Z"
    },
    {
      "_id": "68b3f0d6a566542e9c701ce5",
      "actor": "68b1ac6a83002d979956478f",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b3f0d6a566542e9c701ce4",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:51:02.963Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T06:51:02.964Z"
    },
    {
      "_id": "68b3f0dca566542e9c701d0e",
      "actor": "68b1ac6a83002d979956478f",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f0dca566542e9c701d0d",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T06:51:08.652Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 2 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T06:51:08.654Z"
    },
    {
      "_id": "68b3f0fba566542e9c701d18",
      "actor": "68b1ac6a83002d9799564808",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d9799564808",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T06:51:39.811Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T06:51:39.911Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T06:51:39.912Z",
      "description": "User logged in user 68b1ac6a83002d9799564808"
    },
    {
      "_id": "68b3f101a566542e9c701d38",
      "actor": "68b1ac6a83002d9799564808",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b3f101a566542e9c701d37",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 0,
        "assignedCandidateCount": 1,
        "filter": {
          "_id": {
            "$in": [
              "68b1ac6b83002d9799564823"
            ]
          }
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T06:51:45.364Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 0 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-31T06:51:45.365Z"
    },
    {
      "_id": "68b3f2cda566542e9c701dfa",
      "actor": "68b1ac6a83002d9799564808",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b3f2cda566542e9c701df9",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 0,
        "assignedCandidateCount": 1,
        "filter": {
          "_id": {
            "$in": [
              "68b1ac6b83002d9799564823"
            ]
          }
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T06:59:25.253Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 0 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-31T06:59:25.254Z"
    },
    {
      "_id": "68b3f2dda566542e9c701e20",
      "actor": "68b1ac6a83002d9799564808",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b3f2dda566542e9c701e1f",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 0,
        "assignedCandidateCount": 1,
        "filter": {
          "_id": {
            "$in": [
              "68b1ac6b83002d9799564823"
            ]
          }
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T06:59:41.410Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 0 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-31T06:59:41.410Z"
    },
    {
      "_id": "68b3f2eda566542e9c701e52",
      "actor": "68b1ac6a83002d9799564808",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b3f2eda566542e9c701e51",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 0,
        "assignedCandidateCount": 1,
        "filter": {
          "_id": {
            "$in": [
              "68b1ac6b83002d9799564823"
            ]
          }
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T06:59:57.405Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 0 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-31T06:59:57.406Z"
    },
    {
      "_id": "68b3f2f5a566542e9c701e84",
      "actor": "68b1ac6a83002d9799564808",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b3f2f5a566542e9c701e83",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 0,
        "assignedCandidateCount": 1,
        "filter": {
          "_id": {
            "$in": [
              "68b1ac6b83002d9799564823"
            ]
          }
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T07:00:05.212Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 0 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-31T07:00:05.213Z"
    },
    {
      "_id": "68b3f47d26203c4d753b9d6e",
      "actor": "68b1ac6a83002d9799564808",
      "action": "login",
      "entityType": "User",
      "entityId": "68b1ac6a83002d9799564808",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T07:06:37.755Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T07:06:37.874Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T07:06:37.877Z",
      "description": "User logged in user 68b1ac6a83002d9799564808"
    },
    {
      "_id": "68b3f48026203c4d753b9d94",
      "actor": "68b1ac6a83002d9799564808",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b3f48026203c4d753b9d93",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 0,
        "assignedCandidateCount": 1,
        "filter": {
          "_id": {
            "$in": [
              "68b1ac6b83002d9799564823"
            ]
          }
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T07:06:40.966Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 0 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-31T07:06:40.966Z"
    },
    {
      "_id": "68b3f49126203c4d753b9dc6",
      "actor": "68b1ac6a83002d9799564808",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b3f49126203c4d753b9dc5",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 0,
        "assignedCandidateCount": 1,
        "filter": {
          "_id": {
            "$in": [
              "68b1ac6b83002d9799564823"
            ]
          }
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T07:06:57.365Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 0 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-31T07:06:57.367Z"
    },
    {
      "_id": "68b3f5c8b8c48927f8ee239c",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5beb8c48927f8ee229c",
      "before": null,
      "after": null,
      "metadata": {
        "loginMethod": "email_password",
        "deviceType": "desktop",
        "browser": "Chrome"
      },
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "timestamp": "2025-08-31T07:12:08.652Z",
      "riskLevel": "low",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2026-08-31T07:12:08.653Z",
      "description": "User logged in user 68b3f5beb8c48927f8ee229c"
    },
    {
      "_id": "68b3f5c8b8c48927f8ee239e",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "create",
      "entityType": "Candidate",
      "entityId": "68b1ac6b83002d979956482e",
      "before": null,
      "after": {
        "status": "active",
        "rating": 4.8,
        "tags": [
          "Senior",
          "Full-Stack",
          "React"
        ]
      },
      "metadata": {
        "source": "manual_entry",
        "recruitmentChannel": "linkedin"
      },
      "ipAddress": "10.0.0.50",
      "timestamp": "2025-08-31T07:12:08.743Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2026-08-31T07:12:08.744Z",
      "description": "User created candidate 68b1ac6b83002d979956482e"
    },
    {
      "_id": "68b3f5c8b8c48927f8ee23a0",
      "actor": "68b3f5bfb8c48927f8ee22ba",
      "action": "create",
      "entityType": "Job",
      "entityId": "68b1ac6b83002d9799564837",
      "before": null,
      "after": {
        "title": "Senior React Developer",
        "status": "open",
        "urgency": "high"
      },
      "metadata": {
        "companyId": "68b1ac6b83002d9799564827",
        "approvalRequired": false
      },
      "ipAddress": "172.16.0.25",
      "timestamp": "2025-08-31T07:12:08.825Z",
      "riskLevel": "medium",
      "businessProcess": "job_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T07:12:08.826Z",
      "description": "User created job 68b1ac6b83002d9799564837"
    },
    {
      "_id": "68b3f5c8b8c48927f8ee23a2",
      "actor": "68b3f5c0b8c48927f8ee232b",
      "action": "create",
      "entityType": "Application",
      "entityId": "68b1ac6c83002d979956484e",
      "before": null,
      "after": {
        "status": "submitted",
        "stage": "applied"
      },
      "metadata": {
        "applicationSource": "direct_apply",
        "resumeUploaded": true
      },
      "ipAddress": "203.0.113.42",
      "timestamp": "2025-08-31T07:12:08.942Z",
      "riskLevel": "low",
      "businessProcess": "application_processing",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2026-08-31T07:12:08.942Z",
      "description": "User created application 68b1ac6c83002d979956484e"
    },
    {
      "_id": "68b3f5c9b8c48927f8ee23a4",
      "actor": "68b3f5c0b8c48927f8ee232b",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5c0b8c48927f8ee232b",
      "before": null,
      "after": null,
      "metadata": {
        "loginMethod": "email_password",
        "failureReason": "invalid_password",
        "attemptCount": 1
      },
      "ipAddress": "198.51.100.15",
      "timestamp": "2025-08-31T07:12:09.053Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": false,
      "errorMessage": "Invalid password provided",
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T07:12:09.054Z",
      "description": "User logged in user 68b3f5c0b8c48927f8ee232b"
    },
    {
      "_id": "68b3f5c9b8c48927f8ee23a6",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b1ac6b83002d979956482e",
      "before": null,
      "after": null,
      "metadata": {
        "exportType": "candidate_data",
        "recordCount": 150,
        "exportFormat": "csv",
        "reason": "monthly_report"
      },
      "ipAddress": "192.168.1.100",
      "timestamp": "2025-08-31T07:12:09.143Z",
      "riskLevel": "high",
      "businessProcess": "data_export",
      "complianceCategory": "gdpr",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T07:12:09.144Z",
      "description": "User viewed candidate 68b1ac6b83002d979956482e"
    },
    {
      "_id": "68b3f62cb8b1c24694b19dbb",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5bfb8c48927f8ee2304",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T07:13:48.425Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T07:13:48.541Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T07:13:48.545Z",
      "description": "User logged in user 68b3f5bfb8c48927f8ee2304"
    },
    {
      "_id": "68b3f633b8b1c24694b19dd6",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b3f633b8b1c24694b19dd5",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 0,
        "assignedCandidateCount": 2,
        "filter": {
          "_id": {
            "$in": [
              "68b3f5c0b8c48927f8ee232b",
              "68b3f5c0b8c48927f8ee2331"
            ]
          }
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T07:13:55.926Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 0 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-31T07:13:55.927Z"
    },
    {
      "_id": "68b3f646b8b1c24694b19df5",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b3f646b8b1c24694b19df4",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 0,
        "assignedCandidateCount": 2,
        "filter": {
          "_id": {
            "$in": [
              "68b3f5c0b8c48927f8ee232b",
              "68b3f5c0b8c48927f8ee2331"
            ]
          }
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T07:14:14.984Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 0 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-31T07:14:14.985Z"
    },
    {
      "_id": "68b3f65bb8b1c24694b19dfa",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5beb8c48927f8ee229c",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T07:14:35.194Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T07:14:35.670Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T07:14:35.672Z",
      "description": "User logged in user 68b3f5beb8c48927f8ee229c"
    },
    {
      "_id": "68b3f65fb8b1c24694b19e0a",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f65fb8b1c24694b19e09",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T07:14:39.785Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T07:14:39.787Z"
    },
    {
      "_id": "68b3f66ab8b1c24694b19e1e",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f66ab8b1c24694b19e1d",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T07:14:50.196Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T07:14:50.197Z"
    },
    {
      "_id": "68b3f7d1b8b1c24694b19e39",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b3f7d1b8b1c24694b19e38",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 0,
        "assignedCandidateCount": 2,
        "filter": {
          "_id": {
            "$in": [
              "68b3f5c0b8c48927f8ee232b",
              "68b3f5c0b8c48927f8ee2331"
            ]
          }
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T07:20:49.216Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 0 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-31T07:20:49.217Z"
    },
    {
      "_id": "68b3f80bb8b1c24694b19e54",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "Candidate",
      "entityId": "68b3f80bb8b1c24694b19e53",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "agent_candidates",
        "resultCount": 0,
        "assignedCandidateCount": 2,
        "filter": {
          "_id": {
            "$in": [
              "68b3f5c0b8c48927f8ee232b",
              "68b3f5c0b8c48927f8ee2331"
            ]
          }
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T07:21:47.174Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Agent retrieved 0 assigned candidates",
      "changes": [],
      "retentionUntil": "2026-08-31T07:21:47.175Z"
    },
    {
      "_id": "68b41756a4148512da7a4b67",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5bfb8c48927f8ee2304",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T09:35:18.203Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T09:35:18.333Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T09:35:18.337Z",
      "description": "User logged in user 68b3f5bfb8c48927f8ee2304"
    },
    {
      "_id": "68b418eaa4148512da7a4c2f",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5beb8c48927f8ee229c",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T09:42:02.167Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T09:42:02.240Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T09:42:02.240Z",
      "description": "User logged in user 68b3f5beb8c48927f8ee229c"
    },
    {
      "_id": "68b4193ea4148512da7a4c43",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b4193ea4148512da7a4c42",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T09:43:26.041Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:43:26.042Z"
    },
    {
      "_id": "68b41941a4148512da7a4c5d",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41941a4148512da7a4c5c",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T09:43:29.003Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:43:29.004Z"
    },
    {
      "_id": "68b419ed0cb77d81e990a67d",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "update",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2396",
      "before": {
        "_id": "68b3f5c8b8c48927f8ee2396",
        "agentId": "68b3f5c0b8c48927f8ee231b",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "assignedCandidates": [
          "68b3f5c0b8c48927f8ee2331"
        ],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "Secondary agent handling specialized roles and backup coverage.",
        "assignedAt": "2025-08-31T07:12:08.244Z",
        "createdAt": "2025-08-31T07:12:08.244Z",
        "updatedAt": "2025-08-31T07:12:08.244Z",
        "__v": 0,
        "hrCount": 1,
        "candidateCount": 1,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2396"
      },
      "after": {
        "_id": "68b3f5c8b8c48927f8ee2396",
        "agentId": "68b3f5c0b8c48927f8ee231b",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "assignedCandidates": [
          "68b3f5c0b8c48927f8ee2331"
        ],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.244Z",
        "createdAt": "2025-08-31T07:12:08.244Z",
        "updatedAt": "2025-08-31T09:46:21.923Z",
        "__v": 0,
        "hrCount": 1,
        "candidateCount": 1,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2396"
      },
      "metadata": {
        "agentId": "68b3f5c0b8c48927f8ee231b",
        "hrCount": 1,
        "candidateCount": 1
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T09:46:21.998Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [
        {
          "field": "notes",
          "oldValue": "Secondary agent handling specialized roles and backup coverage.",
          "newValue": "",
          "dataType": "string"
        },
        {
          "field": "updatedAt",
          "oldValue": "2025-08-31T07:12:08.244Z",
          "newValue": "2025-08-31T09:46:21.923Z",
          "dataType": "object"
        }
      ],
      "retentionUntil": "2026-08-31T09:46:22.004Z",
      "description": "User updated agentassignment 68b3f5c8b8c48927f8ee2396"
    },
    {
      "_id": "68b419ee0cb77d81e990a688",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b419ee0cb77d81e990a687",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T09:46:22.338Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:46:22.338Z"
    },
    {
      "_id": "68b419f50cb77d81e990a692",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "update",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2396",
      "before": {
        "_id": "68b3f5c8b8c48927f8ee2396",
        "agentId": "68b3f5c0b8c48927f8ee231b",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "assignedCandidates": [
          "68b3f5c0b8c48927f8ee2331"
        ],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.244Z",
        "createdAt": "2025-08-31T07:12:08.244Z",
        "updatedAt": "2025-08-31T09:46:21.923Z",
        "__v": 0,
        "hrCount": 1,
        "candidateCount": 1,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2396"
      },
      "after": {
        "_id": "68b3f5c8b8c48927f8ee2396",
        "agentId": "68b3f5c0b8c48927f8ee231b",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "assignedCandidates": [
          "68b3f5c0b8c48927f8ee2331"
        ],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.244Z",
        "createdAt": "2025-08-31T07:12:08.244Z",
        "updatedAt": "2025-08-31T09:46:21.923Z",
        "__v": 0,
        "hrCount": 1,
        "candidateCount": 1,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2396"
      },
      "metadata": {
        "agentId": "68b3f5c0b8c48927f8ee231b",
        "hrCount": 1,
        "candidateCount": 1
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T09:46:29.243Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2026-08-31T09:46:29.244Z",
      "description": "User updated agentassignment 68b3f5c8b8c48927f8ee2396"
    },
    {
      "_id": "68b419f50cb77d81e990a69d",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b419f50cb77d81e990a69c",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T09:46:29.557Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:46:29.557Z"
    },
    {
      "_id": "68b41af40cb77d81e990a745",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "update",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": {
        "_id": "68b3f5c8b8c48927f8ee2393",
        "agentId": "68b3f5bfb8c48927f8ee2304",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22ba",
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "assignedCandidates": [
          "68b3f5c0b8c48927f8ee232b",
          "68b3f5c0b8c48927f8ee2331"
        ],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "Primary agent handling TechCorp and GrowthStart accounts with experienced developers.",
        "assignedAt": "2025-08-31T07:12:08.106Z",
        "createdAt": "2025-08-31T07:12:08.107Z",
        "updatedAt": "2025-08-31T07:12:08.107Z",
        "__v": 0,
        "hrCount": 2,
        "candidateCount": 2,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2393"
      },
      "after": {
        "_id": "68b3f5c8b8c48927f8ee2393",
        "agentId": "68b3f5bfb8c48927f8ee2304",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22ba",
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "assignedCandidates": [
          "68b3f5c0b8c48927f8ee232b",
          "68b3f5c0b8c48927f8ee2331"
        ],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.106Z",
        "createdAt": "2025-08-31T07:12:08.107Z",
        "updatedAt": "2025-08-31T09:50:44.384Z",
        "__v": 0,
        "hrCount": 2,
        "candidateCount": 2,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2393"
      },
      "metadata": {
        "agentId": "68b3f5bfb8c48927f8ee2304",
        "hrCount": 2,
        "candidateCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T09:50:44.478Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [
        {
          "field": "notes",
          "oldValue": "Primary agent handling TechCorp and GrowthStart accounts with experienced developers.",
          "newValue": "",
          "dataType": "string"
        },
        {
          "field": "updatedAt",
          "oldValue": "2025-08-31T07:12:08.107Z",
          "newValue": "2025-08-31T09:50:44.384Z",
          "dataType": "object"
        }
      ],
      "retentionUntil": "2026-08-31T09:50:44.479Z",
      "description": "User updated agentassignment 68b3f5c8b8c48927f8ee2393"
    },
    {
      "_id": "68b41af40cb77d81e990a750",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41af40cb77d81e990a74f",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T09:50:44.788Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:50:44.789Z"
    },
    {
      "_id": "68b41af80cb77d81e990a76a",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41af80cb77d81e990a769",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T09:50:48.828Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:50:48.829Z"
    },
    {
      "_id": "68b41aff0cb77d81e990a776",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "update",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": {
        "_id": "68b3f5c8b8c48927f8ee2393",
        "agentId": "68b3f5bfb8c48927f8ee2304",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22ba",
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "assignedCandidates": [
          "68b3f5c0b8c48927f8ee232b",
          "68b3f5c0b8c48927f8ee2331"
        ],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.106Z",
        "createdAt": "2025-08-31T07:12:08.107Z",
        "updatedAt": "2025-08-31T09:50:44.384Z",
        "__v": 0,
        "hrCount": 2,
        "candidateCount": 2,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2393"
      },
      "after": {
        "_id": "68b3f5c8b8c48927f8ee2393",
        "agentId": "68b3f5bfb8c48927f8ee2304",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22ba",
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "assignedCandidates": [
          "68b3f5c0b8c48927f8ee232b",
          "68b3f5c0b8c48927f8ee2331"
        ],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.106Z",
        "createdAt": "2025-08-31T07:12:08.107Z",
        "updatedAt": "2025-08-31T09:50:44.384Z",
        "__v": 0,
        "hrCount": 2,
        "candidateCount": 2,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2393"
      },
      "metadata": {
        "agentId": "68b3f5bfb8c48927f8ee2304",
        "hrCount": 2,
        "candidateCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T09:50:55.177Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2026-08-31T09:50:55.178Z",
      "description": "User updated agentassignment 68b3f5c8b8c48927f8ee2393"
    },
    {
      "_id": "68b41aff0cb77d81e990a781",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41aff0cb77d81e990a780",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T09:50:55.523Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:50:55.524Z"
    },
    {
      "_id": "68b41b000cb77d81e990a79b",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41b000cb77d81e990a79a",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T09:50:56.718Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:50:56.720Z"
    },
    {
      "_id": "68b41b6e0cb77d81e990a7a0",
      "actor": "68b3f5c0b8c48927f8ee232b",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5c0b8c48927f8ee232b",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T09:52:45.974Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T09:52:46.047Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T09:52:46.047Z",
      "description": "User logged in user 68b3f5c0b8c48927f8ee232b"
    },
    {
      "_id": "68b41b7d0cb77d81e990a7b9",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5beb8c48927f8ee229c",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T09:53:01.347Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T09:53:01.436Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T09:53:01.436Z",
      "description": "User logged in user 68b3f5beb8c48927f8ee229c"
    },
    {
      "_id": "68b41b870cb77d81e990a7d1",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41b870cb77d81e990a7d0",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T09:53:11.873Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:53:11.874Z"
    },
    {
      "_id": "68b41b900cb77d81e990a7f1",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41b900cb77d81e990a7f0",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T09:53:20.632Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:53:20.632Z"
    },
    {
      "_id": "68b41bb80cb77d81e990a809",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41bb80cb77d81e990a808",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T09:54:00.581Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:54:00.582Z"
    },
    {
      "_id": "68b41be00cb77d81e990a821",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41be00cb77d81e990a820",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T09:54:40.515Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:54:40.516Z"
    },
    {
      "_id": "68b41bed0cb77d81e990a839",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41bed0cb77d81e990a838",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T09:54:53.075Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:54:53.076Z"
    },
    {
      "_id": "68b41bfb0cb77d81e990a851",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41bfb0cb77d81e990a850",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T09:55:07.529Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:55:07.530Z"
    },
    {
      "_id": "68b41c080cb77d81e990a869",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41c080cb77d81e990a868",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T09:55:20.516Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:55:20.517Z"
    },
    {
      "_id": "68b41c0a0cb77d81e990a881",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41c0a0cb77d81e990a880",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T09:55:22.310Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:55:22.311Z"
    },
    {
      "_id": "68b41c0e0cb77d81e990a88f",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "update",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": {
        "_id": "68b3f5c8b8c48927f8ee2393",
        "agentId": "68b3f5bfb8c48927f8ee2304",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22ba",
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "assignedCandidates": [
          "68b3f5c0b8c48927f8ee232b",
          "68b3f5c0b8c48927f8ee2331"
        ],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.106Z",
        "createdAt": "2025-08-31T07:12:08.107Z",
        "updatedAt": "2025-08-31T09:50:44.384Z",
        "__v": 0,
        "hrCount": 2,
        "candidateCount": 2,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2393"
      },
      "after": {
        "_id": "68b3f5c8b8c48927f8ee2393",
        "agentId": "68b3f5bfb8c48927f8ee2304",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22ba",
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "assignedCandidates": [
          "68b3f5c0b8c48927f8ee232b",
          "68b3f5c0b8c48927f8ee2331"
        ],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.106Z",
        "createdAt": "2025-08-31T07:12:08.107Z",
        "updatedAt": "2025-08-31T09:50:44.384Z",
        "__v": 0,
        "hrCount": 2,
        "candidateCount": 2,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2393"
      },
      "metadata": {
        "agentId": "68b3f5bfb8c48927f8ee2304",
        "hrCount": 2,
        "candidateCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T09:55:26.526Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2026-08-31T09:55:26.527Z",
      "description": "User updated agentassignment 68b3f5c8b8c48927f8ee2393"
    },
    {
      "_id": "68b41c0e0cb77d81e990a89b",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41c0e0cb77d81e990a89a",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T09:55:26.892Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:55:26.893Z"
    },
    {
      "_id": "68b41c180cb77d81e990a8a9",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "update",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": {
        "_id": "68b3f5c8b8c48927f8ee2393",
        "agentId": "68b3f5bfb8c48927f8ee2304",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22ba",
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "assignedCandidates": [
          "68b3f5c0b8c48927f8ee232b",
          "68b3f5c0b8c48927f8ee2331"
        ],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.106Z",
        "createdAt": "2025-08-31T07:12:08.107Z",
        "updatedAt": "2025-08-31T09:50:44.384Z",
        "__v": 0,
        "hrCount": 2,
        "candidateCount": 2,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2393"
      },
      "after": {
        "_id": "68b3f5c8b8c48927f8ee2393",
        "agentId": "68b3f5bfb8c48927f8ee2304",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22ba",
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "assignedCandidates": [
          "68b3f5c0b8c48927f8ee232b",
          "68b3f5c0b8c48927f8ee2331"
        ],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.106Z",
        "createdAt": "2025-08-31T07:12:08.107Z",
        "updatedAt": "2025-08-31T09:50:44.384Z",
        "__v": 0,
        "hrCount": 2,
        "candidateCount": 2,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2393"
      },
      "metadata": {
        "agentId": "68b3f5bfb8c48927f8ee2304",
        "hrCount": 2,
        "candidateCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T09:55:36.199Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2026-08-31T09:55:36.201Z",
      "description": "User updated agentassignment 68b3f5c8b8c48927f8ee2393"
    },
    {
      "_id": "68b41c180cb77d81e990a8b5",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41c180cb77d81e990a8b4",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T09:55:36.520Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:55:36.521Z"
    },
    {
      "_id": "68b41c310cb77d81e990a8cd",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41c310cb77d81e990a8cc",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T09:56:01.110Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:56:01.111Z"
    },
    {
      "_id": "68b41c480cb77d81e990a8d6",
      "actor": "68b3f5c0b8c48927f8ee231b",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5c0b8c48927f8ee231b",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T09:56:24.756Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T09:56:24.845Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T09:56:24.845Z",
      "description": "User logged in user 68b3f5c0b8c48927f8ee231b"
    },
    {
      "_id": "68b41c5d0cb77d81e990a8f7",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41c5d0cb77d81e990a8f6",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T09:56:45.965Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:56:45.967Z"
    },
    {
      "_id": "68b41d116f1242be7734cf7d",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5beb8c48927f8ee229c",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T09:59:45.808Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T09:59:45.889Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T09:59:45.892Z",
      "description": "User logged in user 68b3f5beb8c48927f8ee229c"
    },
    {
      "_id": "68b41d146f1242be7734cf99",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41d146f1242be7734cf98",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T09:59:48.844Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T09:59:48.845Z"
    },
    {
      "_id": "68b41df16f1242be7734cfa3",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5beb8c48927f8ee229c",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T10:03:28.980Z"
      },
      "ipAddress": "::1",
      "userAgent": "curl/8.7.1",
      "timestamp": "2025-08-31T10:03:29.081Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T10:03:29.082Z",
      "description": "User logged in user 68b3f5beb8c48927f8ee229c"
    },
    {
      "_id": "68b41dfb6f1242be7734cfb1",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41dfb6f1242be7734cfb0",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "curl/8.7.1",
      "timestamp": "2025-08-31T10:03:39.600Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T10:03:39.600Z"
    },
    {
      "_id": "68b41fe8431dd3ce165d28e4",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41fe8431dd3ce165d28e3",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T10:11:52.038Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T10:11:52.042Z"
    },
    {
      "_id": "68b41fee431dd3ce165d28f4",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "update",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2396",
      "before": {
        "_id": "68b3f5c8b8c48927f8ee2396",
        "agentId": "68b3f5c0b8c48927f8ee231b",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "assignedCandidates": [
          "68b3f5c0b8c48927f8ee2331"
        ],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.244Z",
        "createdAt": "2025-08-31T07:12:08.244Z",
        "updatedAt": "2025-08-31T09:46:21.923Z",
        "__v": 0,
        "hrCount": 1,
        "candidateCount": 1,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2396"
      },
      "after": {
        "_id": "68b3f5c8b8c48927f8ee2396",
        "agentId": "68b3f5c0b8c48927f8ee231b",
        "assignedHRs": [],
        "assignedCandidates": [],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.244Z",
        "createdAt": "2025-08-31T07:12:08.244Z",
        "updatedAt": "2025-08-31T10:11:58.604Z",
        "__v": 1,
        "hrCount": 0,
        "candidateCount": 0,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2396"
      },
      "metadata": {
        "reason": "resource_reassignment",
        "removedHRs": [
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "removedCandidates": [
          "68b3f5c0b8c48927f8ee2331"
        ]
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T10:11:58.678Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [
        {
          "field": "assignedHRs",
          "oldValue": [
            "68b3f5bfb8c48927f8ee22e0"
          ],
          "newValue": [],
          "dataType": "object"
        },
        {
          "field": "assignedCandidates",
          "oldValue": [
            "68b3f5c0b8c48927f8ee2331"
          ],
          "newValue": [],
          "dataType": "object"
        },
        {
          "field": "updatedAt",
          "oldValue": "2025-08-31T09:46:21.923Z",
          "newValue": "2025-08-31T10:11:58.604Z",
          "dataType": "object"
        },
        {
          "field": "__v",
          "oldValue": 0,
          "newValue": 1,
          "dataType": "number"
        },
        {
          "field": "hrCount",
          "oldValue": 1,
          "newValue": 0,
          "dataType": "number"
        },
        {
          "field": "candidateCount",
          "oldValue": 1,
          "newValue": 0,
          "dataType": "number"
        }
      ],
      "retentionUntil": "2026-08-31T10:11:58.680Z",
      "description": "User updated agentassignment 68b3f5c8b8c48927f8ee2396"
    },
    {
      "_id": "68b41fee431dd3ce165d28f8",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "update",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": {
        "_id": "68b3f5c8b8c48927f8ee2393",
        "agentId": "68b3f5bfb8c48927f8ee2304",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22ba",
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "assignedCandidates": [
          "68b3f5c0b8c48927f8ee232b",
          "68b3f5c0b8c48927f8ee2331"
        ],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.106Z",
        "createdAt": "2025-08-31T07:12:08.107Z",
        "updatedAt": "2025-08-31T09:50:44.384Z",
        "__v": 0,
        "hrCount": 2,
        "candidateCount": 2,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2393"
      },
      "after": {
        "_id": "68b3f5c8b8c48927f8ee2393",
        "agentId": "68b3f5bfb8c48927f8ee2304",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22ba",
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "assignedCandidates": [
          "68b3f5c0b8c48927f8ee232b",
          "68b3f5c0b8c48927f8ee2331"
        ],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.106Z",
        "createdAt": "2025-08-31T07:12:08.107Z",
        "updatedAt": "2025-08-31T09:50:44.384Z",
        "__v": 0,
        "hrCount": 2,
        "candidateCount": 2,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2393"
      },
      "metadata": {
        "agentId": "68b3f5bfb8c48927f8ee2304",
        "hrCount": 2,
        "candidateCount": 2
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T10:11:58.915Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2026-08-31T10:11:58.917Z",
      "description": "User updated agentassignment 68b3f5c8b8c48927f8ee2393"
    },
    {
      "_id": "68b41fef431dd3ce165d2906",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41fef431dd3ce165d2905",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T10:11:59.275Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T10:11:59.276Z"
    },
    {
      "_id": "68b41ff6431dd3ce165d2913",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "update",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": {
        "_id": "68b3f5c8b8c48927f8ee2393",
        "agentId": "68b3f5bfb8c48927f8ee2304",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22ba",
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "assignedCandidates": [
          "68b3f5c0b8c48927f8ee232b",
          "68b3f5c0b8c48927f8ee2331"
        ],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.106Z",
        "createdAt": "2025-08-31T07:12:08.107Z",
        "updatedAt": "2025-08-31T09:50:44.384Z",
        "__v": 0,
        "hrCount": 2,
        "candidateCount": 2,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2393"
      },
      "after": {
        "_id": "68b3f5c8b8c48927f8ee2393",
        "agentId": "68b3f5bfb8c48927f8ee2304",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22ba"
        ],
        "assignedCandidates": [
          "68b3f5c0b8c48927f8ee232b",
          "68b3f5c0b8c48927f8ee2331"
        ],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.106Z",
        "createdAt": "2025-08-31T07:12:08.107Z",
        "updatedAt": "2025-08-31T10:12:06.764Z",
        "__v": 1,
        "hrCount": 1,
        "candidateCount": 2,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2393"
      },
      "metadata": {
        "reason": "resource_reassignment",
        "removedHRs": [
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "removedCandidates": []
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T10:12:06.841Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [
        {
          "field": "assignedHRs",
          "oldValue": [
            "68b3f5bfb8c48927f8ee22ba",
            "68b3f5bfb8c48927f8ee22e0"
          ],
          "newValue": [
            "68b3f5bfb8c48927f8ee22ba"
          ],
          "dataType": "object"
        },
        {
          "field": "updatedAt",
          "oldValue": "2025-08-31T09:50:44.384Z",
          "newValue": "2025-08-31T10:12:06.764Z",
          "dataType": "object"
        },
        {
          "field": "__v",
          "oldValue": 0,
          "newValue": 1,
          "dataType": "number"
        },
        {
          "field": "hrCount",
          "oldValue": 2,
          "newValue": 1,
          "dataType": "number"
        }
      ],
      "retentionUntil": "2026-08-31T10:12:06.843Z",
      "description": "User updated agentassignment 68b3f5c8b8c48927f8ee2393"
    },
    {
      "_id": "68b41ff7431dd3ce165d2917",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "update",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2396",
      "before": {
        "_id": "68b3f5c8b8c48927f8ee2396",
        "agentId": "68b3f5c0b8c48927f8ee231b",
        "assignedHRs": [],
        "assignedCandidates": [],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.244Z",
        "createdAt": "2025-08-31T07:12:08.244Z",
        "updatedAt": "2025-08-31T10:11:58.604Z",
        "__v": 1,
        "hrCount": 0,
        "candidateCount": 0,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2396"
      },
      "after": {
        "_id": "68b3f5c8b8c48927f8ee2396",
        "agentId": "68b3f5c0b8c48927f8ee231b",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "assignedCandidates": [],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.244Z",
        "createdAt": "2025-08-31T07:12:08.244Z",
        "updatedAt": "2025-08-31T10:12:06.998Z",
        "__v": 2,
        "hrCount": 1,
        "candidateCount": 0,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2396"
      },
      "metadata": {
        "agentId": "68b3f5c0b8c48927f8ee231b",
        "hrCount": 1,
        "candidateCount": 0
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T10:12:07.083Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [
        {
          "field": "assignedHRs",
          "oldValue": [],
          "newValue": [
            "68b3f5bfb8c48927f8ee22e0"
          ],
          "dataType": "object"
        },
        {
          "field": "updatedAt",
          "oldValue": "2025-08-31T10:11:58.604Z",
          "newValue": "2025-08-31T10:12:06.998Z",
          "dataType": "object"
        },
        {
          "field": "__v",
          "oldValue": 1,
          "newValue": 2,
          "dataType": "number"
        },
        {
          "field": "hrCount",
          "oldValue": 0,
          "newValue": 1,
          "dataType": "number"
        }
      ],
      "retentionUntil": "2026-08-31T10:12:07.084Z",
      "description": "User updated agentassignment 68b3f5c8b8c48927f8ee2396"
    },
    {
      "_id": "68b41ff7431dd3ce165d2925",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b41ff7431dd3ce165d2924",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T10:12:07.611Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T10:12:07.612Z"
    },
    {
      "_id": "68b42001431dd3ce165d2933",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "update",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": {
        "_id": "68b3f5c8b8c48927f8ee2393",
        "agentId": "68b3f5bfb8c48927f8ee2304",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22ba"
        ],
        "assignedCandidates": [
          "68b3f5c0b8c48927f8ee232b",
          "68b3f5c0b8c48927f8ee2331"
        ],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.106Z",
        "createdAt": "2025-08-31T07:12:08.107Z",
        "updatedAt": "2025-08-31T10:12:06.764Z",
        "__v": 1,
        "hrCount": 1,
        "candidateCount": 2,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2393"
      },
      "after": {
        "_id": "68b3f5c8b8c48927f8ee2393",
        "agentId": "68b3f5bfb8c48927f8ee2304",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22ba"
        ],
        "assignedCandidates": [
          "68b3f5c0b8c48927f8ee232b"
        ],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.106Z",
        "createdAt": "2025-08-31T07:12:08.107Z",
        "updatedAt": "2025-08-31T10:12:17.028Z",
        "__v": 2,
        "hrCount": 1,
        "candidateCount": 1,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2393"
      },
      "metadata": {
        "reason": "resource_reassignment",
        "removedHRs": [],
        "removedCandidates": [
          "68b3f5c0b8c48927f8ee2331"
        ]
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T10:12:17.129Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [
        {
          "field": "assignedCandidates",
          "oldValue": [
            "68b3f5c0b8c48927f8ee232b",
            "68b3f5c0b8c48927f8ee2331"
          ],
          "newValue": [
            "68b3f5c0b8c48927f8ee232b"
          ],
          "dataType": "object"
        },
        {
          "field": "updatedAt",
          "oldValue": "2025-08-31T10:12:06.764Z",
          "newValue": "2025-08-31T10:12:17.028Z",
          "dataType": "object"
        },
        {
          "field": "__v",
          "oldValue": 1,
          "newValue": 2,
          "dataType": "number"
        },
        {
          "field": "candidateCount",
          "oldValue": 2,
          "newValue": 1,
          "dataType": "number"
        }
      ],
      "retentionUntil": "2026-08-31T10:12:17.131Z",
      "description": "User updated agentassignment 68b3f5c8b8c48927f8ee2393"
    },
    {
      "_id": "68b42001431dd3ce165d2937",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "update",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2396",
      "before": {
        "_id": "68b3f5c8b8c48927f8ee2396",
        "agentId": "68b3f5c0b8c48927f8ee231b",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "assignedCandidates": [],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.244Z",
        "createdAt": "2025-08-31T07:12:08.244Z",
        "updatedAt": "2025-08-31T10:12:06.998Z",
        "__v": 2,
        "hrCount": 1,
        "candidateCount": 0,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2396"
      },
      "after": {
        "_id": "68b3f5c8b8c48927f8ee2396",
        "agentId": "68b3f5c0b8c48927f8ee231b",
        "assignedHRs": [
          "68b3f5bfb8c48927f8ee22e0"
        ],
        "assignedCandidates": [
          "68b3f5c0b8c48927f8ee2331"
        ],
        "assignedBy": "68b3f5beb8c48927f8ee229c",
        "status": "active",
        "notes": "",
        "assignedAt": "2025-08-31T07:12:08.244Z",
        "createdAt": "2025-08-31T07:12:08.244Z",
        "updatedAt": "2025-08-31T10:12:17.311Z",
        "__v": 3,
        "hrCount": 1,
        "candidateCount": 1,
        "isActive": true,
        "id": "68b3f5c8b8c48927f8ee2396"
      },
      "metadata": {
        "agentId": "68b3f5c0b8c48927f8ee231b",
        "hrCount": 1,
        "candidateCount": 1
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T10:12:17.397Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [
        {
          "field": "assignedCandidates",
          "oldValue": [],
          "newValue": [
            "68b3f5c0b8c48927f8ee2331"
          ],
          "dataType": "object"
        },
        {
          "field": "updatedAt",
          "oldValue": "2025-08-31T10:12:06.998Z",
          "newValue": "2025-08-31T10:12:17.311Z",
          "dataType": "object"
        },
        {
          "field": "__v",
          "oldValue": 2,
          "newValue": 3,
          "dataType": "number"
        },
        {
          "field": "candidateCount",
          "oldValue": 0,
          "newValue": 1,
          "dataType": "number"
        }
      ],
      "retentionUntil": "2026-08-31T10:12:17.398Z",
      "description": "User updated agentassignment 68b3f5c8b8c48927f8ee2396"
    },
    {
      "_id": "68b42001431dd3ce165d2945",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b42001431dd3ce165d2944",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T10:12:17.765Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T10:12:17.766Z"
    },
    {
      "_id": "68b42027431dd3ce165d294c",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5bfb8c48927f8ee2304",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T10:12:55.578Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T10:12:55.647Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T10:12:55.647Z",
      "description": "User logged in user 68b3f5bfb8c48927f8ee2304"
    },
    {
      "_id": "68b4204b431dd3ce165d2977",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T10:13:31.724Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T10:13:31.724Z"
    },
    {
      "_id": "68b42051431dd3ce165d2982",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T10:13:37.834Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T10:13:37.835Z"
    },
    {
      "_id": "68b42056431dd3ce165d299d",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T10:13:42.408Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T10:13:42.408Z"
    },
    {
      "_id": "68b4216f48a799b2f250f94e",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T10:18:23.971Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T10:18:23.977Z"
    },
    {
      "_id": "68b4217148a799b2f250f970",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T10:18:25.161Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T10:18:25.162Z"
    },
    {
      "_id": "68b42197083507b5e5e68aee",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T10:19:03.014Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T10:19:03.021Z"
    },
    {
      "_id": "68b421eccdbbb21c784a9293",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T10:20:28.959Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T10:20:28.966Z"
    },
    {
      "_id": "68b4220ecdbbb21c784a929e",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T10:21:02.788Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T10:21:02.790Z"
    },
    {
      "_id": "68b42214cdbbb21c784a92a9",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T10:21:08.180Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T10:21:08.182Z"
    },
    {
      "_id": "68b42226cdbbb21c784a92b2",
      "actor": "68b3f5bfb8c48927f8ee22ba",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5bfb8c48927f8ee22ba",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T10:21:26.517Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T10:21:26.601Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T10:21:26.602Z",
      "description": "User logged in user 68b3f5bfb8c48927f8ee22ba"
    },
    {
      "_id": "68b423b98692f993d57025f5",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5beb8c48927f8ee229c",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T10:28:09.311Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T10:28:09.443Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T10:28:09.446Z",
      "description": "User logged in user 68b3f5beb8c48927f8ee229c"
    },
    {
      "_id": "68b423bd8692f993d5702616",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b423bd8692f993d5702615",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list_all",
        "resultCount": 4
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T10:28:13.335Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 4 agent assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T10:28:13.336Z"
    },
    {
      "_id": "68b42454c8d35d4f194fa676",
      "actor": "68b3f5bfb8c48927f8ee22ba",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b42454c8d35d4f194fa675",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedTo": "68b3f5bfb8c48927f8ee22ba"
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T10:30:44.217Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T10:30:44.220Z"
    },
    {
      "_id": "68b4246cc8d35d4f194fa680",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5bfb8c48927f8ee2304",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T10:31:08.187Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T10:31:08.284Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T10:31:08.285Z",
      "description": "User logged in user 68b3f5bfb8c48927f8ee2304"
    },
    {
      "_id": "68b4246fc8d35d4f194fa69f",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T10:31:11.853Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T10:31:11.853Z"
    },
    {
      "_id": "68b42529c8d35d4f194fa6aa",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5beb8c48927f8ee229c",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T10:34:17.178Z"
      },
      "ipAddress": "::1",
      "userAgent": "curl/8.7.1",
      "timestamp": "2025-08-31T10:34:17.273Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T10:34:17.274Z",
      "description": "User logged in user 68b3f5beb8c48927f8ee229c"
    },
    {
      "_id": "68b42546c8d35d4f194fa6bd",
      "actor": "68b3f5beb8c48927f8ee229c",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5beb8c48927f8ee229c",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T10:34:45.964Z"
      },
      "ipAddress": "::1",
      "userAgent": "curl/8.7.1",
      "timestamp": "2025-08-31T10:34:46.094Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T10:34:46.095Z",
      "description": "User logged in user 68b3f5beb8c48927f8ee229c"
    },
    {
      "_id": "68b4255dc8d35d4f194fa6cd",
      "actor": "68b3f5bfb8c48927f8ee22ba",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5bfb8c48927f8ee22ba",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T10:35:09.032Z"
      },
      "ipAddress": "::1",
      "userAgent": "curl/8.7.1",
      "timestamp": "2025-08-31T10:35:09.103Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T10:35:09.103Z",
      "description": "User logged in user 68b3f5bfb8c48927f8ee22ba"
    },
    {
      "_id": "68b4256dc8d35d4f194fa6d4",
      "actor": "68b3f5bfb8c48927f8ee22ba",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5bfb8c48927f8ee22ba",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T10:35:25.240Z"
      },
      "ipAddress": "::1",
      "userAgent": "curl/8.7.1",
      "timestamp": "2025-08-31T10:35:25.331Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T10:35:25.331Z",
      "description": "User logged in user 68b3f5bfb8c48927f8ee22ba"
    },
    {
      "_id": "68b42580c8d35d4f194fa6dd",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5bfb8c48927f8ee2304",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T10:35:44.265Z"
      },
      "ipAddress": "::1",
      "userAgent": "curl/8.7.1",
      "timestamp": "2025-08-31T10:35:44.340Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T10:35:44.340Z",
      "description": "User logged in user 68b3f5bfb8c48927f8ee2304"
    },
    {
      "_id": "68b42600c8d35d4f194fa70c",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T10:37:52.746Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T10:37:52.747Z"
    },
    {
      "_id": "68b42e6ab6ea04f43a44ae16",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5bfb8c48927f8ee2304",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T11:13:46.100Z"
      },
      "ipAddress": "::1",
      "userAgent": "curl/8.7.1",
      "timestamp": "2025-08-31T11:13:46.204Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T11:13:46.207Z",
      "description": "User logged in user 68b3f5bfb8c48927f8ee2304"
    },
    {
      "_id": "68b42f46b6ea04f43a44ae20",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5bfb8c48927f8ee2304",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T11:17:26.526Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:17:26.628Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T11:17:26.628Z",
      "description": "User logged in user 68b3f5bfb8c48927f8ee2304"
    },
    {
      "_id": "68b42f49b6ea04f43a44ae42",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:17:29.780Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:17:29.781Z"
    },
    {
      "_id": "68b42f91b6ea04f43a44ae53",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:18:41.757Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:18:41.758Z"
    },
    {
      "_id": "68b42fa7b6ea04f43a44ae60",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:19:03.465Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:19:03.466Z"
    },
    {
      "_id": "68b42fb0b6ea04f43a44ae6d",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:19:12.389Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:19:12.390Z"
    },
    {
      "_id": "68b42fbfb6ea04f43a44ae7a",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:19:27.953Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:19:27.954Z"
    },
    {
      "_id": "68b42fc0b6ea04f43a44ae9b",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:19:28.331Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:19:28.332Z"
    },
    {
      "_id": "68b42fc3b6ea04f43a44aead",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:19:31.712Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:19:31.713Z"
    },
    {
      "_id": "68b42fd9b6ea04f43a44aeba",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:19:53.371Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:19:53.372Z"
    },
    {
      "_id": "68b42fdeb6ea04f43a44aedb",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:19:58.342Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:19:58.343Z"
    },
    {
      "_id": "68b42feeb6ea04f43a44af03",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:20:14.263Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:20:14.264Z"
    },
    {
      "_id": "68b42ff7b6ea04f43a44af13",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:20:23.338Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:20:23.338Z"
    },
    {
      "_id": "68b42ffcb6ea04f43a44af20",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:20:28.422Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:20:28.422Z"
    },
    {
      "_id": "68b43007b6ea04f43a44af41",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:20:39.223Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:20:39.223Z"
    },
    {
      "_id": "68b4300ab6ea04f43a44af53",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:20:42.534Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:20:42.534Z"
    },
    {
      "_id": "68b43023b6ea04f43a44af75",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:21:07.945Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:21:07.946Z"
    },
    {
      "_id": "68b43027b6ea04f43a44af86",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:21:11.327Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:21:11.327Z"
    },
    {
      "_id": "68b43037b6ea04f43a44afa9",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:21:27.813Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:21:27.813Z"
    },
    {
      "_id": "68b43047b6ea04f43a44afcd",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:21:43.667Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:21:43.668Z"
    },
    {
      "_id": "68b43083b6ea04f43a44afdf",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:22:43.298Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:22:43.300Z"
    },
    {
      "_id": "68b43086b6ea04f43a44aff9",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b43086b6ea04f43a44aff8",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedBy": "68b3f5bfb8c48927f8ee2304"
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:22:46.763Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T11:22:46.763Z"
    },
    {
      "_id": "68b4308cb6ea04f43a44b01b",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:22:52.210Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:22:52.211Z"
    },
    {
      "_id": "68b430e4b6ea04f43a44b02c",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:24:20.748Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:24:20.749Z"
    },
    {
      "_id": "68b430ecb6ea04f43a44b039",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:24:28.870Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:24:28.870Z"
    },
    {
      "_id": "68b43107b6ea04f43a44b041",
      "actor": "68b3f5bfb8c48927f8ee22ba",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5bfb8c48927f8ee22ba",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T11:24:55.440Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T11:24:55.515Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T11:24:55.515Z",
      "description": "User logged in user 68b3f5bfb8c48927f8ee22ba"
    },
    {
      "_id": "68b43153b6ea04f43a44b077",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:26:11.288Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:26:11.288Z"
    },
    {
      "_id": "68b43177b6ea04f43a44b0b2",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:26:47.639Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:26:47.639Z"
    },
    {
      "_id": "68b43192b6ea04f43a44b0c9",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:27:14.993Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:27:14.994Z"
    },
    {
      "_id": "68b43199b6ea04f43a44b0e0",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:27:21.715Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:27:21.716Z"
    },
    {
      "_id": "68b431acb6ea04f43a44b0ff",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:27:40.005Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:27:40.014Z"
    },
    {
      "_id": "68b431c63758cb07dda5bb90",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:28:06.769Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:28:06.774Z"
    },
    {
      "_id": "68b431d23758cb07dda5bba7",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:28:18.755Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:28:18.755Z"
    },
    {
      "_id": "68b431f788130d01fc509302",
      "actor": "68b3f5bfb8c48927f8ee22ba",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5bfb8c48927f8ee22ba",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T11:28:55.261Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T11:28:55.371Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T11:28:55.374Z",
      "description": "User logged in user 68b3f5bfb8c48927f8ee22ba"
    },
    {
      "_id": "68b431fa88130d01fc50931c",
      "actor": "68b3f5bfb8c48927f8ee22ba",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b431fa88130d01fc50931b",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedTo": "68b3f5bfb8c48927f8ee22ba"
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T11:28:58.591Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T11:28:58.592Z"
    },
    {
      "_id": "68b431fe88130d01fc509341",
      "actor": "68b3f5bfb8c48927f8ee22ba",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b431fe88130d01fc509340",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedTo": "68b3f5bfb8c48927f8ee22ba"
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T11:29:02.635Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T11:29:02.636Z"
    },
    {
      "_id": "68b4320f88130d01fc509366",
      "actor": "68b3f5bfb8c48927f8ee22ba",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b4320f88130d01fc509365",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedTo": "68b3f5bfb8c48927f8ee22ba"
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T11:29:19.113Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T11:29:19.115Z"
    },
    {
      "_id": "68b4321e88130d01fc509396",
      "actor": "68b3f5bfb8c48927f8ee22ba",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b4321e88130d01fc509395",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedTo": "68b3f5bfb8c48927f8ee22ba"
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T11:29:34.317Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T11:29:34.318Z"
    },
    {
      "_id": "68b4322988130d01fc5093a3",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:29:45.794Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:29:45.797Z"
    },
    {
      "_id": "68b4322b88130d01fc5093cf",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:29:47.606Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:29:47.606Z"
    },
    {
      "_id": "68b433c188130d01fc509400",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5bfb8c48927f8ee2304",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T11:36:33.327Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:36:33.453Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T11:36:33.453Z",
      "description": "User logged in user 68b3f5bfb8c48927f8ee2304"
    },
    {
      "_id": "68b433c788130d01fc509420",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:36:39.667Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:36:39.667Z"
    },
    {
      "_id": "68b433d388130d01fc509440",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b433d388130d01fc50943f",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedBy": "68b3f5bfb8c48927f8ee2304"
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:36:51.374Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T11:36:51.375Z"
    },
    {
      "_id": "68b433e288130d01fc509466",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b433e288130d01fc509465",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedBy": "68b3f5bfb8c48927f8ee2304"
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:37:06.460Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T11:37:06.463Z"
    },
    {
      "_id": "68b4340088130d01fc50947d",
      "actor": "68b3f5bfb8c48927f8ee22ba",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b4340088130d01fc50947c",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "stats",
        "statsData": {
          "byStatus": [
            {
              "_id": "scheduled",
              "count": 2
            },
            {
              "_id": "completed",
              "count": 1
            },
            {
              "_id": "cancelled",
              "count": 1
            },
            {
              "_id": "confirmed",
              "count": 1
            }
          ],
          "todayCount": 1
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T11:37:36.533Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved interview statistics",
      "changes": [],
      "retentionUntil": "2026-08-31T11:37:36.533Z"
    },
    {
      "_id": "68b4340088130d01fc509483",
      "actor": "68b3f5bfb8c48927f8ee22ba",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b4340088130d01fc509482",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 5
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T11:37:36.936Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 5 interviews",
      "changes": [],
      "retentionUntil": "2026-08-31T11:37:36.937Z"
    },
    {
      "_id": "68b4359188130d01fc5095de",
      "actor": "68b3f5bfb8c48927f8ee22ba",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5bfb8c48927f8ee22ba",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T11:44:17.677Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T11:44:17.772Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T11:44:17.773Z",
      "description": "User logged in user 68b3f5bfb8c48927f8ee22ba"
    },
    {
      "_id": "68b4370588130d01fc5097c9",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:50:29.131Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:50:29.132Z"
    },
    {
      "_id": "68b4371588130d01fc5097d9",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:50:45.341Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:50:45.341Z"
    },
    {
      "_id": "68b4371988130d01fc5097e5",
      "actor": "68b3f5c0b8c48927f8ee232b",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5c0b8c48927f8ee232b",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T11:50:49.645Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:50:49.731Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T11:50:49.731Z",
      "description": "User logged in user 68b3f5c0b8c48927f8ee232b"
    },
    {
      "_id": "68b4374288130d01fc509807",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5bfb8c48927f8ee2304",
      "before": null,
      "after": null,
      "metadata": {
        "success": false,
        "reason": "invalid_password"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:51:30.903Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": false,
      "errorMessage": "Invalid password",
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T11:51:30.903Z",
      "description": "User logged in user 68b3f5bfb8c48927f8ee2304"
    },
    {
      "_id": "68b4374788130d01fc50980f",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5bfb8c48927f8ee2304",
      "before": null,
      "after": null,
      "metadata": {
        "success": false,
        "reason": "invalid_password"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:51:35.403Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": false,
      "errorMessage": "Invalid password",
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T11:51:35.403Z",
      "description": "User logged in user 68b3f5bfb8c48927f8ee2304"
    },
    {
      "_id": "68b4375788130d01fc509819",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5bfb8c48927f8ee2304",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T11:51:51.536Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:51:51.619Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T11:51:51.619Z",
      "description": "User logged in user 68b3f5bfb8c48927f8ee2304"
    },
    {
      "_id": "68b4375a88130d01fc509839",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:51:54.455Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:51:54.456Z"
    },
    {
      "_id": "68b4377088130d01fc509859",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "create",
      "entityType": "CandidateAssignment",
      "entityId": "68b4377088130d01fc509858",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 3,
        "filter": {
          "assignedBy": "68b3f5bfb8c48927f8ee2304"
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:52:16.247Z",
      "riskLevel": "low",
      "businessProcess": "candidate_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 3 candidate assignments",
      "changes": [],
      "retentionUntil": "2026-08-31T11:52:16.249Z"
    },
    {
      "_id": "68b4377988130d01fc509879",
      "actor": "68b3f5bfb8c48927f8ee2304",
      "action": "read",
      "entityType": "AgentAssignment",
      "entityId": "68b3f5c8b8c48927f8ee2393",
      "before": null,
      "after": null,
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "timestamp": "2025-08-31T11:52:25.524Z",
      "riskLevel": "low",
      "businessProcess": "agent_management",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved current agent assignment details",
      "changes": [],
      "retentionUntil": "2026-08-31T11:52:25.525Z"
    },
    {
      "_id": "68b4378388130d01fc509896",
      "actor": "68b3f5bfb8c48927f8ee22ba",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b4378388130d01fc509895",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "stats",
        "statsData": {
          "byStatus": [
            {
              "_id": "scheduled",
              "count": 2
            },
            {
              "_id": "completed",
              "count": 1
            },
            {
              "_id": "cancelled",
              "count": 1
            },
            {
              "_id": "confirmed",
              "count": 1
            }
          ],
          "todayCount": 1
        }
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T11:52:35.486Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved interview statistics",
      "changes": [],
      "retentionUntil": "2026-08-31T11:52:35.487Z"
    },
    {
      "_id": "68b4378388130d01fc50989c",
      "actor": "68b3f5bfb8c48927f8ee22ba",
      "action": "create",
      "entityType": "Interview",
      "entityId": "68b4378388130d01fc50989b",
      "before": null,
      "after": null,
      "metadata": {
        "queryType": "list",
        "resultCount": 5
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T11:52:35.722Z",
      "riskLevel": "low",
      "businessProcess": "interview_scheduling",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "description": "Retrieved 5 interviews",
      "changes": [],
      "retentionUntil": "2026-08-31T11:52:35.723Z"
    },
    {
      "_id": "68b4392b7944956584143ab2",
      "actor": "68b3f5bfb8c48927f8ee22ba",
      "action": "login",
      "entityType": "User",
      "entityId": "68b3f5bfb8c48927f8ee22ba",
      "before": null,
      "after": null,
      "metadata": {
        "success": true,
        "lastLogin": "2025-08-31T11:59:39.343Z"
      },
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
      "timestamp": "2025-08-31T11:59:39.574Z",
      "riskLevel": "medium",
      "businessProcess": "authentication",
      "complianceCategory": "general",
      "systemInfo": {
        "application": "hire-accel-api",
        "version": "1.0.0",
        "environment": "development"
      },
      "success": true,
      "tags": [],
      "changes": [],
      "retentionUntil": "2032-08-29T11:59:39.580Z",
      "description": "User logged in user 68b3f5bfb8c48927f8ee22ba"
    }
  ],
  "tasks": [
    {
      "_id": "68b1ac6c83002d9799564873",
      "title": "Review candidate profiles for React position",
      "description": "Screen and evaluate incoming candidate applications for the Senior React Developer role",
      "assignedTo": "68b1ac6a83002d97995647b4",
      "relatedEntity": {
        "type": "job",
        "id": "68b1ac6b83002d9799564837"
      },
      "status": "in_progress",
      "priority": "high",
      "dueDate": "2025-08-31T13:34:36.777Z",
      "checklist": [
        {
          "id": "1",
          "text": "Review technical skills alignment",
          "completed": true
        },
        {
          "id": "2",
          "text": "Check experience level",
          "completed": true
        },
        {
          "id": "3",
          "text": "Verify salary expectations",
          "completed": false
        }
      ],
      "createdBy": "68b1ac6a83002d9799564808",
      "category": "recruitment",
      "tags": [
        "urgent",
        "technical-review"
      ],
      "estimatedHours": 4,
      "recurring": {
        "enabled": false
      },
      "attachments": [],
      "notes": [],
      "timeEntries": [],
      "dependencies": [],
      "createdAt": "2025-08-29T13:34:36.801Z",
      "updatedAt": "2025-08-29T13:34:36.801Z"
    },
    {
      "_id": "68b1ac6c83002d9799564876",
      "title": "Source candidates for Data Science position",
      "description": "Find and reach out to qualified data scientists for the open position at InnovateInc",
      "assignedTo": "68b1ac6a83002d9799564808",
      "relatedEntity": {
        "type": "job",
        "id": "68b1ac6b83002d979956483a"
      },
      "status": "todo",
      "priority": "medium",
      "dueDate": "2025-09-03T13:34:36.777Z",
      "checklist": [
        {
          "id": "1",
          "text": "Search LinkedIn for candidates",
          "completed": false
        },
        {
          "id": "2",
          "text": "Contact university career centers",
          "completed": false
        },
        {
          "id": "3",
          "text": "Post on specialized job boards",
          "completed": false
        }
      ],
      "createdBy": "68b1ac6a83002d97995647b4",
      "category": "recruitment",
      "tags": [
        "sourcing",
        "data-science"
      ],
      "estimatedHours": 8,
      "recurring": {
        "enabled": false
      },
      "attachments": [],
      "notes": [],
      "timeEntries": [],
      "dependencies": [],
      "createdAt": "2025-08-29T13:34:36.850Z",
      "updatedAt": "2025-08-29T13:34:36.850Z"
    },
    {
      "_id": "68b1ac6c83002d9799564879",
      "title": "Schedule interviews for shortlisted candidates",
      "description": "Coordinate interview schedules for candidates who passed initial screening",
      "assignedTo": "68b1ac6a83002d97995647e8",
      "relatedEntity": {
        "type": "application",
        "id": "68b1ac6c83002d979956484e"
      },
      "status": "completed",
      "priority": "high",
      "dueDate": "2025-08-30T13:34:36.777Z",
      "checklist": [
        {
          "id": "1",
          "text": "Contact top 3 candidates",
          "completed": true
        },
        {
          "id": "2",
          "text": "Book interview rooms",
          "completed": true
        },
        {
          "id": "3",
          "text": "Send calendar invites",
          "completed": true
        }
      ],
      "createdBy": "68b1ac6b83002d979956481c",
      "completedAt": "2025-08-28T13:34:36.777Z",
      "category": "interview",
      "tags": [
        "scheduling",
        "interviews"
      ],
      "estimatedHours": 2,
      "actualHours": 1.5,
      "recurring": {
        "enabled": false
      },
      "attachments": [],
      "notes": [],
      "timeEntries": [],
      "dependencies": [],
      "createdAt": "2025-08-29T13:34:36.896Z",
      "updatedAt": "2025-08-29T13:34:36.896Z"
    },
    {
      "_id": "68b1ac6c83002d979956487c",
      "title": "Update candidate database with new profiles",
      "description": "Import and process new candidate profiles from recent recruitment events",
      "assignedTo": "68b1ac6b83002d979956481c",
      "status": "todo",
      "priority": "low",
      "dueDate": "2025-09-05T13:34:36.777Z",
      "checklist": [
        {
          "id": "1",
          "text": "Download resumes from event portal",
          "completed": false
        },
        {
          "id": "2",
          "text": "Parse contact information",
          "completed": false
        },
        {
          "id": "3",
          "text": "Create candidate profiles",
          "completed": false
        },
        {
          "id": "4",
          "text": "Tag candidates by event source",
          "completed": false
        }
      ],
      "createdBy": "68b1ac6a83002d97995647e8",
      "category": "administrative",
      "tags": [
        "data-entry",
        "recruitment-event"
      ],
      "estimatedHours": 6,
      "recurring": {
        "enabled": false
      },
      "attachments": [],
      "notes": [],
      "timeEntries": [],
      "dependencies": [],
      "createdAt": "2025-08-29T13:34:36.937Z",
      "updatedAt": "2025-08-29T13:34:36.937Z"
    },
    {
      "_id": "68b3f5c5b8c48927f8ee2369",
      "title": "Review candidate profiles for React position",
      "description": "Screen and evaluate incoming candidate applications for the Senior React Developer role",
      "assignedTo": "68b3f5bfb8c48927f8ee22ba",
      "relatedEntity": {
        "type": "job",
        "id": "68b1ac6b83002d9799564837"
      },
      "status": "in_progress",
      "priority": "high",
      "dueDate": "2025-09-02T07:12:05.087Z",
      "checklist": [
        {
          "id": "1",
          "text": "Review technical skills alignment",
          "completed": true
        },
        {
          "id": "2",
          "text": "Check experience level",
          "completed": true
        },
        {
          "id": "3",
          "text": "Verify salary expectations",
          "completed": false
        }
      ],
      "createdBy": "68b3f5bfb8c48927f8ee2304",
      "category": "recruitment",
      "tags": [
        "urgent",
        "technical-review"
      ],
      "estimatedHours": 4,
      "recurring": {
        "enabled": false
      },
      "attachments": [],
      "notes": [],
      "timeEntries": [],
      "dependencies": [],
      "createdAt": "2025-08-31T07:12:05.187Z",
      "updatedAt": "2025-08-31T07:12:05.187Z"
    },
    {
      "_id": "68b3f5c5b8c48927f8ee236c",
      "title": "Source candidates for Data Science position",
      "description": "Find and reach out to qualified data scientists for the open position at InnovateInc",
      "assignedTo": "68b3f5bfb8c48927f8ee2304",
      "relatedEntity": {
        "type": "job",
        "id": "68b1ac6b83002d979956483a"
      },
      "status": "todo",
      "priority": "medium",
      "dueDate": "2025-09-05T07:12:05.087Z",
      "checklist": [
        {
          "id": "1",
          "text": "Search LinkedIn for candidates",
          "completed": false
        },
        {
          "id": "2",
          "text": "Contact university career centers",
          "completed": false
        },
        {
          "id": "3",
          "text": "Post on specialized job boards",
          "completed": false
        }
      ],
      "createdBy": "68b3f5bfb8c48927f8ee22ba",
      "category": "recruitment",
      "tags": [
        "sourcing",
        "data-science"
      ],
      "estimatedHours": 8,
      "recurring": {
        "enabled": false
      },
      "attachments": [],
      "notes": [],
      "timeEntries": [],
      "dependencies": [],
      "createdAt": "2025-08-31T07:12:05.331Z",
      "updatedAt": "2025-08-31T07:12:05.331Z"
    },
    {
      "_id": "68b3f5c5b8c48927f8ee236f",
      "title": "Schedule interviews for shortlisted candidates",
      "description": "Coordinate interview schedules for candidates who passed initial screening",
      "assignedTo": "68b3f5bfb8c48927f8ee22e0",
      "relatedEntity": {
        "type": "application",
        "id": "68b1ac6c83002d979956484e"
      },
      "status": "completed",
      "priority": "high",
      "dueDate": "2025-09-01T07:12:05.087Z",
      "checklist": [
        {
          "id": "1",
          "text": "Contact top 3 candidates",
          "completed": true
        },
        {
          "id": "2",
          "text": "Book interview rooms",
          "completed": true
        },
        {
          "id": "3",
          "text": "Send calendar invites",
          "completed": true
        }
      ],
      "createdBy": "68b3f5c0b8c48927f8ee231b",
      "completedAt": "2025-08-30T07:12:05.087Z",
      "category": "interview",
      "tags": [
        "scheduling",
        "interviews"
      ],
      "estimatedHours": 2,
      "actualHours": 1.5,
      "recurring": {
        "enabled": false
      },
      "attachments": [],
      "notes": [],
      "timeEntries": [],
      "dependencies": [],
      "createdAt": "2025-08-31T07:12:05.504Z",
      "updatedAt": "2025-08-31T07:12:05.504Z"
    },
    {
      "_id": "68b3f5c5b8c48927f8ee2372",
      "title": "Update candidate database with new profiles",
      "description": "Import and process new candidate profiles from recent recruitment events",
      "assignedTo": "68b3f5c0b8c48927f8ee231b",
      "status": "todo",
      "priority": "low",
      "dueDate": "2025-09-07T07:12:05.087Z",
      "checklist": [
        {
          "id": "1",
          "text": "Download resumes from event portal",
          "completed": false
        },
        {
          "id": "2",
          "text": "Parse contact information",
          "completed": false
        },
        {
          "id": "3",
          "text": "Create candidate profiles",
          "completed": false
        },
        {
          "id": "4",
          "text": "Tag candidates by event source",
          "completed": false
        }
      ],
      "createdBy": "68b3f5bfb8c48927f8ee22e0",
      "category": "administrative",
      "tags": [
        "data-entry",
        "recruitment-event"
      ],
      "estimatedHours": 6,
      "recurring": {
        "enabled": false
      },
      "attachments": [],
      "notes": [],
      "timeEntries": [],
      "dependencies": [],
      "createdAt": "2025-08-31T07:12:05.679Z",
      "updatedAt": "2025-08-31T07:12:05.679Z"
    }
  ],
  "files": [
    {
      "_id": "68b1ac6d83002d9799564883",
      "filename": "john-doe-resume.pdf",
      "originalName": "John_Doe_Resume_2024.pdf",
      "mimetype": "application/pdf",
      "size": 245760,
      "path": "uploads/resumes/john-doe-resume.pdf",
      "url": "/uploads/resumes/john-doe-resume.pdf",
      "category": "resume",
      "uploadedBy": "68b1ac6b83002d9799564820",
      "relatedEntity": {
        "type": "candidate",
        "id": "68b1ac6b83002d979956482e"
      },
      "metadata": {
        "pageCount": 2,
        "keywords": [],
        "processed": true,
        "processingStatus": "completed",
        "virusScanned": true,
        "virusScanResult": "clean",
        "version": 1
      },
      "isPublic": false,
      "permissions": {
        "canView": [],
        "canDownload": [],
        "canEdit": []
      },
      "status": "active",
      "downloadCount": 0,
      "checksum": "sha256:abc123def456...",
      "checksumAlgorithm": "sha256",
      "storageProvider": "local",
      "tags": [
        "resume",
        "senior",
        "react"
      ],
      "accessLog": [],
      "comments": [],
      "createdAt": "2025-08-29T13:34:37.064Z",
      "updatedAt": "2025-08-29T13:34:37.064Z"
    },
    {
      "_id": "68b1ac6d83002d9799564886",
      "filename": "sarah-miller-resume.pdf",
      "originalName": "Sarah_Miller_DataScientist_Resume.pdf",
      "mimetype": "application/pdf",
      "size": 198720,
      "path": "uploads/resumes/sarah-miller-resume.pdf",
      "url": "/uploads/resumes/sarah-miller-resume.pdf",
      "category": "resume",
      "uploadedBy": "68b1ac6b83002d9799564823",
      "relatedEntity": {
        "type": "candidate",
        "id": "68b1ac6b83002d9799564831"
      },
      "metadata": {
        "pageCount": 2,
        "keywords": [],
        "processed": true,
        "processingStatus": "completed",
        "virusScanned": true,
        "virusScanResult": "clean",
        "version": 1
      },
      "isPublic": false,
      "permissions": {
        "canView": [],
        "canDownload": [],
        "canEdit": []
      },
      "status": "active",
      "downloadCount": 0,
      "checksum": "sha256:def456ghi789...",
      "checksumAlgorithm": "sha256",
      "storageProvider": "local",
      "tags": [
        "resume",
        "data-science",
        "ml"
      ],
      "accessLog": [],
      "comments": [],
      "createdAt": "2025-08-29T13:34:37.115Z",
      "updatedAt": "2025-08-29T13:34:37.115Z"
    },
    {
      "_id": "68b1ac6d83002d9799564889",
      "filename": "react-developer-jd.pdf",
      "originalName": "Senior_React_Developer_Job_Description.pdf",
      "mimetype": "application/pdf",
      "size": 156432,
      "path": "uploads/job-descriptions/react-developer-jd.pdf",
      "url": "/uploads/job-descriptions/react-developer-jd.pdf",
      "category": "document",
      "uploadedBy": "68b1ac6a83002d97995647b4",
      "relatedEntity": {
        "type": "job",
        "id": "68b1ac6b83002d9799564837"
      },
      "metadata": {
        "pageCount": 1,
        "keywords": [],
        "processed": true,
        "processingStatus": "completed",
        "virusScanned": false,
        "version": 1
      },
      "isPublic": false,
      "permissions": {
        "canView": [],
        "canDownload": [],
        "canEdit": []
      },
      "status": "active",
      "downloadCount": 0,
      "checksum": "sha256:ghi789jkl012...",
      "checksumAlgorithm": "sha256",
      "storageProvider": "local",
      "tags": [
        "job-description",
        "react",
        "frontend"
      ],
      "accessLog": [],
      "comments": [],
      "createdAt": "2025-08-29T13:34:37.156Z",
      "updatedAt": "2025-08-29T13:34:37.156Z"
    },
    {
      "_id": "68b1ac6d83002d979956488c",
      "filename": "john-doe-cover-letter.pdf",
      "originalName": "John_Doe_Cover_Letter_TechCorp.pdf",
      "mimetype": "application/pdf",
      "size": 87654,
      "path": "uploads/cover-letters/john-doe-cover-letter.pdf",
      "url": "/uploads/cover-letters/john-doe-cover-letter.pdf",
      "category": "cover_letter",
      "uploadedBy": "68b1ac6b83002d9799564820",
      "relatedEntity": {
        "type": "candidate",
        "id": "68b1ac6b83002d979956482e"
      },
      "metadata": {
        "pageCount": 1,
        "keywords": [],
        "processed": true,
        "processingStatus": "completed",
        "virusScanned": false,
        "version": 1
      },
      "isPublic": false,
      "permissions": {
        "canView": [],
        "canDownload": [],
        "canEdit": []
      },
      "status": "active",
      "downloadCount": 0,
      "checksum": "sha256:jkl012mno345...",
      "checksumAlgorithm": "sha256",
      "storageProvider": "local",
      "tags": [
        "cover-letter",
        "techcorp"
      ],
      "accessLog": [],
      "comments": [],
      "createdAt": "2025-08-29T13:34:37.199Z",
      "updatedAt": "2025-08-29T13:34:37.199Z"
    }
  ],
  "interviews": [
    {
      "_id": "68b1ac6c83002d9799564860",
      "applicationId": "68b1ac6c83002d979956484e",
      "type": "video",
      "round": "technical",
      "scheduledAt": "2025-08-30T04:30:00.000Z",
      "duration": 60,
      "location": "Zoom Meeting",
      "interviewers": [
        "68b1ac6a83002d97995647b4"
      ],
      "status": "scheduled",
      "meetingLink": "https://zoom.us/j/1234567890",
      "createdBy": "68b1ac6a83002d97995647b4",
      "notes": [],
      "interviewerFeedback": [],
      "preparationMaterials": [],
      "questions": [],
      "rescheduleHistory": [],
      "followUpActions": [],
      "createdAt": "2025-08-29T13:34:36.498Z",
      "updatedAt": "2025-08-29T13:34:36.498Z"
    },
    {
      "_id": "68b1ac6c83002d9799564863",
      "applicationId": "68b1ac6c83002d9799564852",
      "type": "in-person",
      "round": "final",
      "scheduledAt": "2025-08-31T08:30:00.000Z",
      "duration": 45,
      "location": "Austin Office",
      "interviewers": [
        "68b1ac6a83002d97995647e8"
      ],
      "status": "confirmed",
      "createdBy": "68b1ac6a83002d97995647e8",
      "notes": [],
      "interviewerFeedback": [],
      "preparationMaterials": [],
      "questions": [],
      "rescheduleHistory": [],
      "followUpActions": [],
      "createdAt": "2025-08-29T13:34:36.540Z",
      "updatedAt": "2025-08-29T13:34:36.540Z"
    },
    {
      "_id": "68b1ac6c83002d9799564866",
      "applicationId": "68b1ac6c83002d9799564856",
      "type": "phone",
      "round": "screening",
      "scheduledAt": "2025-08-22T06:00:00.000Z",
      "duration": 30,
      "location": "Phone Call",
      "interviewers": [
        "68b1ac6a83002d97995647b4"
      ],
      "status": "completed",
      "feedback": "Strong technical background, good communication skills.",
      "rating": 4,
      "createdBy": "68b1ac6a83002d97995647b4",
      "meetingDetails": {
        "platform": "phone",
        "dialInNumber": "+1-555-123-4567"
      },
      "notes": [],
      "interviewerFeedback": [],
      "preparationMaterials": [],
      "questions": [],
      "rescheduleHistory": [],
      "followUpActions": [],
      "createdAt": "2025-08-29T13:34:36.586Z",
      "updatedAt": "2025-08-29T13:34:36.586Z"
    },
    {
      "_id": "68b1ac6c83002d9799564869",
      "applicationId": "68b1ac6c83002d979956485a",
      "type": "video",
      "round": "behavioral",
      "scheduledAt": "2025-09-01T09:30:00.000Z",
      "duration": 90,
      "location": "Google Meet",
      "interviewers": [
        "68b1ac6a83002d97995647e8"
      ],
      "status": "scheduled",
      "meetingLink": "https://meet.google.com/abc-defg-hij",
      "createdBy": "68b1ac6a83002d97995647e8",
      "notes": [],
      "interviewerFeedback": [],
      "preparationMaterials": [],
      "questions": [],
      "rescheduleHistory": [],
      "followUpActions": [],
      "createdAt": "2025-08-29T13:34:36.626Z",
      "updatedAt": "2025-08-29T13:34:36.626Z"
    },
    {
      "_id": "68b1ac6c83002d979956486c",
      "applicationId": "68b1ac6c83002d979956484e",
      "type": "video",
      "round": "cultural",
      "scheduledAt": "2025-08-22T03:30:00.000Z",
      "duration": 60,
      "location": "Teams Meeting",
      "interviewers": [
        "68b1ac6a83002d97995647b4"
      ],
      "status": "cancelled",
      "meetingLink": "https://teams.microsoft.com/l/meetup-join/19%3Ameeting_abc123",
      "createdBy": "68b1ac6a83002d97995647b4",
      "notes": [],
      "interviewerFeedback": [],
      "preparationMaterials": [],
      "questions": [],
      "rescheduleHistory": [],
      "followUpActions": [],
      "createdAt": "2025-08-29T13:34:36.666Z",
      "updatedAt": "2025-08-29T13:34:36.666Z"
    }
  ],
  "agentassignments": [
    {
      "_id": "68b1ac6d83002d97995648a4",
      "agentId": "68b1ac6a83002d9799564808",
      "assignedHRs": [
        "68b1ac6a83002d97995647b4",
        "68b1ac6a83002d97995647e8"
      ],
      "assignedCandidates": [
        "68b1ac6b83002d9799564823"
      ],
      "assignedBy": "68b1ac6a83002d979956478f",
      "status": "active",
      "notes": "",
      "assignedAt": "2025-08-29T13:34:37.593Z",
      "createdAt": "2025-08-29T13:34:37.594Z",
      "updatedAt": "2025-08-31T06:48:50.426Z"
    },
    {
      "_id": "68b1ac6d83002d97995648a7",
      "agentId": "68b1ac6b83002d979956481c",
      "assignedHRs": [
        "68b1ac6a83002d97995647e8"
      ],
      "assignedCandidates": [
        "68b1ac6b83002d9799564831"
      ],
      "assignedBy": "68b1ac6a83002d979956478f",
      "status": "active",
      "notes": "Secondary agent handling specialized roles and backup coverage.",
      "assignedAt": "2025-08-29T13:34:37.635Z",
      "createdAt": "2025-08-29T13:34:37.635Z",
      "updatedAt": "2025-08-29T13:34:37.635Z"
    },
    {
      "_id": "68b3f5c8b8c48927f8ee2393",
      "agentId": "68b3f5bfb8c48927f8ee2304",
      "assignedHRs": [
        "68b3f5bfb8c48927f8ee22ba"
      ],
      "assignedCandidates": [
        "68b3f5c0b8c48927f8ee232b"
      ],
      "assignedBy": "68b3f5beb8c48927f8ee229c",
      "status": "active",
      "notes": "",
      "assignedAt": "2025-08-31T07:12:08.106Z",
      "createdAt": "2025-08-31T07:12:08.107Z",
      "updatedAt": "2025-08-31T10:12:17.028Z"
    },
    {
      "_id": "68b3f5c8b8c48927f8ee2396",
      "agentId": "68b3f5c0b8c48927f8ee231b",
      "assignedHRs": [
        "68b3f5bfb8c48927f8ee22e0"
      ],
      "assignedCandidates": [
        "68b3f5c0b8c48927f8ee2331"
      ],
      "assignedBy": "68b3f5beb8c48927f8ee229c",
      "status": "active",
      "notes": "",
      "assignedAt": "2025-08-31T07:12:08.244Z",
      "createdAt": "2025-08-31T07:12:08.244Z",
      "updatedAt": "2025-08-31T10:12:17.311Z"
    }
  ],
  "users": [
    {
      "_id": "68b3f5beb8c48927f8ee229c",
      "email": "admin@hireaccel.com",
      "password": "$argon2id$v=19$m=65536,t=3,p=1$bN0zA3/PPMMW9fb0wJ5bAA$GkHAuGaRWfCFDEH8R32lWIeqC6/1AXQ7qR7zbZPEKg9MyvXYH7enO3nZHBK0Ifazepo",
      "role": "admin",
      "firstName": "Admin",
      "lastName": "User",
      "status": "active",
      "lastLoginAt": "2025-08-31T10:34:45.964Z",
      "emailVerified": true,
      "refreshTokens": [
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGIzZjViZWI4YzQ4OTI3ZjhlZTIyOWMiLCJlbWFpbCI6ImFkbWluQGhpcmVhY2NlbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1NjYzNDM4NSwiZXhwIjoxNzU3MjM5MTg1LCJhdWQiOiJoaXJlLWFjY2VsLWNsaWVudCIsImlzcyI6ImhpcmUtYWNjZWwtYXBpIiwic3ViIjoiNjhiM2Y1YmViOGM0ODkyN2Y4ZWUyMjljIn0.HZaZsWeiJa9QLpplgeVjaqUIXYux6X-BULdFjDx4C2s",
          "createdAt": "2025-08-31T09:59:45.806Z",
          "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
          "ipAddress": "::1",
          "_id": "68b41d116f1242be7734cf7b"
        },
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGIzZjViZWI4YzQ4OTI3ZjhlZTIyOWMiLCJlbWFpbCI6ImFkbWluQGhpcmVhY2NlbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1NjYzNDYwOCwiZXhwIjoxNzU3MjM5NDA4LCJhdWQiOiJoaXJlLWFjY2VsLWNsaWVudCIsImlzcyI6ImhpcmUtYWNjZWwtYXBpIiwic3ViIjoiNjhiM2Y1YmViOGM0ODkyN2Y4ZWUyMjljIn0.-dZS1Zw-iEdnYNW7AP8VFQMERxYFLvNjEsQr_aNN-x0",
          "createdAt": "2025-08-31T10:03:28.980Z",
          "userAgent": "curl/8.7.1",
          "ipAddress": "::1",
          "_id": "68b41df06f1242be7734cfa1"
        },
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGIzZjViZWI4YzQ4OTI3ZjhlZTIyOWMiLCJlbWFpbCI6ImFkbWluQGhpcmVhY2NlbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1NjYzNjA4OSwiZXhwIjoxNzU3MjQwODg5LCJhdWQiOiJoaXJlLWFjY2VsLWNsaWVudCIsImlzcyI6ImhpcmUtYWNjZWwtYXBpIiwic3ViIjoiNjhiM2Y1YmViOGM0ODkyN2Y4ZWUyMjljIn0.Q_TA9EfcZt-vXScGXuF2aKC9K1EugiP6s75NgTvSsaQ",
          "createdAt": "2025-08-31T10:28:09.311Z",
          "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
          "ipAddress": "::1",
          "_id": "68b423b98692f993d57025f3"
        },
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGIzZjViZWI4YzQ4OTI3ZjhlZTIyOWMiLCJlbWFpbCI6ImFkbWluQGhpcmVhY2NlbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1NjYzNjQ1NywiZXhwIjoxNzU3MjQxMjU3LCJhdWQiOiJoaXJlLWFjY2VsLWNsaWVudCIsImlzcyI6ImhpcmUtYWNjZWwtYXBpIiwic3ViIjoiNjhiM2Y1YmViOGM0ODkyN2Y4ZWUyMjljIn0.Kx8I_PM1s-FerGOZHjIyCV6jTJapeyKJxrUtgnVaEug",
          "createdAt": "2025-08-31T10:34:17.178Z",
          "userAgent": "curl/8.7.1",
          "ipAddress": "::1",
          "_id": "68b42529c8d35d4f194fa6a8"
        },
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGIzZjViZWI4YzQ4OTI3ZjhlZTIyOWMiLCJlbWFpbCI6ImFkbWluQGhpcmVhY2NlbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1NjYzNjQ4NSwiZXhwIjoxNzU3MjQxMjg1LCJhdWQiOiJoaXJlLWFjY2VsLWNsaWVudCIsImlzcyI6ImhpcmUtYWNjZWwtYXBpIiwic3ViIjoiNjhiM2Y1YmViOGM0ODkyN2Y4ZWUyMjljIn0.BIg6IZIBbR93L5FxNNvLzzq9Mcgrh9VpnY0zfRO-YqE",
          "createdAt": "2025-08-31T10:34:45.964Z",
          "userAgent": "curl/8.7.1",
          "ipAddress": "::1",
          "_id": "68b42545c8d35d4f194fa6bb"
        }
      ],
      "createdAt": "2025-08-31T07:11:58.725Z",
      "updatedAt": "2025-08-31T10:34:45.965Z"
    },
    {
      "_id": "68b3f5bfb8c48927f8ee22ba",
      "email": "hr1@company.com",
      "password": "$argon2id$v=19$m=65536,t=3,p=1$MNUiHCrcw6XSbd3X691StQ$vFIrV+DE7TO+msM4Pt48MoKpilqjSZkmLz3jE5f/LbfvMKmuZT4iQ5s9/3FJxuesSfg",
      "role": "hr",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "status": "active",
      "lastLoginAt": "2025-08-31T11:59:39.343Z",
      "emailVerified": true,
      "refreshTokens": [
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGIzZjViZmI4YzQ4OTI3ZjhlZTIyYmEiLCJlbWFpbCI6ImhyMUBjb21wYW55LmNvbSIsInJvbGUiOiJociIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzU2NjM2NTI1LCJleHAiOjE3NTcyNDEzMjUsImF1ZCI6ImhpcmUtYWNjZWwtY2xpZW50IiwiaXNzIjoiaGlyZS1hY2NlbC1hcGkiLCJzdWIiOiI2OGIzZjViZmI4YzQ4OTI3ZjhlZTIyYmEifQ.-NbKaWAONQ7WpxAr_Y_h7hpKXVQqF_dtxhlVN9aaFVQ",
          "createdAt": "2025-08-31T10:35:25.240Z",
          "userAgent": "curl/8.7.1",
          "ipAddress": "::1",
          "_id": "68b4256dc8d35d4f194fa6d2"
        },
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGIzZjViZmI4YzQ4OTI3ZjhlZTIyYmEiLCJlbWFpbCI6ImhyMUBjb21wYW55LmNvbSIsInJvbGUiOiJociIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzU2NjM5NDk1LCJleHAiOjE3NTcyNDQyOTUsImF1ZCI6ImhpcmUtYWNjZWwtY2xpZW50IiwiaXNzIjoiaGlyZS1hY2NlbC1hcGkiLCJzdWIiOiI2OGIzZjViZmI4YzQ4OTI3ZjhlZTIyYmEifQ.Z4govHdDDe6i-awkEHABI0SiJY7wwKZTA3jgTauXsbE",
          "createdAt": "2025-08-31T11:24:55.440Z",
          "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
          "ipAddress": "::1",
          "_id": "68b43107b6ea04f43a44b03f"
        },
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGIzZjViZmI4YzQ4OTI3ZjhlZTIyYmEiLCJlbWFpbCI6ImhyMUBjb21wYW55LmNvbSIsInJvbGUiOiJociIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzU2NjM5NzM1LCJleHAiOjE3NTcyNDQ1MzUsImF1ZCI6ImhpcmUtYWNjZWwtY2xpZW50IiwiaXNzIjoiaGlyZS1hY2NlbC1hcGkiLCJzdWIiOiI2OGIzZjViZmI4YzQ4OTI3ZjhlZTIyYmEifQ.jifgjcGcO-4cV5GWvNG94zvtUhEz_FQyz7Jbc3wVESk",
          "createdAt": "2025-08-31T11:28:55.260Z",
          "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
          "ipAddress": "::1",
          "_id": "68b431f788130d01fc509300"
        },
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGIzZjViZmI4YzQ4OTI3ZjhlZTIyYmEiLCJlbWFpbCI6ImhyMUBjb21wYW55LmNvbSIsInJvbGUiOiJociIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzU2NjQwNjU3LCJleHAiOjE3NTcyNDU0NTcsImF1ZCI6ImhpcmUtYWNjZWwtY2xpZW50IiwiaXNzIjoiaGlyZS1hY2NlbC1hcGkiLCJzdWIiOiI2OGIzZjViZmI4YzQ4OTI3ZjhlZTIyYmEifQ.pO_JjuLmQhl2G4NYBBU6qLTzr6D9OOMjd39i-6y4UGo",
          "createdAt": "2025-08-31T11:44:17.677Z",
          "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
          "ipAddress": "::1",
          "_id": "68b4359188130d01fc5095dc"
        },
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGIzZjViZmI4YzQ4OTI3ZjhlZTIyYmEiLCJlbWFpbCI6ImhyMUBjb21wYW55LmNvbSIsInJvbGUiOiJociIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzU2NjQxNTc5LCJleHAiOjE3NTcyNDYzNzksImF1ZCI6ImhpcmUtYWNjZWwtY2xpZW50IiwiaXNzIjoiaGlyZS1hY2NlbC1hcGkiLCJzdWIiOiI2OGIzZjViZmI4YzQ4OTI3ZjhlZTIyYmEifQ.2MwE_3888cRA5Y_e9LcvhJ0f9vvZFGJbBaZG0xpqi8o",
          "createdAt": "2025-08-31T11:59:39.342Z",
          "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
          "ipAddress": "::1",
          "_id": "68b4392b7944956584143ab0"
        }
      ],
      "createdAt": "2025-08-31T07:11:59.143Z",
      "updatedAt": "2025-08-31T11:59:39.346Z"
    },
    {
      "_id": "68b3f5bfb8c48927f8ee22e0",
      "email": "hr2@company.com",
      "password": "$argon2id$v=19$m=65536,t=3,p=1$eC/yNNEtBvmpiqy/MXRM5w$DWgyuDGqk/JKJoNvlHYBOlEXCBYTHg1etj0DPs4nf/Y/5loQbeXK/Xf+ZqpUkiKSjFY",
      "role": "hr",
      "firstName": "Mike",
      "lastName": "Chen",
      "status": "active",
      "lastLoginAt": null,
      "emailVerified": true,
      "refreshTokens": [],
      "createdAt": "2025-08-31T07:11:59.560Z",
      "updatedAt": "2025-08-31T07:11:59.560Z"
    },
    {
      "_id": "68b3f5bfb8c48927f8ee2304",
      "email": "agent1@hireaccel.com",
      "password": "$argon2id$v=19$m=65536,t=3,p=1$0nEsOFUAenJVaWmuNUbK5A$94iaPsokJhVKRJUHpJ8WSHdSucPbn/JGzfmch/4yo/+Z2sqDE5lWFZeqyKqgrVwEatE",
      "role": "agent",
      "firstName": "Alex",
      "lastName": "Smith",
      "status": "active",
      "lastLoginAt": "2025-08-31T11:51:51.536Z",
      "emailVerified": true,
      "refreshTokens": [
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGIzZjViZmI4YzQ4OTI3ZjhlZTIzMDQiLCJlbWFpbCI6ImFnZW50MUBoaXJlYWNjZWwuY29tIiwicm9sZSI6ImFnZW50IiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NTY2MzY1NDQsImV4cCI6MTc1NzI0MTM0NCwiYXVkIjoiaGlyZS1hY2NlbC1jbGllbnQiLCJpc3MiOiJoaXJlLWFjY2VsLWFwaSIsInN1YiI6IjY4YjNmNWJmYjhjNDg5MjdmOGVlMjMwNCJ9.ZjiDrBdyTQ68tadpPQ5snZah3co_cpM_Y8HmNg38F0w",
          "createdAt": "2025-08-31T10:35:44.265Z",
          "userAgent": "curl/8.7.1",
          "ipAddress": "::1",
          "_id": "68b42580c8d35d4f194fa6db"
        },
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGIzZjViZmI4YzQ4OTI3ZjhlZTIzMDQiLCJlbWFpbCI6ImFnZW50MUBoaXJlYWNjZWwuY29tIiwicm9sZSI6ImFnZW50IiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NTY2Mzg4MjYsImV4cCI6MTc1NzI0MzYyNiwiYXVkIjoiaGlyZS1hY2NlbC1jbGllbnQiLCJpc3MiOiJoaXJlLWFjY2VsLWFwaSIsInN1YiI6IjY4YjNmNWJmYjhjNDg5MjdmOGVlMjMwNCJ9.VbqJvFmLuRqO8kv8NCcuiiV4pvgo2GulQqKba878qJ0",
          "createdAt": "2025-08-31T11:13:46.099Z",
          "userAgent": "curl/8.7.1",
          "ipAddress": "::1",
          "_id": "68b42e6ab6ea04f43a44ae14"
        },
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGIzZjViZmI4YzQ4OTI3ZjhlZTIzMDQiLCJlbWFpbCI6ImFnZW50MUBoaXJlYWNjZWwuY29tIiwicm9sZSI6ImFnZW50IiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NTY2MzkwNDYsImV4cCI6MTc1NzI0Mzg0NiwiYXVkIjoiaGlyZS1hY2NlbC1jbGllbnQiLCJpc3MiOiJoaXJlLWFjY2VsLWFwaSIsInN1YiI6IjY4YjNmNWJmYjhjNDg5MjdmOGVlMjMwNCJ9.eHsIUU3k3tG-B0qDQLu8xd3QuII2xQMDG45f87R7qIA",
          "createdAt": "2025-08-31T11:17:26.526Z",
          "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
          "ipAddress": "::1",
          "_id": "68b42f46b6ea04f43a44ae1e"
        },
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGIzZjViZmI4YzQ4OTI3ZjhlZTIzMDQiLCJlbWFpbCI6ImFnZW50MUBoaXJlYWNjZWwuY29tIiwicm9sZSI6ImFnZW50IiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NTY2NDAxOTMsImV4cCI6MTc1NzI0NDk5MywiYXVkIjoiaGlyZS1hY2NlbC1jbGllbnQiLCJpc3MiOiJoaXJlLWFjY2VsLWFwaSIsInN1YiI6IjY4YjNmNWJmYjhjNDg5MjdmOGVlMjMwNCJ9.3vAxfggzbAMTKJ2m-lzOEYxJ4NtEl-EOvsRPpp1SFHQ",
          "createdAt": "2025-08-31T11:36:33.327Z",
          "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
          "ipAddress": "::1",
          "_id": "68b433c188130d01fc5093fe"
        },
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGIzZjViZmI4YzQ4OTI3ZjhlZTIzMDQiLCJlbWFpbCI6ImFnZW50MUBoaXJlYWNjZWwuY29tIiwicm9sZSI6ImFnZW50IiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NTY2NDExMTEsImV4cCI6MTc1NzI0NTkxMSwiYXVkIjoiaGlyZS1hY2NlbC1jbGllbnQiLCJpc3MiOiJoaXJlLWFjY2VsLWFwaSIsInN1YiI6IjY4YjNmNWJmYjhjNDg5MjdmOGVlMjMwNCJ9.mcaZi1792eV90ZWYyXwBDzXLIno1an9lBSZVj7wPbhc",
          "createdAt": "2025-08-31T11:51:51.536Z",
          "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
          "ipAddress": "::1",
          "_id": "68b4375788130d01fc509817"
        }
      ],
      "createdAt": "2025-08-31T07:11:59.942Z",
      "updatedAt": "2025-08-31T11:51:51.537Z"
    },
    {
      "_id": "68b3f5c0b8c48927f8ee231b",
      "email": "agent2@hireaccel.com",
      "password": "$argon2id$v=19$m=65536,t=3,p=1$Rdk8r9aKRO+ba9i3Q72goQ$AiXCnMsisHsmPuoVbGm1BCTxUCRsigqHoAe/mPqHNsBnlJmsMzS6/BfydgTIsWkU8Ro",
      "role": "agent",
      "firstName": "Lisa",
      "lastName": "Brown",
      "status": "active",
      "lastLoginAt": "2025-08-31T09:56:24.756Z",
      "emailVerified": true,
      "refreshTokens": [
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGIzZjVjMGI4YzQ4OTI3ZjhlZTIzMWIiLCJlbWFpbCI6ImFnZW50MkBoaXJlYWNjZWwuY29tIiwicm9sZSI6ImFnZW50IiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NTY2MzQxODQsImV4cCI6MTc1NzIzODk4NCwiYXVkIjoiaGlyZS1hY2NlbC1jbGllbnQiLCJpc3MiOiJoaXJlLWFjY2VsLWFwaSIsInN1YiI6IjY4YjNmNWMwYjhjNDg5MjdmOGVlMjMxYiJ9._sGcHwHe8KyetG7quwzhnTfoIVYGQrD8a9anP-bBX_s",
          "createdAt": "2025-08-31T09:56:24.756Z",
          "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
          "ipAddress": "::1",
          "_id": "68b41c480cb77d81e990a8d4"
        }
      ],
      "createdAt": "2025-08-31T07:12:00.237Z",
      "updatedAt": "2025-08-31T09:56:24.756Z"
    },
    {
      "_id": "68b3f5c0b8c48927f8ee232b",
      "email": "john.doe@email.com",
      "password": "$argon2id$v=19$m=65536,t=3,p=1$VQG6OsfUrHS6ovUcngm7og$B3fGLPxrMbRxpb0os7SupIZkHbAd/P8/mEwcdCRoDXapB4laILMe6kJ50stiWLxBZiA",
      "role": "candidate",
      "firstName": "John",
      "lastName": "Doe",
      "status": "active",
      "lastLoginAt": "2025-08-31T11:50:49.645Z",
      "emailVerified": true,
      "refreshTokens": [
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGIzZjVjMGI4YzQ4OTI3ZjhlZTIzMmIiLCJlbWFpbCI6ImpvaG4uZG9lQGVtYWlsLmNvbSIsInJvbGUiOiJjYW5kaWRhdGUiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1NjYzMzk2NSwiZXhwIjoxNzU3MjM4NzY1LCJhdWQiOiJoaXJlLWFjY2VsLWNsaWVudCIsImlzcyI6ImhpcmUtYWNjZWwtYXBpIiwic3ViIjoiNjhiM2Y1YzBiOGM0ODkyN2Y4ZWUyMzJiIn0.YFLNoKw74cAlz5ctgAbcLz7Gmnx3H6voJnmzj_sIWuc",
          "createdAt": "2025-08-31T09:52:45.974Z",
          "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
          "ipAddress": "::1",
          "_id": "68b41b6d0cb77d81e990a79e"
        },
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGIzZjVjMGI4YzQ4OTI3ZjhlZTIzMmIiLCJlbWFpbCI6ImpvaG4uZG9lQGVtYWlsLmNvbSIsInJvbGUiOiJjYW5kaWRhdGUiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1NjY0MTA0OSwiZXhwIjoxNzU3MjQ1ODQ5LCJhdWQiOiJoaXJlLWFjY2VsLWNsaWVudCIsImlzcyI6ImhpcmUtYWNjZWwtYXBpIiwic3ViIjoiNjhiM2Y1YzBiOGM0ODkyN2Y4ZWUyMzJiIn0.mNC1GaucnfLTcw1hWoQZkX3wE_Vqpj1-IhteUliCGK8",
          "createdAt": "2025-08-31T11:50:49.645Z",
          "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
          "ipAddress": "::1",
          "_id": "68b4371988130d01fc5097e3"
        }
      ],
      "createdAt": "2025-08-31T07:12:00.604Z",
      "updatedAt": "2025-08-31T11:50:49.646Z"
    },
    {
      "_id": "68b3f5c0b8c48927f8ee2331",
      "email": "sarah.miller@email.com",
      "password": "$argon2id$v=19$m=65536,t=3,p=1$029DB59f+71nb4mmzy5OQA$0ey0nUVM4aVNkTlE7fCAaeLY3INf5hPD8gwLzLq4TmvMsjux9EJciICf4nu6OfluGxo",
      "role": "candidate",
      "firstName": "Sarah",
      "lastName": "Miller",
      "status": "active",
      "lastLoginAt": null,
      "emailVerified": true,
      "refreshTokens": [],
      "createdAt": "2025-08-31T07:12:00.910Z",
      "updatedAt": "2025-08-31T07:12:00.910Z"
    }
  ],
  "applications": [
    {
      "_id": "68b1ac6c83002d979956484e",
      "candidateId": "68b1ac6b83002d979956482e",
      "jobId": "68b1ac6b83002d9799564837",
      "status": "interview",
      "stage": "technical",
      "appliedAt": "2024-01-10T00:00:00.000Z",
      "documents": [],
      "rating": 4,
      "scheduledInterviews": [],
      "offerDetails": {
        "salary": {
          "currency": "USD"
        },
        "benefits": []
      },
      "source": "direct_apply",
      "viewedByEmployer": false,
      "communicationPreference": "email",
      "notes": [],
      "stageHistory": [],
      "lastActivityAt": "2025-08-29T13:34:36.201Z",
      "createdAt": "2025-08-29T13:34:36.201Z",
      "updatedAt": "2025-08-29T13:34:36.201Z"
    },
    {
      "_id": "68b1ac6c83002d9799564852",
      "candidateId": "68b1ac6b83002d9799564831",
      "jobId": "68b1ac6b83002d979956483a",
      "status": "interview",
      "stage": "final",
      "appliedAt": "2024-01-12T00:00:00.000Z",
      "documents": [],
      "rating": 5,
      "scheduledInterviews": [],
      "offerDetails": {
        "salary": {
          "currency": "USD"
        },
        "benefits": []
      },
      "source": "linkedin",
      "viewedByEmployer": false,
      "communicationPreference": "both",
      "notes": [],
      "stageHistory": [],
      "lastActivityAt": "2025-08-29T13:34:36.269Z",
      "createdAt": "2025-08-29T13:34:36.268Z",
      "updatedAt": "2025-08-29T13:34:36.268Z"
    },
    {
      "_id": "68b1ac6c83002d9799564856",
      "candidateId": "68b1ac6b83002d979956482e",
      "jobId": "68b1ac6b83002d979956483d",
      "status": "interview",
      "stage": "screening",
      "appliedAt": "2024-01-05T00:00:00.000Z",
      "documents": [],
      "rating": 4,
      "scheduledInterviews": [],
      "offerDetails": {
        "salary": {
          "currency": "USD"
        },
        "benefits": []
      },
      "source": "job_board",
      "viewedByEmployer": false,
      "communicationPreference": "email",
      "notes": [],
      "stageHistory": [],
      "lastActivityAt": "2025-08-29T13:34:36.332Z",
      "createdAt": "2025-08-29T13:34:36.332Z",
      "updatedAt": "2025-08-29T13:34:36.332Z"
    },
    {
      "_id": "68b1ac6c83002d979956485a",
      "candidateId": "68b1ac6b83002d9799564831",
      "jobId": "68b1ac6b83002d9799564840",
      "status": "interview",
      "stage": "technical",
      "appliedAt": "2024-01-15T00:00:00.000Z",
      "documents": [],
      "rating": 4,
      "scheduledInterviews": [],
      "offerDetails": {
        "salary": {
          "currency": "USD"
        },
        "benefits": []
      },
      "source": "referral",
      "viewedByEmployer": false,
      "communicationPreference": "phone",
      "notes": [],
      "stageHistory": [],
      "lastActivityAt": "2025-08-29T13:34:36.395Z",
      "createdAt": "2025-08-29T13:34:36.395Z",
      "updatedAt": "2025-08-29T13:34:36.395Z"
    },
    {
      "_id": "68b3f5c3b8c48927f8ee234e",
      "candidateId": "68b3f5c1b8c48927f8ee2338",
      "jobId": "68b1ac6b83002d9799564837",
      "status": "interview",
      "stage": "technical",
      "appliedAt": "2024-01-10T00:00:00.000Z",
      "documents": [],
      "rating": 4,
      "scheduledInterviews": [],
      "offerDetails": {
        "salary": {
          "currency": "USD"
        },
        "benefits": []
      },
      "source": "direct_apply",
      "viewedByEmployer": false,
      "communicationPreference": "email",
      "notes": [],
      "stageHistory": [],
      "lastActivityAt": "2025-08-31T07:12:03.206Z",
      "createdAt": "2025-08-31T07:12:03.206Z",
      "updatedAt": "2025-08-31T07:12:03.206Z"
    },
    {
      "_id": "68b3f5c3b8c48927f8ee2352",
      "candidateId": "68b3f5c1b8c48927f8ee233b",
      "jobId": "68b1ac6b83002d979956483a",
      "status": "interview",
      "stage": "final",
      "appliedAt": "2024-01-12T00:00:00.000Z",
      "documents": [],
      "rating": 5,
      "scheduledInterviews": [],
      "offerDetails": {
        "salary": {
          "currency": "USD"
        },
        "benefits": []
      },
      "source": "linkedin",
      "viewedByEmployer": false,
      "communicationPreference": "both",
      "notes": [],
      "stageHistory": [],
      "lastActivityAt": "2025-08-31T07:12:03.445Z",
      "createdAt": "2025-08-31T07:12:03.445Z",
      "updatedAt": "2025-08-31T07:12:03.445Z"
    },
    {
      "_id": "68b3f5c3b8c48927f8ee2356",
      "candidateId": "68b3f5c1b8c48927f8ee2338",
      "jobId": "68b1ac6b83002d979956483d",
      "status": "interview",
      "stage": "screening",
      "appliedAt": "2024-01-05T00:00:00.000Z",
      "documents": [],
      "rating": 4,
      "scheduledInterviews": [],
      "offerDetails": {
        "salary": {
          "currency": "USD"
        },
        "benefits": []
      },
      "source": "job_board",
      "viewedByEmployer": false,
      "communicationPreference": "email",
      "notes": [],
      "stageHistory": [],
      "lastActivityAt": "2025-08-31T07:12:03.726Z",
      "createdAt": "2025-08-31T07:12:03.726Z",
      "updatedAt": "2025-08-31T07:12:03.726Z"
    },
    {
      "_id": "68b3f5c4b8c48927f8ee235a",
      "candidateId": "68b3f5c1b8c48927f8ee233b",
      "jobId": "68b1ac6b83002d9799564840",
      "status": "interview",
      "stage": "technical",
      "appliedAt": "2024-01-15T00:00:00.000Z",
      "documents": [],
      "rating": 4,
      "scheduledInterviews": [],
      "offerDetails": {
        "salary": {
          "currency": "USD"
        },
        "benefits": []
      },
      "source": "referral",
      "viewedByEmployer": false,
      "communicationPreference": "phone",
      "notes": [],
      "stageHistory": [],
      "lastActivityAt": "2025-08-31T07:12:04.006Z",
      "createdAt": "2025-08-31T07:12:04.006Z",
      "updatedAt": "2025-08-31T07:12:04.006Z"
    }
  ],
  "candidateassignments": [
    {
      "_id": "68b3f5c7b8c48927f8ee2385",
      "candidateId": "68b3f5c1b8c48927f8ee2338",
      "assignedTo": "68b3f5bfb8c48927f8ee22ba",
      "assignedBy": "68b3f5bfb8c48927f8ee2304",
      "jobId": "68b1ac6b83002d9799564837",
      "status": "active",
      "priority": "high",
      "notes": "Excellent React skills, perfect match for senior role. Strong portfolio and 5+ years experience.",
      "dueDate": "2025-09-03T07:12:07.086Z",
      "assignedAt": "2025-08-31T07:12:07.173Z",
      "createdAt": "2025-08-31T07:12:07.174Z",
      "updatedAt": "2025-08-31T07:12:07.174Z"
    }
  ],
  "jobs": [
    {
      "_id": "68b1ac6b83002d9799564837",
      "title": "Senior React Developer",
      "description": "We are looking for a senior React developer to join our growing team. You will be responsible for building scalable web applications using modern React patterns and best practices.",
      "requirements": {
        "skills": [
          "React",
          "TypeScript",
          "Node.js",
          "JavaScript",
          "HTML",
          "CSS"
        ],
        "experience": "senior",
        "education": [
          "Bachelor's in Computer Science",
          "Related field"
        ],
        "languages": [
          "English"
        ],
        "certifications": []
      },
      "location": "Remote",
      "type": "full-time",
      "salaryRange": {
        "min": 140000,
        "max": 180000,
        "currency": "USD"
      },
      "companyId": "68b1ac6b83002d9799564827",
      "status": "open",
      "urgency": "high",
      "assignedAgentId": "68b1ac6a83002d9799564808",
      "createdBy": "68b3f5bfb8c48927f8ee22ba",
      "applications": 0,
      "postedAt": "2025-08-29T13:34:35.720Z",
      "isRemote": true,
      "benefits": [],
      "interviewProcess": {
        "rounds": 3
      },
      "isPublic": true,
      "sourcingChannels": [],
      "views": 0,
      "createdAt": "2025-08-29T13:34:35.739Z",
      "updatedAt": "2025-08-29T13:34:35.739Z"
    },
    {
      "_id": "68b1ac6b83002d979956483a",
      "title": "Data Scientist",
      "description": "Join our data science team to build machine learning models and extract insights from complex datasets. You will work on cutting-edge AI projects.",
      "requirements": {
        "skills": [
          "Python",
          "Machine Learning",
          "SQL",
          "TensorFlow",
          "Pandas"
        ],
        "experience": "mid",
        "education": [
          "Master's in Data Science",
          "Statistics",
          "Computer Science"
        ],
        "languages": [
          "English"
        ],
        "certifications": []
      },
      "location": "New York, NY",
      "type": "full-time",
      "salaryRange": {
        "min": 120000,
        "max": 160000,
        "currency": "USD"
      },
      "companyId": "68b1ac6b83002d979956482a",
      "status": "open",
      "urgency": "medium",
      "assignedAgentId": "68b1ac6b83002d979956481c",
      "createdBy": "68b3f5bfb8c48927f8ee22e0",
      "applications": 0,
      "postedAt": "2025-08-29T13:34:35.720Z",
      "isRemote": false,
      "benefits": [],
      "interviewProcess": {
        "rounds": 3
      },
      "isPublic": true,
      "sourcingChannels": [],
      "views": 0,
      "createdAt": "2025-08-29T13:34:35.782Z",
      "updatedAt": "2025-08-29T13:34:35.782Z"
    },
    {
      "_id": "68b1ac6b83002d979956483d",
      "title": "Backend Engineer",
      "description": "Build scalable backend services and APIs using modern technologies. Work with microservices and cloud infrastructure.",
      "requirements": {
        "skills": [
          "Java",
          "Spring Boot",
          "PostgreSQL",
          "Docker",
          "AWS"
        ],
        "experience": "senior",
        "education": [
          "Bachelor's in Computer Science",
          "Engineering"
        ],
        "languages": [
          "English"
        ],
        "certifications": []
      },
      "location": "San Francisco, CA",
      "type": "full-time",
      "salaryRange": {
        "min": 150000,
        "max": 190000,
        "currency": "USD"
      },
      "companyId": "68b1ac6b83002d9799564827",
      "status": "open",
      "urgency": "high",
      "assignedAgentId": "68b1ac6a83002d9799564808",
      "createdBy": "68b3f5bfb8c48927f8ee22ba",
      "applications": 0,
      "postedAt": "2025-08-29T13:34:35.720Z",
      "isRemote": false,
      "benefits": [],
      "interviewProcess": {
        "rounds": 3
      },
      "isPublic": true,
      "sourcingChannels": [],
      "views": 0,
      "createdAt": "2025-08-29T13:34:35.836Z",
      "updatedAt": "2025-08-29T13:34:35.836Z"
    },
    {
      "_id": "68b1ac6b83002d9799564840",
      "title": "Frontend Developer",
      "description": "Create beautiful and responsive user interfaces using modern frontend technologies. Focus on user experience and performance.",
      "requirements": {
        "skills": [
          "React",
          "Vue.js",
          "JavaScript",
          "CSS",
          "HTML"
        ],
        "experience": "mid",
        "education": [
          "Bachelor's in Computer Science",
          "Web Development"
        ],
        "languages": [
          "English"
        ],
        "certifications": []
      },
      "location": "Austin, TX",
      "type": "full-time",
      "salaryRange": {
        "min": 100000,
        "max": 140000,
        "currency": "USD"
      },
      "companyId": "68b1ac6b83002d979956482a",
      "status": "open",
      "urgency": "medium",
      "assignedAgentId": "68b1ac6b83002d979956481c",
      "createdBy": "68b3f5bfb8c48927f8ee22e0",
      "applications": 0,
      "postedAt": "2025-08-29T13:34:35.720Z",
      "isRemote": false,
      "benefits": [],
      "interviewProcess": {
        "rounds": 3
      },
      "isPublic": true,
      "sourcingChannels": [],
      "views": 0,
      "createdAt": "2025-08-29T13:34:35.893Z",
      "updatedAt": "2025-08-29T13:34:35.893Z"
    },
    {
      "_id": "68b1ac6b83002d9799564843",
      "title": "DevOps Engineer",
      "description": "Manage cloud infrastructure and implement CI/CD pipelines. Work with containerization and orchestration technologies.",
      "requirements": {
        "skills": [
          "AWS",
          "Docker",
          "Kubernetes",
          "Jenkins",
          "Terraform"
        ],
        "experience": "senior",
        "education": [
          "Bachelor's in Information Technology",
          "Computer Science"
        ],
        "languages": [
          "English"
        ],
        "certifications": []
      },
      "location": "Remote",
      "type": "full-time",
      "salaryRange": {
        "min": 130000,
        "max": 170000,
        "currency": "USD"
      },
      "companyId": "68b1ac6b83002d9799564827",
      "status": "open",
      "urgency": "low",
      "assignedAgentId": "68b1ac6a83002d9799564808",
      "createdBy": "68b3f5bfb8c48927f8ee22ba",
      "applications": 0,
      "postedAt": "2025-08-29T13:34:35.720Z",
      "isRemote": true,
      "benefits": [],
      "interviewProcess": {
        "rounds": 3
      },
      "isPublic": true,
      "sourcingChannels": [],
      "views": 0,
      "createdAt": "2025-08-29T13:34:35.949Z",
      "updatedAt": "2025-08-29T13:34:35.949Z"
    }
  ],
  "companies": [
    {
      "_id": "68b1ac6b83002d9799564827",
      "name": "TechCorp Inc.",
      "description": "Leading technology company specializing in software solutions",
      "industry": "Technology",
      "size": "501-1000",
      "location": "San Francisco, CA",
      "website": "https://techcorp.com",
      "contacts": [
        {
          "name": "Jane Smith",
          "email": "hr@techcorp.com",
          "phone": "+15551234567",
          "position": "HR Manager"
        }
      ],
      "partnership": "premium",
      "status": "active",
      "totalJobs": 0,
      "totalHires": 0,
      "createdBy": "68b1ac6a83002d979956478f",
      "revenue": {
        "currency": "USD"
      },
      "benefits": [],
      "culture": [],
      "partnershipStartDate": "2025-08-29T13:34:35.491Z",
      "lastActivityAt": "2025-08-29T13:34:35.492Z",
      "createdAt": "2025-08-29T13:34:35.492Z",
      "updatedAt": "2025-08-29T13:34:35.492Z"
    },
    {
      "_id": "68b1ac6b83002d979956482a",
      "name": "InnovateInc",
      "description": "Innovative startup focused on AI and machine learning",
      "industry": "Artificial Intelligence",
      "size": "51-100",
      "location": "New York, NY",
      "website": "https://innovateinc.com",
      "contacts": [
        {
          "name": "Marcus Johnson",
          "email": "careers@innovateinc.com",
          "phone": "+15552345678",
          "position": "Talent Acquisition Lead"
        }
      ],
      "partnership": "standard",
      "status": "active",
      "totalJobs": 0,
      "totalHires": 0,
      "createdBy": "68b1ac6a83002d979956478f",
      "revenue": {
        "currency": "USD"
      },
      "benefits": [],
      "culture": [],
      "partnershipStartDate": "2025-08-29T13:34:35.532Z",
      "lastActivityAt": "2025-08-29T13:34:35.533Z",
      "createdAt": "2025-08-29T13:34:35.532Z",
      "updatedAt": "2025-08-29T13:34:35.532Z"
    }
  ],
  "candidates": [
    {
      "_id": "68b1ac6b83002d979956482e",
      "userId": "68b1ac6b83002d9799564820",
      "profile": {
        "skills": [
          "JavaScript",
          "React",
          "Node.js"
        ],
        "experience": [
          {
            "company": "Google",
            "position": "Senior Software Engineer",
            "startDate": "2020-03-01T00:00:00.000Z",
            "endDate": "2024-12-31T00:00:00.000Z",
            "description": "Led development of cloud-based applications.",
            "current": false
          }
        ],
        "education": [
          {
            "degree": "Bachelor of Science",
            "field": "Computer Science",
            "institution": "Stanford University",
            "graduationYear": 2018,
            "gpa": 3.8
          }
        ],
        "summary": "Senior software engineer with 6+ years of experience.",
        "location": "San Francisco, CA",
        "phoneNumber": "+15551234567",
        "preferredSalaryRange": {
          "currency": "USD"
        },
        "availability": {
          "startDate": "2026-01-01T00:00:00.000Z",
          "remote": true,
          "relocation": false
        },
        "certifications": [],
        "projects": []
      },
      "status": "active",
      "rating": 4.8,
      "tags": [
        "Senior",
        "Full-Stack",
        "React"
      ],
      "profileViews": 0,
      "notes": [],
      "lastActivityAt": "2025-08-29T13:34:36.354Z",
      "createdAt": "2025-08-29T13:34:35.595Z",
      "updatedAt": "2025-08-29T13:34:36.354Z"
    },
    {
      "_id": "68b1ac6b83002d9799564831",
      "userId": "68b1ac6b83002d9799564823",
      "profile": {
        "skills": [
          "Python",
          "Machine Learning",
          "SQL"
        ],
        "experience": [
          {
            "company": "Netflix",
            "position": "Senior Data Scientist",
            "startDate": "2021-01-01T00:00:00.000Z",
            "endDate": "2024-12-31T00:00:00.000Z",
            "description": "Built recommendation systems and predictive models.",
            "current": false
          }
        ],
        "education": [
          {
            "degree": "Master of Science",
            "field": "Data Science",
            "institution": "MIT",
            "graduationYear": 2019,
            "gpa": 3.9
          }
        ],
        "summary": "Senior data scientist with expertise in machine learning.",
        "location": "Boston, MA",
        "phoneNumber": "+15552345678",
        "preferredSalaryRange": {
          "currency": "USD"
        },
        "availability": {
          "startDate": "2026-01-15T00:00:00.000Z",
          "remote": true,
          "relocation": true
        },
        "certifications": [],
        "projects": []
      },
      "status": "active",
      "rating": 4.9,
      "tags": [
        "Senior",
        "ML",
        "Data Science"
      ],
      "profileViews": 0,
      "notes": [],
      "lastActivityAt": "2025-08-29T13:34:36.417Z",
      "createdAt": "2025-08-29T13:34:35.638Z",
      "updatedAt": "2025-08-29T13:34:36.417Z"
    },
    {
      "_id": "68b3f5c1b8c48927f8ee2338",
      "userId": "68b3f5c0b8c48927f8ee232b",
      "profile": {
        "skills": [
          "JavaScript",
          "React",
          "Node.js"
        ],
        "experience": [
          {
            "company": "Google",
            "position": "Senior Software Engineer",
            "startDate": "2020-03-01T00:00:00.000Z",
            "endDate": "2024-12-31T00:00:00.000Z",
            "description": "Led development of cloud-based applications.",
            "current": false
          }
        ],
        "education": [
          {
            "degree": "Bachelor of Science",
            "field": "Computer Science",
            "institution": "Stanford University",
            "graduationYear": 2018,
            "gpa": 3.8
          }
        ],
        "summary": "Senior software engineer with 6+ years of experience.",
        "location": "San Francisco, CA",
        "phoneNumber": "+15551234567",
        "preferredSalaryRange": {
          "currency": "USD"
        },
        "availability": {
          "startDate": "2026-01-01T00:00:00.000Z",
          "remote": true,
          "relocation": false
        },
        "certifications": [],
        "projects": []
      },
      "status": "active",
      "rating": 4.8,
      "tags": [
        "Senior",
        "Full-Stack",
        "React"
      ],
      "profileViews": 0,
      "notes": [],
      "lastActivityAt": "2025-08-31T07:12:03.822Z",
      "createdAt": "2025-08-31T07:12:01.573Z",
      "updatedAt": "2025-08-31T07:12:03.822Z"
    },
    {
      "_id": "68b3f5c1b8c48927f8ee233b",
      "userId": "68b3f5c0b8c48927f8ee2331",
      "profile": {
        "skills": [
          "Python",
          "Machine Learning",
          "SQL"
        ],
        "experience": [
          {
            "company": "Netflix",
            "position": "Senior Data Scientist",
            "startDate": "2021-01-01T00:00:00.000Z",
            "endDate": "2024-12-31T00:00:00.000Z",
            "description": "Built recommendation systems and predictive models.",
            "current": false
          }
        ],
        "education": [
          {
            "degree": "Master of Science",
            "field": "Data Science",
            "institution": "MIT",
            "graduationYear": 2019,
            "gpa": 3.9
          }
        ],
        "summary": "Senior data scientist with expertise in machine learning.",
        "location": "Boston, MA",
        "phoneNumber": "+15552345678",
        "preferredSalaryRange": {
          "currency": "USD"
        },
        "availability": {
          "startDate": "2026-01-15T00:00:00.000Z",
          "remote": true,
          "relocation": true
        },
        "certifications": [],
        "projects": []
      },
      "status": "active",
      "rating": 4.9,
      "tags": [
        "Senior",
        "ML",
        "Data Science"
      ],
      "profileViews": 0,
      "notes": [],
      "lastActivityAt": "2025-08-31T07:12:04.094Z",
      "createdAt": "2025-08-31T07:12:01.765Z",
      "updatedAt": "2025-08-31T07:12:04.095Z"
    }
  ]
};

module.exports = seedData;
