# Database Seed File Documentation

## Overview
This seed file (`seed-current-state.js`) contains the exact replica of the current, cleaned-up database state after implementing new validation rules and removing invalid data.

## What This Seed File Contains

### **Users (7 total)**
- **Admin User**: `admin@hireaccel.com` - System administrator
- **HR Users**: 
  - `sarah.johnson@hireaccel.com` - Sarah Johnson
  - `mike.chen@hireaccel.com` - Mike Chen  
  - `john.doe@hireaccel.com` - John Doe
- **Agent Users**:
  - `alex.smith@hireaccel.com` - Alex Smith
  - `emily.davis@hireaccel.com` - Emily Davis
- **Candidate User**: `jane.smith@hireaccel.com` - Jane Smith

### **Companies (2 total)**
- **TechCorp Inc.**: Premium partnership, San Francisco, 500-1000 employees
- **InnovateStart**: Standard partnership, Austin, 50-100 employees

### **Jobs (5 total)**
- **Senior React Developer**: Remote, $140k-$180k, posted by John Doe (TechCorp)
- **Data Scientist**: Austin, $120k-$150k, posted by Mike Chen (InnovateStart)
- **Product Manager**: San Francisco, $150k-$200k, posted by Sarah Johnson (TechCorp)
- **Frontend Developer**: Remote, $80k-$110k, posted by Mike Chen (InnovateStart)
- **DevOps Engineer**: San Francisco, $130k-$170k, posted by Sarah Johnson (TechCorp)

### **Candidates (4 total)**
- **Full-Stack Developer**: React, JavaScript, TypeScript, Node.js, Python
- **Data Scientist**: Python, Machine Learning, Statistics, SQL, R
- **Senior React Developer**: React, TypeScript, Node.js, JavaScript, HTML, CSS
- **Product Manager**: Product Management, Agile, User Research, Analytics

### **Agent Assignments (4 total)**
- **Alex Smith**: Assigned to Sarah Johnson & Mike Chen
- **Emily Davis**: Assigned to Sarah Johnson
- **Alex Smith**: Additional assignment to Sarah Johnson
- **Alex Smith**: Assigned to Mike Chen

### **Candidate Assignments (1 total)**
- **Valid Assignment**: Senior React Developer candidate assigned to John Doe (who posted the job) by Alex Smith (who has permission)

## Key Validation Rules Implemented

### **Job Ownership**
- HR users can only see candidates assigned for jobs they posted
- Agents can only assign candidates to HR users for jobs those HR users posted

### **Agent Permissions**
- Agents can only assign candidates to HR users they're assigned to work with
- All assignments respect the AgentAssignment relationships

### **Data Integrity**
- All ObjectIds are properly linked
- No orphaned references
- Consistent data relationships

## How to Use This Seed File

### **Restore Database to Current State**
```bash
cd api
node seed-current-state.js
```

### **What This Does**
1. Connects to MongoDB Atlas
2. Clears all existing data in the specified collections
3. Inserts the seed data with proper ObjectId conversions
4. Maintains all relationships and data integrity

### **When to Use**
- **Development**: Reset database to known good state
- **Testing**: Ensure consistent test data
- **Production Recovery**: Restore database after issues
- **New Environment Setup**: Initialize fresh database

## Important Notes

### **Before Using**
- ⚠️ **WARNING**: This will DELETE all existing data in the specified collections
- Make sure you have backups if needed
- Ensure you're connecting to the correct database

### **After Seeding**
- All validation rules will be enforced
- HR users will only see candidates for their own jobs
- Agents will only be able to assign to permitted HR users
- Data integrity will be maintained

### **Collections Not Included**
- `auditlogs`: System audit trail (not seeded)
- `tasks`: Task management (not seeded)
- `files`: File uploads (not seeded)
- `interviews`: Interview scheduling (not seeded)
- `applications`: Job applications (not seeded)

## Data Relationships

```
Users (HR) → Jobs → Candidates → CandidateAssignments
     ↓           ↓        ↓              ↓
AgentAssignments ← Agents ← Candidates ← HR Users
```

This ensures that:
1. HR users only see candidates for their own jobs
2. Agents can only assign to HR users they're assigned to
3. All assignments respect job ownership and agent permissions

## Generated On
**Date**: 2025-08-31T12:02:15.780Z
**Purpose**: Database cleanup and validation rule implementation
**Status**: ✅ Validated and cleaned
