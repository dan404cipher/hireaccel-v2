import app from './app-simple';

const PORT = 3001;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 Simple API server running on port ${PORT}`);
    console.log(`📖 Health check: http://localhost:${PORT}/health`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  });
};

startServer();
