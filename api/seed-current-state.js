const { MongoClient } = require('mongodb');
const argon2 = require('argon2');

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
      "size": "500-1000",
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
          "phone": "+1-555-0123",
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
      "size": "50-100",
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
          "phone": "+1-555-0456",
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
        "experience": "mid-level",
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
        "experience": "mid-level",
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
        "phoneNumber": "+1-555-0124",
        "experience": [
          {
            "position": "Data Scientist",
            "company": "DataCorp",
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
        "phoneNumber": "+1-555-0125",
        "experience": [
          {
            "position": "Frontend Developer",
            "company": "WebSolutions",
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
        "phoneNumber": "+1-555-0126",
        "experience": [
          {
            "position": "Product Manager",
            "company": "ProductCorp",
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
  const uri = 'mongodb+srv://vaccel:PlHUbhJ3iUnbMOHU@v-accel-suites.rqyglx.mongodb.net/hireaccel?retryWrites=true&w=majority&appName=hire-accel-v2';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('hireaccel');
    
    console.log('\n=== Starting Database Seed ===');
    
    // Clear existing data
    console.log('\nClearing existing data...');
    for (const collectionName of Object.keys(seedData)) {
      await db.collection(collectionName).deleteMany({});
      console.log(`  - Cleared ${collectionName}`);
    }
    
    // Insert seed data
    console.log('\nInserting seed data...');
    for (const [collectionName, documents] of Object.entries(seedData)) {
      if (documents.length > 0) {
        // Convert string IDs back to ObjectIds and hash passwords for users
        const processedDocs = await Promise.all(documents.map(async doc => {
          const processed = { ...doc };
          const { ObjectId } = require('mongodb');
          
          // Convert _id back to ObjectId
          if (processed._id) {
            processed._id = new ObjectId(processed._id);
          }
          
          // Convert other ObjectId fields
          if (processed.createdBy) processed.createdBy = new ObjectId(processed.createdBy);
          if (processed.updatedBy) processed.updatedBy = new ObjectId(processed.updatedBy);
          if (processed.userId) processed.userId = new ObjectId(processed.userId);
          if (processed.companyId) processed.companyId = new ObjectId(processed.companyId);
          if (processed.jobId) processed.jobId = new ObjectId(processed.jobId);
          if (processed.candidateId) processed.candidateId = new ObjectId(processed.candidateId);
          if (processed.assignedBy) processed.assignedBy = new ObjectId(processed.assignedBy);
          if (processed.assignedTo) processed.assignedTo = new ObjectId(processed.assignedTo);
          if (processed.agentId) processed.agentId = new ObjectId(processed.agentId);
          if (processed.assignedHRs) {
            processed.assignedHRs = processed.assignedHRs.map(id => new ObjectId(id));
          }
          if (processed.assignedCandidates) {
            processed.assignedCandidates = processed.assignedCandidates.map(id => new ObjectId(id));
          }
          
          // Hash password for users
          if (processed.password && collectionName === 'users') {
            processed.password = await argon2.hash(processed.password);
          }
          
          return processed;
        }));
        
        const result = await db.collection(collectionName).insertMany(processedDocs);
        console.log(`  - Inserted ${result.insertedCount} documents into ${collectionName}`);
      }
    }
    
    console.log('\n✅ Database seeded successfully!');
    console.log('\n=== Seed Summary ===');
    Object.entries(seedData).forEach(([collectionName, documents]) => {
      console.log(`${collectionName}: ${documents.length} documents`);
    });
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the seed
seedDatabase().catch(console.error);
