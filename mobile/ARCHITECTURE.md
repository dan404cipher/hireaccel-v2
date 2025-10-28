# HireAccel Mobile App - Architecture Documentation

## 🏛️ Architecture Overview

The HireAccel mobile app follows a modern, scalable architecture built with React Native (Expo) and TypeScript.

## 📐 Architecture Patterns

### 1. **File-Based Routing** (Expo Router)
- Uses the `app/` directory for automatic route generation
- Supports nested layouts and route groups
- Type-safe navigation

### 2. **Context + React Query** (State Management)
- **React Context** for global state (auth, notifications)
- **React Query** for server state management
- **AsyncStorage** for local persistence

### 3. **Component-Based Architecture**
- Reusable UI components
- Separation of concerns
- DRY (Don't Repeat Yourself) principles

## 📁 Directory Structure

```
mobile/
├── app/                          # Expo Router - File-based routing
│   ├── (auth)/                  # Auth route group (no tabs)
│   │   ├── _layout.tsx         # Auth layout
│   │   ├── login.tsx           # Login screen
│   │   ├── signup.tsx          # Signup screen
│   │   ├── otp-verification.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   ├── (tabs)/                  # Main app route group (with tabs)
│   │   ├── _layout.tsx         # Tabs layout
│   │   ├── dashboard.tsx       # Dashboard screen
│   │   ├── jobs.tsx            # Jobs list screen
│   │   ├── applications.tsx    # Applications screen
│   │   ├── candidates.tsx      # Candidates screen
│   │   ├── interviews.tsx      # Interviews screen
│   │   ├── profile.tsx         # Profile screen
│   │   ├── companies.tsx       # Hidden tab
│   │   └── users.tsx           # Hidden tab
│   ├── _layout.tsx              # Root layout
│   └── index.tsx                # Entry point/redirect
│
├── src/
│   ├── components/              # Reusable UI components
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorMessage.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── contexts/                # React Context providers
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── NotificationContext.tsx  # Notifications & Socket.io
│   │
│   ├── services/                # External services
│   │   └── api.ts              # API client (axios)
│   │
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts
│   │
│   ├── utils/                   # Utility functions
│   │   ├── storage.ts          # AsyncStorage wrapper
│   │   └── helpers.ts          # Helper functions
│   │
│   ├── constants/               # App constants
│   │   └── config.ts           # Configuration
│   │
│   └── theme/                   # Theme configuration
│       └── theme.ts            # React Native Paper theme
│
├── assets/                      # Static assets
│   ├── icon.png
│   ├── splash.png
│   └── ...
│
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── babel.config.js              # Babel config
└── metro.config.js              # Metro bundler config
```

## 🔄 Data Flow

### 1. Authentication Flow

```
User Action (Login)
    ↓
AuthContext.login()
    ↓
apiClient.login() [API Call]
    ↓
Token stored in AsyncStorage
    ↓
User state updated in Context
    ↓
Navigate to Dashboard
```

### 2. API Request Flow

```
Component
    ↓
React Query (useQuery/useMutation)
    ↓
API Client Service
    ↓
Axios HTTP Request
    ↓
Backend API
    ↓
Response/Error
    ↓
React Query Cache
    ↓
Component Re-render
```

### 3. Notification Flow

```
Backend Event
    ↓
Socket.io Server
    ↓
NotificationContext (Socket.io Client)
    ↓
Expo Notifications API
    ↓
Push Notification Displayed
    ↓
User Taps Notification
    ↓
Navigate to Relevant Screen
```

## 🎯 Key Design Decisions

### 1. **Why Expo?**
- Fast development cycle
- Built-in navigation, notifications, and native APIs
- Over-the-air updates
- Easy build process
- Great developer experience

### 2. **Why Expo Router over React Navigation?**
- File-based routing (less boilerplate)
- Type-safe navigation
- Automatic deep linking
- Better code organization
- Modern approach

### 3. **Why React Query?**
- Automatic caching
- Background refetching
- Optimistic updates
- Reduces boilerplate
- Better UX with loading states

### 4. **Why React Native Paper?**
- Material Design 3 components
- Comprehensive component library
- Theming support
- Good TypeScript support
- Well-maintained

### 5. **Why Context + AsyncStorage?**
- Simple and effective for global state
- No additional dependencies for basic state management
- AsyncStorage is built into React Native
- Good for auth and simple app state

## 🔐 Security

### Token Management
- Access tokens stored in AsyncStorage
- Automatic token refresh on 401 errors
- Tokens cleared on logout
- No sensitive data in plain storage

### API Communication
- All API calls use HTTPS in production
- Tokens sent via Authorization header
- CORS properly configured
- Rate limiting on backend

## 🎨 UI/UX Patterns

### 1. **Loading States**
- Global loading spinner for initial loads
- Skeleton screens for better perceived performance
- Pull-to-refresh on list screens
- Inline loading indicators

### 2. **Error Handling**
- User-friendly error messages
- Retry mechanisms
- Offline support (cached data)
- Toast notifications for actions

### 3. **Navigation Patterns**
- Bottom tabs for main sections
- Stack navigation for details
- Modal screens for forms
- Deep linking support

### 4. **Role-Based UI**
- Dynamic tab visibility based on role
- Feature flags per role
- Contextual actions

## 🔄 State Management

### Global State (Context)
- **AuthContext**: User, authentication status, login/logout
- **NotificationContext**: Notifications, unread count, socket connection

### Server State (React Query)
- Jobs, applications, candidates, interviews
- Automatic caching and refetching
- Optimistic updates

### Local State (useState/useReducer)
- Form inputs
- UI state (modals, accordions)
- Component-specific state

## 🚀 Performance Optimizations

### 1. **Code Splitting**
- Route-based code splitting via Expo Router
- Lazy loading of screens

### 2. **Caching Strategy**
- React Query cache: 5 minutes stale time
- AsyncStorage for offline support
- Image caching via Expo Image

### 3. **List Performance**
- FlatList for efficient rendering
- Pagination for large datasets
- Virtualization for long lists

### 4. **Network Optimization**
- Request deduplication via React Query
- Automatic retry with exponential backoff
- Background refetching

## 🧪 Testing Strategy

### Unit Tests
- Utility functions
- Helper functions
- Business logic

### Integration Tests
- API service layer
- Context providers
- Custom hooks

### E2E Tests
- Critical user flows
- Authentication flow
- Application submission flow

## 📱 Platform-Specific Considerations

### iOS
- Safe area insets handled
- iOS-specific UI patterns
- Native animations

### Android
- Material Design compliance
- Back button handling
- Permission handling

### Web (Future)
- Responsive design
- Web-specific optimizations
- PWA capabilities

## 🔮 Future Enhancements

### Short Term
- [ ] Offline mode
- [ ] Advanced filters
- [ ] File upload from camera
- [ ] Biometric authentication

### Medium Term
- [ ] Video interviews
- [ ] In-app chat
- [ ] Advanced analytics
- [ ] Multi-language support

### Long Term
- [ ] AI-powered job matching
- [ ] Resume parsing
- [ ] Calendar integration
- [ ] Social features

## 📊 Performance Metrics

### Target Metrics
- **App Launch**: < 2 seconds
- **Screen Transitions**: < 300ms
- **API Response**: < 1 second
- **Bundle Size**: < 10MB

### Monitoring
- Expo Application Services (EAS)
- Sentry for error tracking
- Analytics for user behavior

## 🛠️ Development Tools

- **TypeScript**: Type safety
- **ESLint**: Code quality
- **Prettier**: Code formatting
- **Git**: Version control
- **Expo Go**: Development testing

## 📝 Best Practices

### Code Organization
- One component per file
- Consistent naming conventions
- Proper TypeScript types
- Clean code principles

### Component Design
- Composition over inheritance
- Props interface for all components
- Reusable and modular
- Proper prop validation

### State Management
- Minimize global state
- Use local state when possible
- Avoid prop drilling
- Keep state close to usage

### Performance
- Avoid unnecessary re-renders
- Memoize expensive computations
- Optimize images
- Profile before optimizing

## 🎓 Learning Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper](https://reactnativepaper.com/)
- [React Query Docs](https://tanstack.com/query/latest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

This architecture is designed to be scalable, maintainable, and follows React Native best practices.

