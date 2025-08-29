import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env } from './env';

/**
 * Swagger configuration for API documentation
 */

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hire Accel API',
      version: '1.0.0',
      description: 'Production-ready Hiring Platform API with comprehensive recruitment management features',
      contact: {
        name: 'API Support',
        email: 'support@hireaccel.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
      {
        url: 'https://api.hireaccel.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme.',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
          description: 'Refresh token stored in HTTP-only cookie',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          required: ['type', 'title', 'status', 'detail'],
          properties: {
            type: {
              type: 'string',
              format: 'uri',
              description: 'URI reference that identifies the problem type',
              example: 'https://httpstatuses.com/400',
            },
            title: {
              type: 'string',
              description: 'Short, human-readable summary of the problem',
              example: 'Bad Request',
            },
            status: {
              type: 'integer',
              description: 'HTTP status code',
              example: 400,
            },
            detail: {
              type: 'string',
              description: 'Human-readable explanation specific to this occurrence',
              example: 'The request is missing required parameters',
            },
            instance: {
              type: 'string',
              description: 'URI reference that identifies the specific occurrence',
              example: 'POST /api/v1/users',
            },
            issues: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                  code: { type: 'string' },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          required: ['id', 'email', 'firstName', 'lastName', 'role'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            firstName: {
              type: 'string',
              description: 'User first name',
              example: 'John',
            },
            lastName: {
              type: 'string',
              description: 'User last name',
              example: 'Doe',
            },
            fullName: {
              type: 'string',
              description: 'Full name (computed)',
              readOnly: true,
              example: 'John Doe',
            },
            role: {
              type: 'string',
              enum: ['candidate', 'agent', 'hr', 'partner', 'admin'],
              description: 'User role in the system',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended', 'pending'],
              description: 'User account status',
            },
            emailVerified: {
              type: 'boolean',
              description: 'Whether email is verified',
            },
            lastLoginAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Job: {
          type: 'object',
          required: ['id', 'title', 'description', 'location', 'type', 'companyId'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique job identifier',
            },
            title: {
              type: 'string',
              description: 'Job title',
              example: 'Senior React Developer',
            },
            description: {
              type: 'string',
              description: 'Job description',
            },
            location: {
              type: 'string',
              description: 'Job location',
              example: 'San Francisco, CA',
            },
            type: {
              type: 'string',
              enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
              description: 'Job type',
            },
            status: {
              type: 'string',
              enum: ['open', 'assigned', 'interview', 'closed', 'cancelled'],
              description: 'Job status',
            },
            urgency: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Job urgency level',
            },
            salaryRange: {
              type: 'object',
              properties: {
                min: { type: 'number', description: 'Minimum salary' },
                max: { type: 'number', description: 'Maximum salary' },
                currency: { type: 'string', default: 'USD' },
              },
            },
            requirements: {
              type: 'object',
              properties: {
                skills: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Required skills',
                },
                experience: {
                  type: 'string',
                  enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'],
                  description: 'Required experience level',
                },
                education: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Education requirements',
                },
              },
            },
            applications: {
              type: 'number',
              description: 'Number of applications',
              readOnly: true,
            },
            postedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Job posting timestamp',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Company: {
          type: 'object',
          required: ['id', 'name', 'industry', 'location'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique company identifier',
            },
            name: {
              type: 'string',
              description: 'Company name',
              example: 'TechCorp Inc.',
            },
            description: {
              type: 'string',
              description: 'Company description',
            },
            industry: {
              type: 'string',
              description: 'Company industry',
              example: 'Technology',
            },
            size: {
              type: 'string',
              enum: ['1-10', '11-25', '26-50', '51-100', '101-250', '251-500', '501-1000', '1000+'],
              description: 'Company size',
            },
            location: {
              type: 'string',
              description: 'Company location',
              example: 'San Francisco, CA',
            },
            website: {
              type: 'string',
              format: 'uri',
              description: 'Company website',
            },
            partnership: {
              type: 'string',
              enum: ['basic', 'standard', 'premium', 'enterprise'],
              description: 'Partnership level',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'pending', 'suspended'],
              description: 'Company status',
            },
            rating: {
              type: 'number',
              minimum: 1,
              maximum: 5,
              description: 'Company rating',
            },
            totalJobs: {
              type: 'number',
              description: 'Total jobs posted',
              readOnly: true,
            },
            totalHires: {
              type: 'number',
              description: 'Total successful hires',
              readOnly: true,
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Users',
        description: 'User management operations',
      },
      {
        name: 'Jobs',
        description: 'Job posting and management',
      },
      {
        name: 'Companies',
        description: 'Company and partner management',
      },
      {
        name: 'Applications',
        description: 'Job application management',
      },
      {
        name: 'Health',
        description: 'System health and monitoring',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
  ],
};

export const specs = swaggerJsdoc(options);

export const swaggerUiOptions = {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 50px 0 }
    .swagger-ui .scheme-container { background: none; box-shadow: none }
  `,
  customSiteTitle: 'Hire Accel API Documentation',
  customfavIcon: '/favicon.ico',
};

export { swaggerUi };
