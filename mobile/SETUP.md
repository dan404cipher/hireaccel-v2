# HireAccel Mobile App - Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Expo CLI** - Install globally: `npm install -g expo-cli`
- **Expo Go App** - Download on your phone:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure Environment

Create a `.env` file in the mobile directory:

```env
EXPO_PUBLIC_API_URL=http://your-backend-url:3002
EXPO_PUBLIC_ENV=development
```

**Important:** Replace `your-backend-url` with:
- For local development: Use your computer's local IP address (e.g., `http://192.168.1.100:3002`)
- For production: Use your production API URL

**Note:** Don't use `localhost` - it won't work on physical devices!

### 3. Start Development Server

```bash
npm start
```

This will start the Expo development server and show a QR code.

### 4. Run on Your Device

#### iOS (iPhone/iPad):
1. Open the Expo Go app on your iOS device
2. Scan the QR code with your camera app
3. The app will open in Expo Go

#### Android:
1. Open the Expo Go app on your Android device
2. Scan the QR code with the Expo Go app scanner
3. The app will load

#### Alternatively, use an emulator:

```bash
# Run on iOS Simulator (macOS only)
npm run ios

# Run on Android Emulator
npm run android
```

## 📱 App Features

The mobile app includes all features from the web application:

### For Candidates:
- ✅ Browse and search job listings
- ✅ Apply to jobs
- ✅ Track application status
- ✅ Manage profile and resume
- ✅ Schedule and view interviews
- ✅ Receive push notifications

### For HR:
- ✅ Post and manage job listings
- ✅ Review applications
- ✅ Schedule interviews
- ✅ Manage company profile
- ✅ View analytics dashboard

### For Agents:
- ✅ View assigned jobs
- ✅ Access candidate pool
- ✅ Schedule interviews
- ✅ Track assignments

### For Admin:
- ✅ Full system access
- ✅ User management
- ✅ Company management
- ✅ System analytics
- ✅ Banner management

## 🏗️ Project Structure

```
mobile/
├── app/                      # Expo Router pages
│   ├── (auth)/              # Authentication screens
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── otp-verification.tsx
│   │   └── ...
│   ├── (tabs)/              # Main app tabs
│   │   ├── dashboard.tsx
│   │   ├── jobs.tsx
│   │   ├── applications.tsx
│   │   ├── candidates.tsx
│   │   ├── interviews.tsx
│   │   └── profile.tsx
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Entry point
├── src/
│   ├── components/          # Reusable components
│   │   └── common/
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.tsx
│   │   └── NotificationContext.tsx
│   ├── services/            # API services
│   │   └── api.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── storage.ts
│   │   └── helpers.ts
│   ├── constants/           # Constants
│   │   └── config.ts
│   └── theme/               # Theme config
│       └── theme.ts
├── assets/                  # Images, fonts
├── package.json
├── app.json                 # Expo config
├── tsconfig.json
└── babel.config.js
```

## 🔧 Development

### Run with Live Reload

The app supports hot reloading. Any changes you make will automatically refresh on your device.

### Debug Mode

- Shake your device to open the developer menu
- Or press `d` in the terminal

### Useful Commands

```bash
# Start development server
npm start

# Start with cleared cache
npm start -- --clear

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Type checking
npm run type-check

# Lint code
npm run lint
```

## 🔌 API Integration

The app connects to your backend API. Make sure:

1. Your backend is running and accessible
2. The `EXPO_PUBLIC_API_URL` in `.env` points to your backend
3. Your backend allows CORS from the mobile app

### Finding Your Local IP Address:

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

Look for your local network IP (usually starts with 192.168.x.x or 10.0.x.x)

## 📦 Building for Production

### For iOS:

```bash
expo build:ios
```

You'll need:
- Apple Developer account
- Provisioning profile
- Distribution certificate

### For Android:

```bash
expo build:android
```

Choose APK or App Bundle (AAB) for Google Play Store.

## 🔐 Authentication Flow

1. **Login/Signup** - User enters credentials
2. **OTP Verification** - Email verification via OTP
3. **Token Storage** - Access token stored securely
4. **Auto-refresh** - Tokens refreshed automatically
5. **Secure Logout** - Clears all local data

## 🔔 Push Notifications

Push notifications are handled via Expo's notification system:

1. Permissions are requested on first launch
2. Notifications work via WebSocket connection
3. Local notifications shown when app is in foreground
4. Tap notification to navigate to relevant screen

## 🎨 Theming

The app uses React Native Paper with a custom theme:
- Primary color: `#6366f1` (Indigo)
- Secondary color: `#06b6d4` (Cyan)
- Supports light mode (dark mode ready)

## 🐛 Troubleshooting

### Can't connect to backend:
- Check your `EXPO_PUBLIC_API_URL` is correct
- Use your computer's local IP, not localhost
- Ensure your phone and computer are on the same network
- Check if your backend allows CORS

### App won't load:
- Try clearing cache: `npm start -- --clear`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Restart Expo Go app

### Build errors:
- Run `npm run type-check` to check for TypeScript errors
- Check console for specific error messages

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper](https://reactnativepaper.com/)
- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query/latest)

## 🤝 Support

For issues or questions:
1. Check the backend API documentation
2. Review Expo documentation
3. Check the troubleshooting section above

## 📝 Notes

- The app requires the backend API to be running
- Push notifications require proper setup in Expo
- For production builds, configure app.json with your credentials
- Test on both iOS and Android before releasing

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Configure .env file
3. ✅ Start development server
4. ✅ Test on your device
5. 📝 Customize theme/branding
6. 🚀 Build for production

Happy coding! 🎉

