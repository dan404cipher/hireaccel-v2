import mongoose from 'mongoose';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { User } from '@/models/User';
import { Company } from '@/models/Company';
import { Candidate } from '@/models/Candidate';
import { Job } from '@/models/Job';
import { Application } from '@/models/Application';
import { Interview } from '@/models/Interview';
import { Task } from '@/models/Task';
import { File } from '@/models/File';
import { AuditLog } from '@/models/AuditLog';
import { CandidateAssignment } from '@/models/CandidateAssignment';
import { AgentAssignment } from '@/models/AgentAssignment';
import { 
  UserRole, 
  UserStatus, 
  CompanyStatus, 
  PartnershipLevel, 
  CandidateStatus,
  JobType,
  JobUrgency,
  JobStatus,
  ExperienceLevel,
  ApplicationStatus,
  ApplicationStage,
  InterviewType,
  InterviewStatus,
  InterviewRound,
  TaskStatus,
  TaskPriority,
  FileCategory,
  AuditAction
} from '@/types';
import * as argon2 from 'argon2';

const main = async () => {
  try {
    logger.info('🌱 Starting database seeding...');
    
    await seedUsers();
    await seedCompanies();
    await seedCandidates();
    await seedJobs();
    await seedApplications();
    await seedInterviews();
    await seedTasks();
    await seedFiles();
    await seedCandidateAssignments();
    await seedAgentAssignments();
    await seedAuditLogs();
    
    logger.info('✅ Database seeding completed successfully!');
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  logger.info('Seeding users...');
  
  // Clear existing users to ensure fresh passwords
  await User.deleteMany({});
  logger.info('Cleared existing users');
  
  const users = [
    // Admin
    {
      email: 'admin@hireaccel.com',
      password: 'Admin123!',
      role: UserRole.ADMIN,
      firstName: 'Admin',
      lastName: 'User',
    },
    // HR Users
    {
      email: 'hr1@company.com',
      password: 'Hr123!',
      role: UserRole.HR,
      firstName: 'Sarah',
      lastName: 'Johnson',
    },
    {
      email: 'hr2@company.com',
      password: 'Hr123!',
      role: UserRole.HR,
      firstName: 'Mike',
      lastName: 'Chen',
    },
    // Agents
    {
      email: 'agent1@hireaccel.com',
      password: 'Agent123!',
      role: UserRole.AGENT,
      firstName: 'Alex',
      lastName: 'Smith',
    },
    {
      email: 'agent2@hireaccel.com',
      password: 'Agent123!',
      role: UserRole.AGENT,
      firstName: 'Lisa',
      lastName: 'Brown',
    },
    // Candidates
    {
      email: 'john.doe@email.com',
      password: 'Candidate123!',
      role: UserRole.CANDIDATE,
      firstName: 'John',
      lastName: 'Doe',
    },
    {
      email: 'sarah.miller@email.com',
      password: 'Candidate123!',
      role: UserRole.CANDIDATE,
      firstName: 'Sarah',
      lastName: 'Miller',
    },
  ];
  
  for (const userData of users) {
    const existingUser = await User.findByEmail(userData.email);
    if (!existingUser) {
      try {
        const hashedPassword = await argon2.hash(userData.password, {
          type: argon2.argon2id,
          memoryCost: 2 ** 16,
          timeCost: 3,
          parallelism: 1,
          hashLength: 50,
        });
        
        const user = new User({
          ...userData,
          password: hashedPassword,
          status: UserStatus.ACTIVE,
          emailVerified: true,
        });
        await user.save();
      logger.info(`Created user: ${userData.email}`);
      } catch (error) {
        logger.error(`Failed to create user ${userData.email}:`, error);
        throw error;
      }
    } else {
      logger.info(`User already exists: ${userData.email}`);
    }
  }
};

const seedCompanies = async () => {
  logger.info('Seeding companies...');
  
  const adminUser = await User.findOne({ role: UserRole.ADMIN });
  if (!adminUser) {
    throw new Error('Admin user not found');
  }
  
  const companies = [
    {
      name: 'TechCorp Inc.',
      description: 'Leading technology company specializing in software solutions',
      industry: 'Technology',
      size: '501-1000',
      location: 'San Francisco, CA',
      website: 'https://techcorp.com',
      contacts: [{
        email: 'hr@techcorp.com',
        phone: '+15551234567',
        name: 'Jane Smith',
        position: 'HR Manager',
      }],
      partnership: PartnershipLevel.PREMIUM,
      createdBy: adminUser._id,
    },
    {
      name: 'InnovateInc',
      description: 'Innovative startup focused on AI and machine learning',
      industry: 'Artificial Intelligence',
      size: '51-100',
      location: 'New York, NY',
      website: 'https://innovateinc.com',
      contacts: [{
        email: 'careers@innovateinc.com',
        phone: '+15552345678',
        name: 'Marcus Johnson',
        position: 'Talent Acquisition Lead',
      }],
      partnership: PartnershipLevel.STANDARD,
      createdBy: adminUser._id,
    },
  ];
  
  for (const companyData of companies) {
    const existingCompany = await Company.findOne({ name: companyData.name });
    if (!existingCompany) {
      try {
        const company = new Company({
          ...companyData,
          status: CompanyStatus.ACTIVE,
        });
      await company.save();
      logger.info(`Created company: ${companyData.name}`);
      } catch (error) {
        logger.error(`Failed to create company ${companyData.name}:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          validationErrors: (error as any)?.errors ? Object.keys((error as any).errors).map(key => ({
            field: key,
            message: (error as any).errors[key].message
          })) : undefined,
          companyData
        });
        throw error;
      }
    } else {
      logger.info(`Company already exists: ${companyData.name}`);
    }
  }
};

const seedCandidates = async () => {
  logger.info('Seeding candidates...');
  
  const candidateUsers = await User.find({ role: UserRole.CANDIDATE });
  
  const candidateProfiles = [
    {
      email: 'john.doe@email.com',
      profile: {
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: [
          {
            company: 'Google',
            position: 'Senior Software Engineer',
            startDate: new Date('2020-03-01'),
            endDate: new Date('2024-12-31'),
            description: 'Led development of cloud-based applications.',
            current: false,
          },
        ],
        education: [
          {
            degree: 'Bachelor of Science',
            field: 'Computer Science',
            institution: 'Stanford University',
            graduationYear: 2018,
            gpa: 3.8,
          },
        ],
        summary: 'Senior software engineer with 6+ years of experience.',
        location: 'San Francisco, CA',
        phoneNumber: '+15551234567',
        availability: {
          startDate: new Date('2026-01-01'),
          remote: true,
          relocation: false,
        },
      },
      status: CandidateStatus.ACTIVE,
      rating: 4.8,
      tags: ['Senior', 'Full-Stack', 'React'],
    },
    {
      email: 'sarah.miller@email.com',
      profile: {
        skills: ['Python', 'Machine Learning', 'SQL'],
        experience: [
          {
            company: 'Netflix',
            position: 'Senior Data Scientist',
            startDate: new Date('2021-01-01'),
            endDate: new Date('2024-12-31'),
            description: 'Built recommendation systems and predictive models.',
            current: false,
          },
        ],
        education: [
          {
            degree: 'Master of Science',
            field: 'Data Science',
            institution: 'MIT',
            graduationYear: 2019,
            gpa: 3.9,
          },
        ],
        summary: 'Senior data scientist with expertise in machine learning.',
        location: 'Boston, MA',
        phoneNumber: '+15552345678',
        availability: {
          startDate: new Date('2026-01-15'),
          remote: true,
          relocation: true,
        },
      },
      status: CandidateStatus.ACTIVE,
      rating: 4.9,
      tags: ['Senior', 'ML', 'Data Science'],
    },
  ];

  for (const candidateData of candidateProfiles) {
    try {
      const user = candidateUsers.find(u => u.email === candidateData.email);
      if (user) {
        const existingCandidate = await Candidate.findOne({ userId: user._id });
        if (!existingCandidate) {
          const candidate = new Candidate({
            userId: user._id,
            profile: candidateData.profile,
            status: candidateData.status,
            rating: candidateData.rating,
            tags: candidateData.tags,
          });
          await candidate.save();
          logger.info(`Created candidate profile for: ${candidateData.email}`);
        } else {
          logger.info(`Candidate profile already exists for: ${candidateData.email}`);
        }
      } else {
        logger.warn(`User not found for candidate: ${candidateData.email}`);
      }
    } catch (error) {
      logger.error(`Failed to create candidate profile for ${candidateData.email}:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        validationErrors: (error as any)?.errors ? Object.keys((error as any).errors).map(key => ({
          field: key,
          message: (error as any).errors[key].message
        })) : undefined,
        candidateData
      });
      throw error;
    }
  }
};

const seedJobs = async () => {
  logger.info('Seeding jobs...');
  
  const hrUsers = await User.find({ role: UserRole.HR });
  const agents = await User.find({ role: UserRole.AGENT });
  const companies = await Company.find({ status: CompanyStatus.ACTIVE });
  
  if (!hrUsers.length || !agents.length || companies.length < 2) {
    throw new Error('Required users or companies not found');
  }
  
  const jobs = [
    {
      title: 'Senior React Developer',
      description: 'We are looking for a senior React developer to join our growing team. You will be responsible for building scalable web applications using modern React patterns and best practices.',
      requirements: {
        skills: ['React', 'TypeScript', 'Node.js', 'JavaScript', 'HTML', 'CSS'],
        experience: ExperienceLevel.SENIOR,
        education: ['Bachelor\'s in Computer Science', 'Related field'],
        languages: ['English'],
      },
      location: 'Remote',
      type: JobType.FULL_TIME,
      salaryRange: {
        min: 140000,
        max: 180000,
        currency: 'USD',
      },
      companyId: companies[0]!._id,
      urgency: JobUrgency.HIGH,
      assignedAgentId: agents[0]!._id,
      createdBy: hrUsers[0]!._id,
      postedAt: new Date(),
    },
    {
      title: 'Data Scientist',
      description: 'Join our data science team to build machine learning models and extract insights from complex datasets. You will work on cutting-edge AI projects.',
      requirements: {
        skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Pandas'],
        experience: ExperienceLevel.MID,
        education: ['Master\'s in Data Science', 'Statistics', 'Computer Science'],
        languages: ['English'],
      },
      location: 'New York, NY',
      type: JobType.FULL_TIME,
      salaryRange: {
        min: 120000,
        max: 160000,
        currency: 'USD',
      },
      companyId: companies[1]!._id,
      urgency: JobUrgency.MEDIUM,
      assignedAgentId: agents[1]!._id,
      createdBy: hrUsers[1]!._id,
      postedAt: new Date(),
    },
    {
      title: 'Backend Engineer',
      description: 'Build scalable backend services and APIs using modern technologies. Work with microservices and cloud infrastructure.',
      requirements: {
        skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'AWS'],
        experience: ExperienceLevel.SENIOR,
        education: ['Bachelor\'s in Computer Science', 'Engineering'],
        languages: ['English'],
      },
      location: 'San Francisco, CA',
      type: JobType.FULL_TIME,
      salaryRange: {
        min: 150000,
        max: 190000,
        currency: 'USD',
      },
      companyId: companies[0]!._id,
      urgency: JobUrgency.HIGH,
      assignedAgentId: agents[0]!._id,
      createdBy: hrUsers[0]!._id,
      postedAt: new Date(),
    },
    {
      title: 'Frontend Developer',
      description: 'Create beautiful and responsive user interfaces using modern frontend technologies. Focus on user experience and performance.',
      requirements: {
        skills: ['React', 'Vue.js', 'JavaScript', 'CSS', 'HTML'],
        experience: ExperienceLevel.MID,
        education: ['Bachelor\'s in Computer Science', 'Web Development'],
        languages: ['English'],
      },
      location: 'Austin, TX',
      type: JobType.FULL_TIME,
      salaryRange: {
        min: 100000,
        max: 140000,
        currency: 'USD',
      },
      companyId: companies[1]!._id,
      urgency: JobUrgency.MEDIUM,
      assignedAgentId: agents[1]!._id,
      createdBy: hrUsers[1]!._id,
      postedAt: new Date(),
    },
    {
      title: 'DevOps Engineer',
      description: 'Manage cloud infrastructure and implement CI/CD pipelines. Work with containerization and orchestration technologies.',
      requirements: {
        skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
        experience: ExperienceLevel.SENIOR,
        education: ['Bachelor\'s in Information Technology', 'Computer Science'],
        languages: ['English'],
      },
      location: 'Remote',
      type: JobType.FULL_TIME,
      salaryRange: {
        min: 130000,
        max: 170000,
        currency: 'USD',
      },
      companyId: companies[0]!._id,
      urgency: JobUrgency.LOW,
      assignedAgentId: agents[0]!._id,
      createdBy: hrUsers[0]!._id,
      postedAt: new Date(),
    },
  ];

  for (const jobData of jobs) {
    try {
      const existingJob = await Job.findOne({ 
        title: jobData.title, 
        companyId: jobData.companyId 
      });
      if (!existingJob) {
        const job = new Job({
          ...jobData,
          status: JobStatus.OPEN,
        });
        await job.save();
        logger.info(`Created job: ${jobData.title}`);
      } else {
        logger.info(`Job already exists: ${jobData.title}`);
      }
    } catch (error) {
      console.error(`Failed to create job ${jobData.title}:`);
      console.error('Full error:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      if ((error as any)?.errors) {
        console.error('Validation errors:', (error as any).errors);
      }
      logger.error(`Failed to create job ${jobData.title}:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        validationErrors: (error as any)?.errors ? Object.keys((error as any).errors).map(key => ({
          field: key,
          message: (error as any).errors[key].message
        })) : undefined,
      });
      throw error;
    }
  }
};

const seedApplications = async () => {
  logger.info('Seeding applications...');
  
  // Get candidates by email to ensure we have the right ones
  const johnUser = await User.findOne({ email: 'john.doe@email.com' });
  const sarahUser = await User.findOne({ email: 'sarah.miller@email.com' });
  
  if (!johnUser || !sarahUser) {
    logger.warn('Could not find John or Sarah users for applications');
    return;
  }
  
  const johnCandidate = await Candidate.findOne({ userId: johnUser._id });
  const sarahCandidate = await Candidate.findOne({ userId: sarahUser._id });
  
  if (!johnCandidate || !sarahCandidate) {
    logger.warn('Could not find John or Sarah candidate profiles for applications');
    return;
  }
  
  // Get jobs by title to ensure we have the right ones
  const reactJob = await Job.findOne({ title: 'Senior React Developer' });
  const dataJob = await Job.findOne({ title: 'Data Scientist' });
  const backendJob = await Job.findOne({ title: 'Backend Engineer' });
  const frontendJob = await Job.findOne({ title: 'Frontend Developer' });
  
  if (!reactJob || !dataJob || !backendJob || !frontendJob) {
    logger.warn('Could not find all required jobs for applications');
    return;
  }
  
  logger.info(`Creating applications for John (${johnCandidate._id}) and Sarah (${sarahCandidate._id})`);
  
  const applications = [
    {
      candidateId: johnCandidate._id, // John Doe candidate profile
      jobId: reactJob._id, // Senior React Developer
      status: ApplicationStatus.INTERVIEW,
      stage: ApplicationStage.TECHNICAL,
      appliedAt: new Date('2024-01-10'),
      rating: 4,
      source: 'direct_apply',
      communicationPreference: 'email',
    },
    {
      candidateId: sarahCandidate._id, // Sarah Miller candidate profile
      jobId: dataJob._id, // Data Scientist
      status: ApplicationStatus.INTERVIEW,
      stage: ApplicationStage.FINAL,
      appliedAt: new Date('2024-01-12'),
      rating: 5,
      source: 'linkedin',
      communicationPreference: 'both',
    },
    {
      candidateId: johnCandidate._id, // John Doe candidate profile
      jobId: backendJob._id, // Backend Engineer
      status: ApplicationStatus.INTERVIEW,
      stage: ApplicationStage.SCREENING,
      appliedAt: new Date('2024-01-05'),
      rating: 4,
      source: 'job_board',
      communicationPreference: 'email',
    },
    {
      candidateId: sarahCandidate._id, // Sarah Miller candidate profile
      jobId: frontendJob._id, // Frontend Developer
      status: ApplicationStatus.INTERVIEW,
      stage: ApplicationStage.TECHNICAL,
      appliedAt: new Date('2024-01-15'),
      rating: 4,
      source: 'referral',
      communicationPreference: 'phone',
    },
  ];
  
  for (const appData of applications) {
    const existingApp = await Application.findOne({
      candidateId: appData.candidateId,
      jobId: appData.jobId
    });
    
    if (!existingApp) {
      try {
        const application = new Application(appData);
        await application.save();
        logger.info(`Created application for candidate ${appData.candidateId} and job ${appData.jobId}`);
      } catch (error) {
        logger.error(`Failed to create application:`, error);
        throw error;
      }
    } else {
      logger.info(`Application already exists for candidate ${appData.candidateId} and job ${appData.jobId}`);
    }
  }
};

const seedInterviews = async () => {
  logger.info('Seeding interviews...');
  
  const applications = await Application.find({});
  const hrUsers = await User.find({ role: UserRole.HR });
  
  if (applications.length === 0 || hrUsers.length === 0) {
    logger.warn('No applications or HR users found for interviews');
    return;
  }
  
  // Generate future dates for interviews
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const interviews = [
    // John Doe - Senior React Developer (Scheduled)
    {
      applicationId: applications[0]?._id,
      type: InterviewType.VIDEO,
      round: InterviewRound.TECHNICAL,
      scheduledAt: new Date(tomorrow.setHours(10, 0, 0, 0)),
      duration: 60,
      location: 'Zoom Meeting',
      meetingLink: 'https://zoom.us/j/1234567890',
      interviewers: [hrUsers[0]?._id],
      status: InterviewStatus.SCHEDULED,
      createdBy: hrUsers[0]?._id,
    },
    // Sarah Miller - Data Scientist (Confirmed)
    {
      applicationId: applications[1]?._id,
      type: InterviewType.IN_PERSON,
      round: InterviewRound.FINAL,
      scheduledAt: new Date(dayAfter.setHours(14, 0, 0, 0)),
      duration: 45,
      location: 'Austin Office',
      interviewers: [hrUsers[1]?._id],
      status: InterviewStatus.CONFIRMED,
      createdBy: hrUsers[1]?._id,
    },
    // John Doe - Backend Engineer (Completed) - Use past date but bypass validation for completed interviews
    {
      applicationId: applications[2]?._id,
      type: InterviewType.PHONE,
      round: InterviewRound.SCREENING,
      scheduledAt: new Date(lastWeek.setHours(11, 30, 0, 0)),
      duration: 30,
      location: 'Phone Call',
      meetingDetails: {
        platform: 'phone',
        dialInNumber: '+1-555-123-4567',
      },
      interviewers: [hrUsers[0]?._id],
      status: InterviewStatus.COMPLETED,
      rating: 4,
      feedback: 'Strong technical background, good communication skills.',
      createdBy: hrUsers[0]?._id,
    },
    // Sarah Miller - Frontend Developer (Scheduled)
    {
      applicationId: applications[3]?._id,
      type: InterviewType.VIDEO,
      round: InterviewRound.BEHAVIORAL,
      scheduledAt: new Date(threeDaysLater.setHours(15, 0, 0, 0)),
      duration: 90,
      location: 'Google Meet',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      interviewers: [hrUsers[1]?._id],
      status: InterviewStatus.SCHEDULED,
      createdBy: hrUsers[1]?._id,
    },
    // Additional interview - Cancelled (past date is OK for cancelled interviews)
    {
      applicationId: applications[0]?._id,
      type: InterviewType.VIDEO,
      round: InterviewRound.CULTURAL,
      scheduledAt: new Date(lastWeek.setHours(9, 0, 0, 0)),
      duration: 60,
      location: 'Teams Meeting',
      meetingLink: 'https://teams.microsoft.com/l/meetup-join/19%3Ameeting_abc123',
      interviewers: [hrUsers[0]?._id],
      status: InterviewStatus.CANCELLED,
      createdBy: hrUsers[0]?._id,
    },
  ];
  
  for (const interviewData of interviews) {
    const existingInterview = await Interview.findOne({
      applicationId: interviewData.applicationId,
      round: interviewData.round
    });
    
    if (!existingInterview) {
      try {
        const interview = new Interview(interviewData);
        await interview.save();
        logger.info(`Created interview for application ${interviewData.applicationId}`);
      } catch (error) {
        logger.error(`Failed to create interview:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          validationErrors: (error as any)?.errors ? Object.keys((error as any).errors).map(key => ({
            field: key,
            message: (error as any).errors[key].message
          })) : undefined,
          interviewData
        });
        throw error;
      }
    } else {
      logger.info(`Interview already exists for application ${interviewData.applicationId} and round ${interviewData.round}`);
    }
  }
};

const seedCandidateAssignments = async () => {
  logger.info('Seeding candidate assignments...');
  
  // Get users by email for reliable assignments
  const agentUser = await User.findOne({ email: 'agent1@hireaccel.com' });
  const hrUser = await User.findOne({ email: 'hr1@company.com' });
  const johnUser = await User.findOne({ email: 'john.doe@email.com' });
  const sarahUser = await User.findOne({ email: 'sarah.miller@email.com' });
  
  if (!agentUser || !hrUser || !johnUser || !sarahUser) {
    logger.warn('Could not find required users for candidate assignments');
    return;
  }
  
  const johnCandidate = await Candidate.findOne({ userId: johnUser._id });
  const sarahCandidate = await Candidate.findOne({ userId: sarahUser._id });
  const reactJob = await Job.findOne({ title: 'Senior React Developer' });
  const dataJob = await Job.findOne({ title: 'Data Scientist' });
  
  if (!johnCandidate || !sarahCandidate || !reactJob || !dataJob) {
    logger.warn('Could not find required candidates or jobs for assignments');
    return;
  }
  
  const assignments = [
    // Agent assigns John to HR for React developer role
    {
      candidateId: johnCandidate._id,
      assignedTo: hrUser._id,
      assignedBy: agentUser._id,
      jobId: reactJob._id, // Senior React Developer
      priority: 'high',
      notes: 'Excellent React skills, perfect match for senior role. Strong portfolio and 5+ years experience.',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      status: 'active',
    },
    // Agent assigns Sarah to HR for data scientist consideration
    {
      candidateId: sarahCandidate._id,
      assignedTo: hrUser._id,
      assignedBy: agentUser._id,
      jobId: dataJob._id, // Data Scientist
      priority: 'medium',
      notes: 'Strong data science background, perfect fit for data scientist position.',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      status: 'active',
    },
    // Completed assignment - HR already reviewed John for different role
    {
      candidateId: johnCandidate._id,
      assignedTo: hrUser._id,
      assignedBy: agentUser._id,
      priority: 'medium',
      notes: 'Additional review for backend engineer position.',
      assignedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      status: 'completed',
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      feedback: 'Reviewed candidate profile. Moving forward with interview process.',
    },
  ];
  
  for (const assignmentData of assignments) {
    const existingAssignment = await CandidateAssignment.findOne({
      candidateId: assignmentData.candidateId,
      assignedTo: assignmentData.assignedTo,
      assignedBy: assignmentData.assignedBy,
      status: assignmentData.status,
    });
    
    if (!existingAssignment) {
      try {
        const assignment = new CandidateAssignment(assignmentData);
        await assignment.save();
        logger.info(`Created candidate assignment: ${assignmentData.candidateId} → ${assignmentData.assignedTo}`);
      } catch (error) {
        logger.error(`Failed to create candidate assignment:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          assignmentData
        });
        throw error;
      }
    } else {
      logger.info(`Candidate assignment already exists: ${assignmentData.candidateId} → ${assignmentData.assignedTo}`);
    }
  }
};

const seedTasks = async () => {
  logger.info('Seeding tasks...');
  
  const hrUsers = await User.find({ role: UserRole.HR });
  const agentUsers = await User.find({ role: UserRole.AGENT });
  const jobs = await Job.find({});
  const applications = await Application.find({});
  
  if (hrUsers.length === 0 || agentUsers.length === 0) {
    logger.warn('No HR users or agents found for tasks');
    return;
  }
  
  const tasks = [
    // HR Tasks
    {
      title: 'Review candidate profiles for React position',
      description: 'Screen and evaluate incoming candidate applications for the Senior React Developer role',
      assignedTo: hrUsers[0]?._id,
      relatedEntity: {
        type: 'job',
        id: jobs[0]?._id,
      },
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      category: 'recruitment',
      checklist: [
        { id: '1', text: 'Review technical skills alignment', completed: true },
        { id: '2', text: 'Check experience level', completed: true },
        { id: '3', text: 'Verify salary expectations', completed: false },
      ],
      tags: ['urgent', 'technical-review'],
      estimatedHours: 4,
      createdBy: agentUsers[0]?._id,
    },
    // Agent Tasks
    {
      title: 'Source candidates for Data Science position',
      description: 'Find and reach out to qualified data scientists for the open position at InnovateInc',
      assignedTo: agentUsers[0]?._id,
      relatedEntity: {
        type: 'job',
        id: jobs[1]?._id,
      },
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      category: 'recruitment',
      checklist: [
        { id: '1', text: 'Search LinkedIn for candidates', completed: false },
        { id: '2', text: 'Contact university career centers', completed: false },
        { id: '3', text: 'Post on specialized job boards', completed: false },
      ],
      tags: ['sourcing', 'data-science'],
      estimatedHours: 8,
      createdBy: hrUsers[0]?._id,
    },
    // Follow-up Task
    {
      title: 'Schedule interviews for shortlisted candidates',
      description: 'Coordinate interview schedules for candidates who passed initial screening',
      assignedTo: hrUsers[1]?._id,
      relatedEntity: {
        type: 'application',
        id: applications[0]?._id,
      },
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now (was due before completion)
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      category: 'interview',
      checklist: [
        { id: '1', text: 'Contact top 3 candidates', completed: true },
        { id: '2', text: 'Book interview rooms', completed: true },
        { id: '3', text: 'Send calendar invites', completed: true },
      ],
      tags: ['scheduling', 'interviews'],
      estimatedHours: 2,
      actualHours: 1.5,
      createdBy: agentUsers[1]?._id,
    },
    // Administrative Task
    {
      title: 'Update candidate database with new profiles',
      description: 'Import and process new candidate profiles from recent recruitment events',
      assignedTo: agentUsers[1]?._id,
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      category: 'administrative',
      checklist: [
        { id: '1', text: 'Download resumes from event portal', completed: false },
        { id: '2', text: 'Parse contact information', completed: false },
        { id: '3', text: 'Create candidate profiles', completed: false },
        { id: '4', text: 'Tag candidates by event source', completed: false },
      ],
      tags: ['data-entry', 'recruitment-event'],
      estimatedHours: 6,
      createdBy: hrUsers[1]?._id,
    },
  ];
  
  for (const taskData of tasks) {
    const existingTask = await Task.findOne({
      title: taskData.title,
      assignedTo: taskData.assignedTo,
    });
    
    if (!existingTask) {
      try {
        const task = new Task(taskData);
        await task.save();
        logger.info(`Created task: ${taskData.title}`);
      } catch (error) {
        logger.error(`Failed to create task ${taskData.title}:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          validationErrors: (error as any)?.errors ? Object.keys((error as any).errors).map(key => ({
            field: key,
            message: (error as any).errors[key].message
          })) : undefined,
          taskData
        });
        throw error;
      }
    } else {
      logger.info(`Task already exists: ${taskData.title}`);
    }
  }
};

const seedFiles = async () => {
  logger.info('Seeding files...');
  
  const candidates = await Candidate.find({});
  const jobs = await Job.find({});
  const candidateUsers = await User.find({ role: UserRole.CANDIDATE });
  const hrUsers = await User.find({ role: UserRole.HR });
  
  if (candidates.length === 0 || candidateUsers.length === 0) {
    logger.warn('No candidates found for file seeding');
    return;
  }
  
  const files = [
    // Resume files
    {
      filename: 'john-doe-resume.pdf',
      originalName: 'John_Doe_Resume_2024.pdf',
      mimetype: 'application/pdf',
      size: 245760, // ~240KB
      path: 'uploads/resumes/john-doe-resume.pdf',
      url: '/uploads/resumes/john-doe-resume.pdf',
      category: FileCategory.RESUME,
      uploadedBy: candidateUsers[0]?._id,
      relatedEntity: {
        type: 'candidate',
        id: candidates[0]?._id,
      },
      metadata: {
        pageCount: 2,
        processed: true,
        processingStatus: 'completed',
        virusScanned: true,
        virusScanResult: 'clean',
      },
      tags: ['resume', 'senior', 'react'],
      checksum: 'sha256:abc123def456...',
      checksumAlgorithm: 'sha256',
    },
    {
      filename: 'sarah-miller-resume.pdf',
      originalName: 'Sarah_Miller_DataScientist_Resume.pdf',
      mimetype: 'application/pdf',
      size: 198720, // ~194KB
      path: 'uploads/resumes/sarah-miller-resume.pdf',
      url: '/uploads/resumes/sarah-miller-resume.pdf',
      category: FileCategory.RESUME,
      uploadedBy: candidateUsers[1]?._id,
      relatedEntity: {
        type: 'candidate',
        id: candidates[1]?._id,
      },
      metadata: {
        pageCount: 2,
        processed: true,
        processingStatus: 'completed',
        virusScanned: true,
        virusScanResult: 'clean',
      },
      tags: ['resume', 'data-science', 'ml'],
      checksum: 'sha256:def456ghi789...',
      checksumAlgorithm: 'sha256',
    },
    // Job description documents
    {
      filename: 'react-developer-jd.pdf',
      originalName: 'Senior_React_Developer_Job_Description.pdf',
      mimetype: 'application/pdf',
      size: 156432,
      path: 'uploads/job-descriptions/react-developer-jd.pdf',
      url: '/uploads/job-descriptions/react-developer-jd.pdf',
      category: FileCategory.DOCUMENT,
      uploadedBy: hrUsers[0]?._id,
      relatedEntity: {
        type: 'job',
        id: jobs[0]?._id,
      },
      metadata: {
        pageCount: 1,
        processed: true,
        processingStatus: 'completed',
      },
      tags: ['job-description', 'react', 'frontend'],
      checksum: 'sha256:ghi789jkl012...',
      checksumAlgorithm: 'sha256',
    },
    // Cover letter
    {
      filename: 'john-doe-cover-letter.pdf',
      originalName: 'John_Doe_Cover_Letter_TechCorp.pdf',
      mimetype: 'application/pdf',
      size: 87654,
      path: 'uploads/cover-letters/john-doe-cover-letter.pdf',
      url: '/uploads/cover-letters/john-doe-cover-letter.pdf',
      category: FileCategory.COVER_LETTER,
      uploadedBy: candidateUsers[0]?._id,
      relatedEntity: {
        type: 'candidate',
        id: candidates[0]?._id,
      },
      metadata: {
        pageCount: 1,
        processed: true,
        processingStatus: 'completed',
      },
      tags: ['cover-letter', 'techcorp'],
      checksum: 'sha256:jkl012mno345...',
      checksumAlgorithm: 'sha256',
    },
  ];
  
  for (const fileData of files) {
    const existingFile = await File.findOne({
      path: fileData.path,
    });
    
    if (!existingFile) {
      try {
        const file = new File(fileData);
        await file.save();
        logger.info(`Created file: ${fileData.originalName}`);
      } catch (error) {
        logger.error(`Failed to create file ${fileData.originalName}:`, error);
        throw error;
      }
    } else {
      logger.info(`File already exists: ${fileData.originalName}`);
    }
  }
};

const seedAuditLogs = async () => {
  logger.info('Seeding audit logs...');
  
  const users = await User.find({});
  const candidates = await Candidate.find({});
  const jobs = await Job.find({});
  const applications = await Application.find({});
  
  if (users.length === 0) {
    logger.warn('No users found for audit log seeding');
    return;
  }
  
  const auditLogs = [
    // User login activity
    {
      actor: users.find(u => u.role === UserRole.ADMIN)?._id,
      action: AuditAction.LOGIN,
      entityType: 'User',
      entityId: users.find(u => u.role === UserRole.ADMIN)?._id,
      metadata: {
        loginMethod: 'email_password',
        deviceType: 'desktop',
        browser: 'Chrome',
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      riskLevel: 'low',
      businessProcess: 'authentication',
      success: true,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    // Candidate creation
    {
      actor: users.find(u => u.role === UserRole.AGENT)?._id,
      action: AuditAction.CREATE,
      entityType: 'Candidate',
      entityId: candidates[0]?._id,
      after: {
        status: 'active',
        rating: 4.8,
        tags: ['Senior', 'Full-Stack', 'React'],
      },
      metadata: {
        source: 'manual_entry',
        recruitmentChannel: 'linkedin',
      },
      ipAddress: '10.0.0.50',
      riskLevel: 'low',
      businessProcess: 'candidate_management',
      success: true,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    // Job posting
    {
      actor: users.find(u => u.role === UserRole.HR)?._id,
      action: AuditAction.CREATE,
      entityType: 'Job',
      entityId: jobs[0]?._id,
      after: {
        title: 'Senior React Developer',
        status: 'open',
        urgency: 'high',
      },
      metadata: {
        companyId: jobs[0]?.companyId,
        approvalRequired: false,
      },
      ipAddress: '172.16.0.25',
      riskLevel: 'medium',
      businessProcess: 'job_management',
      success: true,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    // Application submission
    {
      actor: users.find(u => u.role === UserRole.CANDIDATE)?._id,
      action: AuditAction.CREATE,
      entityType: 'Application',
      entityId: applications[0]?._id,
      after: {
        status: 'submitted',
        stage: 'applied',
      },
      metadata: {
        applicationSource: 'direct_apply',
        resumeUploaded: true,
      },
      ipAddress: '203.0.113.42',
      riskLevel: 'low',
      businessProcess: 'application_processing',
      success: true,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    // Failed login attempt
    {
      actor: users.find(u => u.role === UserRole.CANDIDATE)?._id,
      action: AuditAction.LOGIN,
      entityType: 'User',
      entityId: users.find(u => u.role === UserRole.CANDIDATE)?._id,
      metadata: {
        loginMethod: 'email_password',
        failureReason: 'invalid_password',
        attemptCount: 1,
      },
      ipAddress: '198.51.100.15',
      riskLevel: 'medium',
      businessProcess: 'authentication',
      success: false,
      errorMessage: 'Invalid password provided',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
    // High-risk data export
    {
      actor: users.find(u => u.role === UserRole.ADMIN)?._id,
      action: AuditAction.READ,
      entityType: 'Candidate',
      entityId: candidates[0]?._id,
      metadata: {
        exportType: 'candidate_data',
        recordCount: 150,
        exportFormat: 'csv',
        reason: 'monthly_report',
      },
      ipAddress: '192.168.1.100',
      riskLevel: 'high',
      businessProcess: 'data_export',
      complianceCategory: 'gdpr',
      success: true,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
  ];
  
  for (const logData of auditLogs) {
    try {
      await AuditLog.createLog(logData);
      logger.info(`Created audit log: ${logData.action} on ${logData.entityType}`);
    } catch (error) {
      logger.error(`Failed to create audit log:`, error);
      // Don't throw error for audit logs - they shouldn't break seeding
    }
  }
};

const seedAgentAssignments = async () => {
  logger.info('Seeding agent assignments...');
  
  // Get admin, agents, HR users, and candidates
  const adminUser = await User.findOne({ role: UserRole.ADMIN });
  const agentUsers = await User.find({ role: UserRole.AGENT }).limit(2);
  const hrUsers = await User.find({ role: UserRole.HR });
  const candidates = await Candidate.find({});
  
  if (!adminUser || agentUsers.length === 0 || hrUsers.length === 0 || candidates.length === 0) {
    logger.warn('No admin, agents, HR users, or candidates found for agent assignments');
    return;
  }
  
  const agentAssignments = [
    // Assign first agent to first 2 HR users and first 2 candidates
    {
      agentId: agentUsers[0]?._id,
      assignedHRs: [hrUsers[0]?._id, hrUsers[1]?._id],
      assignedCandidates: candidates.slice(0, 3).map(c => c._id),
      assignedBy: adminUser._id,
      notes: 'Primary agent handling TechCorp and GrowthStart accounts with experienced developers.',
      status: 'active',
    },
    // Assign second agent to remaining HR users and candidates
    {
      agentId: agentUsers[1]?._id,
      assignedHRs: hrUsers.length > 2 ? [hrUsers[2]?._id] : [hrUsers[1]?._id],
      assignedCandidates: candidates.slice(1, 4).map(c => c._id),
      assignedBy: adminUser._id,
      notes: 'Secondary agent handling specialized roles and backup coverage.',
      status: 'active',
    },
  ];
  
  for (const assignmentData of agentAssignments) {
    const existingAssignment = await AgentAssignment.findOne({
      agentId: assignmentData.agentId,
    });
    
    if (!existingAssignment) {
      try {
        const assignment = new AgentAssignment(assignmentData);
        await assignment.save();
        logger.info(`Created agent assignment for agent ${assignmentData.agentId}`);
      } catch (error) {
        logger.error(`Failed to create agent assignment:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          assignmentData
        });
        throw error;
      }
    } else {
      logger.info(`Agent assignment already exists for agent ${assignmentData.agentId}`);
    }
  }
};

// Connect to MongoDB and run seeding
mongoose.connect(env.MONGO_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    return main();
  })
  .then(() => {
    logger.info('Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Seeding failed:', error);
    process.exit(1);
  });
