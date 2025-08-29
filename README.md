# Hire Accel - Production-Ready Hiring Platform

A comprehensive recruitment management system built with Node.js, Express, TypeScript, MongoDB, and React. Features role-based access control, real-time updates, and enterprise-grade security.

## 🚀 Features

### Core Functionality
- **Multi-Role Dashboard**: Customized interfaces for Candidates, Agents, HR, Partners, and Admins
- **Job Management**: Complete job posting, assignment, and tracking workflow
- **Application Processing**: Advanced application lifecycle management with stage progression
- **Interview Scheduling**: Comprehensive interview management and feedback system
- **Company Management**: Partner company profiles and relationship management
- **User Administration**: Complete user lifecycle with role-based permissions

### Technical Highlights
- **Authentication**: JWT with refresh token rotation, password reset, email verification
- **File Management**: Secure file uploads with type validation and organized storage
- **Audit Logging**: Comprehensive audit trail for compliance and monitoring
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Role-Based Access Control**: Granular permissions system
- **Real-time Updates**: WebSocket support for live notifications
- **Data Validation**: Comprehensive input validation with Zod schemas

## 🏗️ Architecture

### Backend (API)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Refresh Token rotation
- **File Storage**: Multer with organized folder structure
- **Validation**: Zod schemas for type-safe validation
- **Logging**: Structured logging with Pino
- **Documentation**: Swagger/OpenAPI auto-generated docs

### Frontend (Client)
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: React Query + Context API
- **UI Components**: Shadcn/ui + Tailwind CSS
- **Build Tool**: Vite
- **Type Safety**: Full TypeScript coverage

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 7.0+
- npm or yarn

### Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd hire-accel-v2
```

2. **Backend Setup**
```bash
cd api
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Frontend Setup**
```bash
cd client
npm install
npm run dev
```

4. **Database Setup**
```bash
# Start MongoDB (if not using Docker)
mongod

# Seed the database
cd api
npm run seed
```

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Seed the database
docker-compose exec api npm run seed

# View logs
docker-compose logs -f
```

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Jobs
- `GET /api/v1/jobs` - List jobs with filters
- `POST /api/v1/jobs` - Create new job
- `GET /api/v1/jobs/:id` - Get job details
- `PUT /api/v1/jobs/:id` - Update job
- `DELETE /api/v1/jobs/:id` - Delete job
- `POST /api/v1/jobs/:id/assign` - Assign agent to job
- `POST /api/v1/jobs/:id/close` - Close job

### Companies
- `GET /api/v1/companies` - List companies
- `POST /api/v1/companies` - Create company
- `GET /api/v1/companies/:id` - Get company details
- `PUT /api/v1/companies/:id` - Update company
- `DELETE /api/v1/companies/:id` - Delete company

### Applications
- `GET /api/v1/applications` - List applications
- `POST /api/v1/applications` - Create application
- `POST /api/v1/applications/:id/advance` - Advance application stage
- `POST /api/v1/applications/:id/reject` - Reject application

### Users
- `GET /api/v1/users` - List users (Admin/HR)
- `POST /api/v1/users` - Create user (Admin)
- `GET /api/v1/users/:id` - Get user details
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

## 🔐 Role-Based Access Control

### User Roles

#### Candidate
- Manage own profile and applications
- Upload resume and documents
- View job listings and apply
- Track application status
- Schedule interviews

#### Agent
- Manage assigned candidates and jobs
- Review and process applications
- Advance application stages
- Bulk candidate assignment
- Task management

#### HR
- Post and manage job listings
- Review all applications
- Schedule interviews
- Access candidate pipeline
- Generate reports

#### Partner
- View own company's jobs and applications
- Limited analytics access
- Manage company profile
- Review partnership metrics

#### Admin
- Full system access
- User management
- System configuration
- Audit log access
- Advanced analytics

## 📁 Project Structure

```
hire-accel-v2/
├── api/                     # Backend API
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── scripts/         # Utility scripts
│   │   ├── types/           # TypeScript definitions
│   │   └── utils/           # Helper functions
│   ├── uploads/             # File storage
│   ├── package.json
│   └── Dockerfile.dev
├── client/                  # Frontend React app
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   └── lib/             # Utilities
│   ├── package.json
│   └── Dockerfile.dev
├── docker-compose.yml       # Docker services
└── README.md
```

## 🧪 Testing

### Backend Tests
```bash
cd api
npm run test              # Run tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### Frontend Tests
```bash
cd client
npm run test              # Run tests
npm run test:watch        # Watch mode
```

## 🚀 Deployment

### Environment Variables

#### Backend (.env)
```env
PORT=3001
NODE_ENV=production
MONGO_URI=mongodb://localhost:27017/hireaccel_prod
JWT_ACCESS_SECRET=your_secure_secret
JWT_REFRESH_SECRET=your_secure_refresh_secret
UPLOADS_PATH=./uploads
CORS_ORIGIN=https://yourdomain.com
```

#### Frontend (.env)
```env
VITE_API_URL=https://api.yourdomain.com
```

### Production Deployment

1. **Build the applications**
```bash
# Backend
cd api && npm run build

# Frontend
cd client && npm run build
```

2. **Deploy using Docker**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📖 API Documentation

Access the interactive API documentation at:
- Development: http://localhost:3001/api-docs
- Production: https://api.yourdomain.com/api-docs

## 🔧 Configuration

### Database Indexes
The application automatically creates necessary indexes for:
- User email uniqueness
- Job search optimization
- Application tracking
- Audit log queries

### File Upload Configuration
- **Resumes**: PDF, DOC, DOCX (10MB max)
- **Images**: JPEG, PNG, GIF (2MB max)
- **Storage**: `./uploads/{role}/{entity}/{YYYY}/{MM}/filename`

### Security Features
- JWT with automatic refresh
- Password hashing with Argon2
- CORS protection
- Request validation
- File type validation
- Rate limiting (production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@hireaccel.com
- Documentation: /api-docs

## 🎯 Roadmap

- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Email template system
- [ ] Calendar integration
- [ ] Mobile app development
- [ ] AI-powered candidate matching
- [ ] Advanced reporting system
- [ ] SSO integration
