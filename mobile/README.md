# HireAccel Mobile App

A professional React Native mobile application for the HireAccel recruitment platform.

## Features

- 🔐 **Authentication**: Login, Signup, OTP Verification
- 👥 **Multi-Role Support**: Admin, HR, Agent, Candidate
- 💼 **Job Management**: Browse, create, edit, and manage job postings
- 📝 **Application Tracking**: Track and manage job applications
- 📅 **Interview Scheduling**: Schedule and manage interviews
- 🏢 **Company Management**: Manage company profiles
- 👤 **User Management**: Admin tools for user management
- 🔔 **Real-time Notifications**: Push notifications for important updates
- 📊 **Analytics & Reports**: Dashboard with key metrics

## Tech Stack

- **React Native** (Expo) - Cross-platform mobile framework
- **TypeScript** - Type-safe development
- **Expo Router** - File-based routing
- **React Navigation** - Navigation library
- **React Native Paper** - Material Design components
- **React Query** - Data fetching and caching
- **AsyncStorage** - Local storage
- **Axios** - HTTP client
- **Socket.io** - Real-time communication
- **Zod** - Schema validation

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (for testing)

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Project Structure

```
mobile/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   ├── constants/         # Constants and config
│   └── theme/             # Theme configuration
├── assets/                # Images, fonts, etc.
└── package.json
```

## Configuration

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=http://your-api-url:3002
```

## Features by Role

### Candidate
- Browse job listings
- Apply to jobs
- Track application status
- Manage profile and resume
- Schedule interviews
- Receive notifications

### HR
- Post and manage jobs
- Review applications
- Schedule interviews
- Manage company profile
- View analytics

### Agent
- View assigned jobs
- Access candidate pool
- Schedule interviews
- Track assignments

### Admin
- User management
- Company management
- System analytics
- Banner/ad management
- Full system access

## Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
expo build:android
expo build:ios
```

## API Integration

The app connects to the same backend as the web application. Update the `EXPO_PUBLIC_API_URL` in your `.env` file to point to your backend server.

## Contributing

1. Follow the existing code structure
2. Use TypeScript for all new files
3. Follow React Native best practices
4. Test on both iOS and Android

## License

Proprietary - All rights reserved

