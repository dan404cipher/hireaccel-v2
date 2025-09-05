import mongoose from 'mongoose';
import argon2 from 'argon2';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { User } from '@/models/User';
import { Company } from '@/models/Company';
import { Job } from '@/models/Job';
import { Candidate } from '@/models/Candidate';
import { AgentAssignment } from '@/models/AgentAssignment';
import { CandidateAssignment } from '@/models/CandidateAssignment';

// Current database state (exported from live database)
const seedData = {
  "users": [
    {
      "_id": "68b1ac6a83002d979956478f",
      "customId": "ADMIN001",
      "email": "admin@hireaccel.com",
      "password": "Admin123!",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin",
      "status": "active",
      "emailVerified": true,
      "lastLoginAt": "2025-08-29T13:34:37.737Z",
      "createdAt": "2025-08-29T13:34:37.737Z",
      "updatedAt": "2025-08-29T13:34:37.737Z"
    },
    {
      "_id": "68b1ac6a83002d97995647b4",
      "customId": "HR00001",
      "email": "sarah.johnson@hireaccel.com",
      "password": "Hr123!",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "role": "hr",
      "status": "active",
      "emailVerified": true,
      "lastLoginAt": "2025-08-29T13:34:37.785Z",
      "createdAt": "2025-08-29T13:34:37.785Z",
      "updatedAt": "2025-08-29T13:34:37.785Z"
    },
    {
      "_id": "68b1ac6a83002d97995647e8",
      "customId": "HR00002",
      "email": "mike.chen@hireaccel.com",
      "password": "Hr123!",
      "firstName": "Mike",
      "lastName": "Chen",
      "role": "hr",
      "status": "active",
      "emailVerified": true,
      "lastLoginAt": "2025-08-29T13:34:37.785Z",
      "createdAt": "2025-08-29T13:34:37.785Z",
      "updatedAt": "2025-08-29T13:34:37.785Z"
    },
    {
      "_id": "68b1ac6a83002d9799564808",
      "customId": "AG00001",
      "email": "alex.smith@hireaccel.com",
      "password": "Agent123!",
      "firstName": "Alex",
      "lastName": "Smith",
      "role": "agent",
      "status": "active",
      "emailVerified": true,
      "lastLoginAt": "2025-08-29T13:34:37.762Z",
      "createdAt": "2025-08-29T13:34:37.762Z",
      "updatedAt": "2025-08-29T13:34:37.762Z"
    },
    {
      "_id": "68b1ac6a83002d9799564812",
      "customId": "AG00002",
      "email": "emily.davis@hireaccel.com",
      "password": "Agent123!",
      "firstName": "Emily",
      "lastName": "Davis",
      "role": "agent",
      "status": "active",
      "emailVerified": true,
      "lastLoginAt": "2025-08-29T13:34:37.762Z",
      "createdAt": "2025-08-29T13:34:37.762Z",
      "updatedAt": "2025-08-29T13:34:37.762Z"
    },
    {
      "_id": "68b3f5bfb8c48927f8ee22ba",
      "customId": "HR00003",
      "email": "john.doe@hireaccel.com",
      "password": "Hr123!",
      "firstName": "John",
      "lastName": "Doe",
      "role": "hr",
      "status": "active",
      "emailVerified": true,
      "lastLoginAt": "2025-08-29T13:34:37.785Z",
      "createdAt": "2025-08-29T13:34:37.785Z",
      "updatedAt": "2025-08-29T13:34:37.785Z"
    },
    {
      "_id": "68b3f5c0b8c48927f8ee22c0",
      "customId": "CAND00001",
      "email": "jane.smith@hireaccel.com",
      "password": "Candidate123!",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "candidate",
      "status": "active",
      "emailVerified": true,
      "lastLoginAt": "2025-08-29T13:34:37.762Z",
      "createdAt": "2025-08-29T13:34:37.762Z",
      "updatedAt": "2025-08-29T13:34:37.762Z"
    },
    {
      "_id": "68b3f5c1b8c48927f8ee22c1",
      "customId": "CAND00002",
      "email": "john.developer@email.com",
      "password": "Candidate123!",
      "firstName": "John",
      "lastName": "Developer",
      "role": "candidate",
      "status": "active",
      "emailVerified": true,
      "lastLoginAt": "2025-08-29T13:34:37.762Z",
      "createdAt": "2025-08-29T13:34:37.762Z",
      "updatedAt": "2025-08-29T13:34:37.762Z"
    },
    {
      "_id": "68b3f5c2b8c48927f8ee22c2",
      "customId": "CAND00003",
      "email": "sarah.data@email.com",
      "password": "Candidate123!",
      "firstName": "Sarah",
      "lastName": "Data",
      "role": "candidate",
      "status": "active",
      "emailVerified": true,
      "lastLoginAt": "2025-08-29T13:34:37.762Z",
      "createdAt": "2025-08-29T13:34:37.762Z",
      "updatedAt": "2025-08-29T13:34:37.762Z"
    },
    {
      "_id": "68b3f5c3b8c48927f8ee22c3",
      "customId": "CAND00004",
      "email": "mike.product@email.com",
      "password": "Candidate123!",
      "firstName": "Mike",
      "lastName": "Product",
      "role": "candidate",
      "status": "active",
      "emailVerified": true,
      "lastLoginAt": "2025-08-29T13:34:37.762Z",
      "createdAt": "2025-08-29T13:34:37.762Z",
      "updatedAt": "2025-08-29T13:34:37.762Z"
    }
  ],
  "companies": [
    {
      "_id": "68b1ac6b83002d9799564827",
      "name": "TechCorp Inc.",
      "description": "Leading technology company specializing in innovative solutions",
      "industry": "Technology",
      "size": "501-1000",
      "location": "San Francisco, CA",
      "website": "https://techcorp.com",
      "partnership": "premium",
      "status": "active",
      "rating": 4.5,
      "totalJobs": 3,
      "totalHires": 15,
      "contacts": [
        {
          "name": "Sarah Johnson",
          "email": "sarah.johnson@techcorp.com",
          "phone": "+15550123",
          "position": "HR Manager"
        }
      ],
      "createdAt": "2025-08-29T13:34:35.720Z",
      "updatedAt": "2025-08-29T13:34:35.720Z"
    },
    {
      "_id": "68b1ac6b83002d9799564828",
      "name": "InnovateStart",
      "description": "Startup company focused on disruptive technologies",
      "industry": "Technology",
      "size": "51-100",
      "location": "Austin, TX",
      "website": "https://innovatestart.com",
      "partnership": "standard",
      "status": "active",
      "rating": 4.2,
      "totalJobs": 2,
      "totalHires": 8,
      "contacts": [
        {
          "name": "Mike Chen",
          "email": "mike.chen@innovatestart.com",
          "phone": "+15550456",
          "position": "HR Director"
        }
      ],
      "createdAt": "2025-08-29T13:34:35.720Z",
      "updatedAt": "2025-08-29T13:34:35.720Z"
    }
  ],
  "jobs": [
    {
      "_id": "68b1ac6b83002d9799564837",
      "customId": "JOB00001",
      "title": "Senior React Developer",
      "description": "We are looking for a senior React developer to join our growing team. You will be responsible for building scalable web applications using modern React patterns and best practices.",
      "requirements": {
        "skills": ["React", "TypeScript", "Node.js", "JavaScript", "HTML", "CSS"],
        "experience": "senior",
        "education": ["Bachelor's in Computer Science", "Related field"],
        "languages": ["English"],
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
      "_id": "68b1ac6b83002d9799564838",
      "customId": "JOB00002",
      "title": "Data Scientist",
      "description": "Join our data science team to develop machine learning models and drive data-driven decisions.",
      "requirements": {
        "skills": ["Python", "Machine Learning", "Statistics", "SQL", "R"],
        "experience": "mid",
        "education": ["Master's in Data Science", "Statistics", "Computer Science"],
        "languages": ["English"],
        "certifications": []
      },
      "location": "Austin, TX",
      "type": "full-time",
      "salaryRange": {
        "min": 120000,
        "max": 150000,
        "currency": "USD"
      },
      "companyId": "68b1ac6b83002d9799564828",
      "status": "open",
      "urgency": "medium",
      "assignedAgentId": "68b1ac6a83002d9799564808",
      "createdBy": "68b1ac6a83002d97995647e8",
      "applications": 0,
      "postedAt": "2025-08-29T13:34:35.720Z",
      "isRemote": false,
      "benefits": [],
      "interviewProcess": {
        "rounds": 2
      },
      "isPublic": true,
      "sourcingChannels": [],
      "views": 0,
      "createdAt": "2025-08-29T13:30:35.739Z",
      "updatedAt": "2025-08-29T13:30:35.739Z"
    },
    {
      "_id": "68b1ac6b83002d9799564839",
      "customId": "JOB00003",
      "title": "Product Manager",
      "description": "Lead product development and strategy for our innovative platform.",
      "requirements": {
        "skills": ["Product Management", "Agile", "User Research", "Analytics", "Leadership"],
        "experience": "senior",
        "education": ["Bachelor's in Business", "Engineering", "Related field"],
        "languages": ["English"],
        "certifications": []
      },
      "location": "San Francisco, CA",
      "type": "full-time",
      "salaryRange": {
        "min": 150000,
        "max": 200000,
        "currency": "USD"
      },
      "companyId": "68b1ac6b83002d9799564827",
      "status": "open",
      "urgency": "medium",
      "assignedAgentId": "68b1ac6a83002d9799564808",
      "createdBy": "68b1ac6a83002d97995647b4",
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
      "createdAt": "2025-08-29T13:34:35.739Z",
      "updatedAt": "2025-08-29T13:34:35.739Z"
    },
    {
      "_id": "68b1ac6b83002d979956483a",
      "customId": "JOB00004",
      "title": "Frontend Developer",
      "description": "Build beautiful and responsive user interfaces for web applications.",
      "requirements": {
        "skills": ["JavaScript", "React", "CSS", "HTML", "UI/UX"],
        "experience": "junior",
        "education": ["Bachelor's in Computer Science", "Design", "Related field"],
        "languages": ["English"],
        "certifications": []
      },
      "location": "Remote",
      "type": "full-time",
      "salaryRange": {
        "min": 80000,
        "max": 110000,
        "currency": "USD"
      },
      "companyId": "68b1ac6b83002d9799564828",
      "status": "open",
      "urgency": "low",
      "assignedAgentId": "68b1ac6a83002d9799564808",
      "createdBy": "68b1ac6a83002d97995647e8",
      "applications": 0,
      "postedAt": "2025-08-29T13:34:35.720Z",
      "isRemote": true,
      "benefits": [],
      "interviewProcess": {
        "rounds": 2
      },
      "isPublic": true,
      "sourcingChannels": [],
      "views": 0,
      "createdAt": "2025-08-29T13:34:35.739Z",
      "updatedAt": "2025-08-29T13:34:35.739Z"
    },
    {
      "_id": "68b1ac6b83002d979956483b",
      "customId": "JOB00005",
      "title": "DevOps Engineer",
      "description": "Manage and optimize our cloud infrastructure and deployment pipelines.",
      "requirements": {
        "skills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux"],
        "experience": "mid",
        "education": ["Bachelor's in Computer Science", "IT", "Related field"],
        "languages": ["English"],
        "certifications": []
      },
      "location": "San Francisco, CA",
      "type": "full-time",
      "salaryRange": {
        "min": 130000,
        "max": 170000,
        "currency": "USD"
      },
      "companyId": "68b1ac6b83002d9799564827",
      "status": "open",
      "urgency": "high",
      "assignedAgentId": "68b1ac6a83002d9799564808",
      "createdBy": "68b1ac6a83002d97995647b4",
      "applications": 0,
      "postedAt": "2025-08-29T13:34:35.720Z",
      "isRemote": false,
      "benefits": [],
      "interviewProcess": {
        "rounds": 2
      },
      "isPublic": true,
      "sourcingChannels": [],
      "views": 0,
      "createdAt": "2025-08-29T13:34:35.739Z",
      "updatedAt": "2025-08-29T13:34:35.739Z"
    }
  ],
  "candidates": [
    {
      "_id": "68b1ac6b83002d9799564823",
      "customId": "CAND00001",
      "userId": "68b3f5c0b8c48927f8ee22c0",
      "profile": {
        "skills": [
          "JavaScript",
          "TypeScript",
          "React",
          "Node.js",
          "Python",
          "Docker",
          "AWS",
          "MongoDB",
          "PostgreSQL",
          "GraphQL",
          "REST APIs",
          "CI/CD",
          "Agile"
        ],
        "experience": [
          {
            "company": "TechCorp Inc",
            "position": "Senior Software Engineer",
            "startDate": "2022-01-15T00:00:00.000Z",
            "description": "Led development of microservices architecture serving 1M+ users. Implemented CI/CD pipelines reducing deployment time by 60%. Mentored 3 junior developers.",
            "current": true
          },
          {
            "company": "StartupXYZ",
            "position": "Full Stack Developer",
            "startDate": "2020-03-01T00:00:00.000Z",
            "endDate": "2021-12-31T00:00:00.000Z",
            "description": "Built e-commerce platform from scratch using React and Node.js. Integrated payment gateways and implemented real-time analytics dashboard.",
            "current": false
          },
          {
            "company": "WebDev Solutions",
            "position": "Junior Developer",
            "startDate": "2019-06-01T00:00:00.000Z",
            "endDate": "2020-02-28T00:00:00.000Z",
            "description": "Developed responsive web applications using modern JavaScript frameworks. Collaborated with design team to implement pixel-perfect UIs.",
            "current": false
          }
        ],
        "education": [
          {
            "degree": "Bachelor of Science",
            "field": "Computer Science",
            "institution": "Stanford University",
            "graduationYear": 2019,
            "gpa": 3.8
          },
          {
            "degree": "Master of Science",
            "field": "Software Engineering",
            "institution": "UC Berkeley",
            "graduationYear": 2021,
            "gpa": 3.9
          }
        ],
        "certifications": [
          {
            "name": "AWS Certified Solutions Architect",
            "issuer": "Amazon Web Services",
            "issueDate": "2023-03-15T00:00:00.000Z",
            "expiryDate": "2026-03-15T00:00:00.000Z",
            "credentialId": "AWS-CSA-2023-001234",
            "credentialUrl": "https://aws.amazon.com/verification/AWS-CSA-2023-001234"
          },
          {
            "name": "Certified Kubernetes Administrator",
            "issuer": "Cloud Native Computing Foundation",
            "issueDate": "2022-11-20T00:00:00.000Z",
            "expiryDate": "2025-11-20T00:00:00.000Z",
            "credentialId": "CKA-2022-567890",
            "credentialUrl": "https://training.linuxfoundation.org/certification/verify"
          }
        ],
        "projects": [
          {
            "title": "E-commerce Analytics Platform",
            "description": "Built a real-time analytics platform for e-commerce businesses using React, Node.js, and Apache Kafka. Features include real-time dashboards, automated reporting, and predictive analytics.",
            "technologies": [
              "React",
              "Node.js",
              "Apache Kafka",
              "PostgreSQL",
              "Docker"
            ],
            "startDate": "2023-01-01T00:00:00.000Z",
            "current": true,
            "projectUrl": "https://analytics-platform.demo.com",
            "githubUrl": "https://github.com/janesmith/ecommerce-analytics",
            "role": "Lead Developer"
          },
          {
            "title": "Task Management Mobile App",
            "description": "Developed a cross-platform mobile app for task management with offline capabilities, real-time collaboration, and smart notifications.",
            "technologies": [
              "React Native",
              "Firebase",
              "Redux",
              "Jest"
            ],
            "startDate": "2022-06-01T00:00:00.000Z",
            "endDate": "2022-12-15T00:00:00.000Z",
            "current": false,
            "projectUrl": "https://taskapp.demo.com",
            "githubUrl": "https://github.com/janesmith/task-manager",
            "role": "Full Stack Developer"
          }
        ],
        "summary": "Experienced software engineer with 5+ years in full-stack development, specializing in React, Node.js, and cloud technologies. Passionate about building scalable applications and mentoring junior developers.",
        "location": "San Francisco, CA",
        "phoneNumber": "+15551234567",
        "linkedinUrl": "https://linkedin.com/in/janesmith",
        "portfolioUrl": "https://janesmith.dev",
        "preferredSalaryRange": {
          "min": 120000,
          "max": 160000,
          "currency": "USD"
        },
        "availability": {
          "startDate": "2025-12-01T00:00:00.000Z",
          "remote": true,
          "relocation": true
        }
      },
      "rating": 4.8,
      "resumeFileId": "68b1ac6b83002d9799564824",
      "status": "active",
      "createdAt": "2025-08-29T13:34:35.762Z",
      "updatedAt": "2025-09-03T09:00:16.146Z",
      "lastActivityAt": "2025-09-03T09:00:16.146Z",
      "profileViews": 0,
      "tags": [],
      "totalExperience": 6.1,
      "experienceLevel": "senior",
      "hasResume": true,
      "profileCompletion": 100
    },
    {
      "_id": "68b1ac6b83002d9799564825",
      "customId": "CAND00002",
      "userId": "68b3f5c1b8c48927f8ee22c1",
      "profile": {
        "skills": ["Data Science", "Python", "Machine Learning", "SQL", "Statistics"],
        "summary": "Data scientist with expertise in ML models and statistical analysis",
        "location": "Austin, TX",
        "phoneNumber": "+15550124",
        "experience": [
          {
            "position": "Data Scientist",
            "company": "DataCorp",
            "startDate": "2021-01-15T00:00:00.000Z",
            "endDate": "2023-12-31T00:00:00.000Z",
            "description": "Developed machine learning models for predictive analytics and data-driven decision making.",
            "current": false
          }
        ],
        "preferredSalaryRange": {
          "min": 100000,
          "max": 140000,
          "currency": "USD"
        }
      },
      "rating": 4.6,
      "resumeFileId": "68b1ac6b83002d9799564826",
      "status": "active",
      "createdAt": "2025-08-29T13:34:35.762Z",
      "updatedAt": "2025-08-29T13:34:35.762Z"
    },
    {
      "_id": "68b1ac6b83002d979956482e",
      "customId": "CAND00003",
      "userId": "68b3f5c2b8c48927f8ee22c2",
      "profile": {
        "skills": ["React", "TypeScript", "Node.js", "JavaScript", "HTML", "CSS"],
        "summary": "Senior React developer with strong portfolio and 5+ years experience",
        "location": "Remote",
        "phoneNumber": "+15550125",
        "experience": [
          {
            "position": "Frontend Developer",
            "company": "WebSolutions",
            "startDate": "2020-06-01T00:00:00.000Z",
            "endDate": "2023-05-31T00:00:00.000Z",
            "description": "Built responsive web applications using React and modern JavaScript frameworks.",
            "current": false
          }
        ],
        "preferredSalaryRange": {
          "min": 140000,
          "max": 180000,
          "currency": "USD"
        }
      },
      "rating": 4.8,
      "resumeFileId": "68b1ac6b83002d979956482f",
      "status": "active",
      "createdAt": "2025-08-29T13:34:35.762Z",
      "updatedAt": "2025-08-29T13:34:35.762Z"
    },
    {
      "_id": "68b1ac6b83002d9799564830",
      "customId": "CAND00004",
      "userId": "68b3f5c3b8c48927f8ee22c3",
      "profile": {
        "skills": ["Product Management", "Agile", "User Research", "Analytics"],
        "summary": "Product manager with track record of successful product launches",
        "location": "San Francisco, CA",
        "phoneNumber": "+15550126",
        "experience": [
          {
            "position": "Product Manager",
            "company": "ProductCorp",
            "startDate": "2022-03-01T00:00:00.000Z",
            "description": "Led product strategy and development for SaaS platform serving 10K+ users.",
            "current": true
          }
        ],
        "preferredSalaryRange": {
          "min": 150000,
          "max": 200000,
          "currency": "USD"
        }
      },
      "rating": 4.7,
      "resumeFileId": "68b1ac6b83002d9799564831",
      "status": "active",
      "createdAt": "2025-08-29T13:34:35.762Z",
      "updatedAt": "2025-08-29T13:34:35.762Z"
    }
  ],
  "agentassignments": [
    {
      "_id": "68b1ac6d83002d97995648a4",
      "agentId": "68b1ac6a83002d9799564808",
      "assignedHRs": ["68b1ac6a83002d97995647b4", "68b1ac6a83002d97995647e8"],
      "assignedCandidates": ["68b1ac6b83002d9799564823", "68b1ac6b83002d979956482e", "68b1ac6b83002d9799564830"],
      "assignedBy": "68b1ac6a83002d979956478f",
      "status": "active",
      "notes": "",
      "assignedAt": "2025-08-29T13:34:37.593Z",
      "createdAt": "2025-08-29T13:34:37.594Z",
      "updatedAt": "2025-08-29T13:34:37.594Z"
    },
    {
      "_id": "68b1ac6d83002d97995648a7",
      "agentId": "68b1ac6a83002d9799564812",
      "assignedHRs": ["68b1ac6a83002d97995647b4"],
      "assignedCandidates": ["68b1ac6b83002d9799564825"],
      "assignedBy": "68b1ac6a83002d979956478f",
      "status": "active",
      "notes": "",
      "assignedAt": "2025-08-29T13:34:37.593Z",
      "createdAt": "2025-08-29T13:34:37.594Z",
      "updatedAt": "2025-08-29T13:34:37.594Z"
    }
  ],
  "candidateassignments": [
    {
      "_id": "68b3f5c7b8c48927f8ee2385",
      "candidateId": "68b1ac6b83002d979956482e",
      "assignedTo": "68b3f5bfb8c48927f8ee22ba",
      "assignedBy": "68b1ac6a83002d9799564808",
      "jobId": "68b1ac6b83002d9799564837",
      "status": "active",
      "priority": "high",
      "notes": "Excellent React skills, perfect match for senior role. Strong portfolio and 5+ years experience.",
      "dueDate": "2025-09-01T13:34:37.375Z",
      "assignedAt": "2025-08-29T13:34:37.394Z",
      "createdAt": "2025-08-29T13:34:37.394Z",
      "updatedAt": "2025-08-29T13:34:37.394Z"
    }
  ]
};

async function seedDatabase() {
  try {
    // Connect to MongoDB using Mongoose
    await mongoose.connect(env.MONGO_URI);
    logger.info('Connected to MongoDB');
    
    logger.info('\n=== Starting Database Seed ===');
    
    // Clear existing data
    logger.info('\nClearing existing data...');
    const db = mongoose.connection.db;
    if (db) {
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      for (const collectionName of ['users', 'companies', 'jobs', 'candidates', 'agentassignments', 'candidateassignments']) {
        if (collectionNames.includes(collectionName)) {
          await db.dropCollection(collectionName);
          logger.info(`  - Dropped ${collectionName} collection`);
        } else {
          logger.info(`  - ${collectionName} collection does not exist`);
        }
      }
    }
    
    // Insert seed data using Mongoose models
    logger.info('\nInserting seed data...');
    
    // Insert Users
    logger.info('  - Inserting users...');
    const processedUsers = await Promise.all(seedData.users.map(async (userData: any) => {
      const user = new User({
        ...userData,
        password: await argon2.hash(userData.password)
      });
      return user.save();
    }));
    logger.info(`  - Inserted ${processedUsers.length} users`);
    
    // Create a mapping of old user IDs to new user IDs
    const userIdMapping: { [key: string]: string } = {};
    seedData.users.forEach((oldUser: any, index: number) => {
      if (processedUsers[index]) {
        userIdMapping[oldUser._id] = processedUsers[index]._id.toString();
      }
    });
    
    // Insert Companies (manually set companyId to avoid conflicts)
    logger.info('  - Inserting companies...');
    const processedCompanies = await Promise.all(seedData.companies.map(async (companyData: any, index: number) => {
      const company = new Company({
        ...companyData,
        companyId: `COMP${(index + 1).toString().padStart(5, '0')}`, // Manually set companyId
        createdBy: userIdMapping[companyData.createdBy] || companyData.createdBy || processedUsers[0]?._id
      });
      return company.save();
    }));
    logger.info(`  - Inserted ${processedCompanies.length} companies`);
    
    // Create a mapping of old company IDs to new company IDs for jobs
    const companyIdMapping: { [key: string]: string } = {};
    seedData.companies.forEach((oldCompany: any, index: number) => {
      if (processedCompanies[index]) {
        companyIdMapping[oldCompany._id] = processedCompanies[index]._id.toString();
      }
    });
    
    // Insert Jobs (manually set jobId to avoid conflicts)
    logger.info('  - Inserting jobs...');
    const processedJobs = await Promise.all(seedData.jobs.map(async (jobData: any, index: number) => {
      const job = new Job({
        ...jobData,
        jobId: `JOB${(index + 1).toString().padStart(5, '0')}`, // Manually set jobId
        companyId: companyIdMapping[jobData.companyId] || jobData.companyId || processedCompanies[0]?._id,
        assignedAgentId: userIdMapping[jobData.assignedAgentId] || jobData.assignedAgentId || processedUsers[0]?._id,
        createdBy: userIdMapping[jobData.createdBy] || jobData.createdBy || processedUsers[0]?._id
      });
      return job.save();
    }));
    logger.info(`  - Inserted ${processedJobs.length} jobs`);
    
    // Insert Candidates
    logger.info('  - Inserting candidates...');
    const processedCandidates = await Promise.all(seedData.candidates.map(async (candidateData: any) => {
      const candidate = new Candidate({
        ...candidateData,
        userId: userIdMapping[candidateData.userId] || candidateData.userId || processedUsers[0]?._id
      });
      return candidate.save();
    }));
    logger.info(`  - Inserted ${processedCandidates.length} candidates`);
    
    // Create mappings for agent assignments
    const agentIdMapping: { [key: string]: string } = {};
    const hrIdMapping: { [key: string]: string } = {};
    const candidateIdMapping: { [key: string]: string } = {};
    
    seedData.users.forEach((user: any, index: number) => {
      if (processedUsers[index]) {
        if (user.role === 'agent') {
          agentIdMapping[user._id] = processedUsers[index]._id.toString();
        } else if (user.role === 'hr') {
          hrIdMapping[user._id] = processedUsers[index]._id.toString();
        }
      }
    });
    
    seedData.candidates.forEach((candidate: any, index: number) => {
      if (processedCandidates[index]) {
        candidateIdMapping[candidate._id] = processedCandidates[index]._id.toString();
      }
    });
    
    // Insert Agent Assignments
    logger.info('  - Inserting agent assignments...');
    const processedAgentAssignments = await Promise.all(seedData.agentassignments.map(async (assignmentData: any) => {
      const assignment = new AgentAssignment({
        ...assignmentData,
        agentId: agentIdMapping[assignmentData.agentId] || assignmentData.agentId || processedUsers[0]?._id,
        assignedHRs: assignmentData.assignedHRs.map((id: string) => hrIdMapping[id] || id),
        assignedCandidates: assignmentData.assignedCandidates.map((id: string) => candidateIdMapping[id] || id),
        assignedBy: userIdMapping[assignmentData.assignedBy] || assignmentData.assignedBy || processedUsers[0]?._id
      });
      return assignment.save();
    }));
    logger.info(`  - Inserted ${processedAgentAssignments.length} agent assignments`);
    
    // Create job ID mapping
    const jobIdMapping: { [key: string]: string } = {};
    seedData.jobs.forEach((job: any, index: number) => {
      if (processedJobs[index]) {
        jobIdMapping[job._id] = processedJobs[index]._id.toString();
      }
    });
    
    // Insert Candidate Assignments
    logger.info('  - Inserting candidate assignments...');
    const processedCandidateAssignments = await Promise.all(seedData.candidateassignments.map(async (assignmentData: any) => {
      const assignment = new CandidateAssignment({
        ...assignmentData,
        candidateId: candidateIdMapping[assignmentData.candidateId] || assignmentData.candidateId || processedCandidates[0]?._id,
        assignedTo: userIdMapping[assignmentData.assignedTo] || assignmentData.assignedTo || processedUsers[0]?._id,
        assignedBy: userIdMapping[assignmentData.assignedBy] || assignmentData.assignedBy || processedUsers[0]?._id,
        jobId: jobIdMapping[assignmentData.jobId] || assignmentData.jobId || processedJobs[0]?._id
      });
      return assignment.save();
    }));
    logger.info(`  - Inserted ${processedCandidateAssignments.length} candidate assignments`);
    
    logger.info('\n✅ Database seeded successfully!');
    logger.info('\n=== Seed Summary ===');
    logger.info(`Users: ${processedUsers.length}`);
    logger.info(`Companies: ${processedCompanies.length}`);
    logger.info(`Jobs: ${processedJobs.length}`);
    logger.info(`Candidates: ${processedCandidates.length}`);
    logger.info(`Agent Assignments: ${processedAgentAssignments.length}`);
    logger.info(`Candidate Assignments: ${processedCandidateAssignments.length}`);
    
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('\nDisconnected from MongoDB');
  }
}

// Run the seed
seedDatabase().catch(console.error);