import * as express from 'express';
import * as cors from 'cors';

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Simple health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Simple test routes
app.get('/api/test', (_req, res) => {
  res.json({ message: 'API is working!' });
});

app.post('/api/test', (req, res) => {
  res.json({ 
    message: 'POST request received',
    body: req.body 
  });
});

// Mock data endpoints for frontend testing
app.get('/api/v1/jobs', (_req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: "1",
        title: "Senior React Developer",
        company: "TechCorp Inc.",
        location: "San Francisco, CA",
        type: "full-time",
        salary: "$120k - $150k",
        status: "open",
        urgency: "high",
        applicants: 23,
        posted: "2 days ago",
        agent: "Sarah Johnson",
        description: "We're looking for a senior React developer to join our growing team..."
      },
      {
        id: "2",
        title: "Marketing Manager",
        company: "GrowthStart",
        location: "Austin, TX",
        type: "full-time",
        salary: "$80k - $100k",
        status: "assigned",
        urgency: "medium",
        applicants: 15,
        posted: "1 week ago",
        agent: "Emily Davis",
        description: "Lead our marketing initiatives and drive customer acquisition..."
      }
    ],
    meta: {
      page: { current: 1, total: 1, hasMore: false },
      total: 2,
      limit: 20
    }
  });
});

app.get('/api/v1/companies', (_req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: "1",
        name: "TechCorp Inc.",
        description: "Leading technology company",
        industry: "Technology",
        size: "500-1000",
        location: "San Francisco, CA",
        website: "https://techcorp.com",
        partnership: "premium",
        status: "active",
        rating: 4.5,
        totalJobs: 12,
        totalHires: 8
      }
    ]
  });
});

app.get('/api/v1/users', (_req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: "1",
        email: "admin@hireaccel.com",
        firstName: "System",
        lastName: "Administrator",
        role: "admin",
        status: "active",
        emailVerified: true
      }
    ]
  });
});

// Authentication mock
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@hireaccel.com' && password === 'Admin123!') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '1',
          email: 'admin@hireaccel.com',
          firstName: 'System',
          lastName: 'Administrator',
          role: 'admin',
          status: 'active',
          emailVerified: true
        },
        accessToken: 'mock_access_token',
        expiresIn: 900
      }
    });
  } else {
    res.status(401).json({
      type: 'https://httpstatuses.com/401',
      title: 'Unauthorized',
      status: 401,
      detail: 'Invalid email or password'
    });
  }
});

app.get('/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token === 'mock_access_token') {
    res.json({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'admin@hireaccel.com',
          firstName: 'System',
          lastName: 'Administrator',
          role: 'admin',
          status: 'active',
          emailVerified: true
        }
      }
    });
  } else {
    res.status(401).json({
      type: 'https://httpstatuses.com/401',
      title: 'Unauthorized',
      status: 401,
      detail: 'Invalid or missing token'
    });
  }
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    type: 'https://httpstatuses.com/500',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred'
  });
});

export default app;
