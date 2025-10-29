# Getting Started with HireAccel Mobile App

Welcome! The mobile app is now fully updated and ready to run. This guide will help you get started.

## 🎉 Current Status

✅ **All mobile app updates are complete!**

The app has been updated to match the latest backend API changes. All job-related features now support enhanced fields including:
- Work Type (WFO/WFH/Hybrid)
- Structured Address
- Number of Openings
- Benefits & Perks
- Application Deadlines
- Interview Process Details
- And more!

## 📋 Quick Start

### Prerequisites

Make sure you have:
- Node.js (v18+) installed
- npm or yarn installed
- Expo CLI installed: `npm install -g expo-cli`
- Expo Go app on your phone (for testing)
  - iOS: [App Store](https://apps.apple.com/us/app/expo-go/id982107779)
  - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Installation Steps

1. **Navigate to the mobile directory:**
   ```bash
   cd /Users/danushtom/Desktop/hire-accel-v2/mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   
   Create a `.env` file in the mobile directory:
   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3002
   EXPO_PUBLIC_ENV=development
   ```
   
   **⚠️ Important:** Replace `YOUR_LOCAL_IP` with your computer's local IP address (not `localhost`).
   
   **Find your local IP:**
   - **macOS:** Run `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - **Windows:** Run `ipconfig` and look for IPv4 Address
   - **Linux:** Run `hostname -I`
   
   Example: `EXPO_PUBLIC_API_URL=http://192.168.1.100:3002`

4. **Start the backend API:**
   
   In a separate terminal:
   ```bash
   cd /Users/danushtom/Desktop/hire-accel-v2/api
   npm run dev
   ```
   
   Make sure the API is running on port 3002.

5. **Start the mobile app:**
   ```bash
   npm start
   ```

6. **Run on device:**
   - Scan the QR code with:
     - **iOS:** Camera app
     - **Android:** Expo Go app
   
   Or press:
   - `i` for iOS Simulator (macOS only)
   - `a` for Android Emulator
   - `w` for Web (experimental)

## 📱 Testing the Updates

Once the app is running, test these features:

### 1. Job Listing
- View all jobs with stats (Total, Open, Applications, Accepted)
- Search and filter jobs
- Check if job cards display correctly

### 2. Job Details
- Open any job
- Verify all fields are displayed:
  - Work Type (WFO/WFH/Hybrid)
  - Number of Openings
  - Benefits section
  - Interview Process (rounds & duration)
  - Application Deadline
  - Languages required
- Check if badges and icons render correctly

### 3. Create New Job (HR/Admin role)
- Navigate to "Post New Job"
- Fill in all fields including:
  - Company (should auto-fill address)
  - Job Title & Description
  - Work Type selector
  - Salary Range
  - Benefits
  - Number of Openings
  - Interview Process
- Submit and verify job creation

### 4. Edit Job (HR/Admin role)
- Open an existing job
- Click edit icon
- Verify all fields are pre-populated
- Make changes and save
- Verify updates are reflected

## 🔐 Test Accounts

Create test accounts for different roles:

```javascript
// Candidate Account
{
  email: "candidate@test.com",
  password: "Test1234",
  role: "candidate"
}

// HR Account
{
  email: "hr@test.com",
  password: "Test1234",
  role: "hr"
}

// Admin Account (use CREATE_ADMIN.md in api/ folder)
{
  email: "admin@test.com",
  password: "Admin1234",
  role: "admin"
}
```

## 🔧 Troubleshooting

### Common Issues

1. **"Network request failed"**
   - Check if backend API is running
   - Verify `.env` file has correct IP address
   - Make sure phone and computer are on same network
   - Try restarting the Expo server: `npm start -- --clear`

2. **"Cannot connect to API"**
   - Ping your API: `curl http://YOUR_IP:3002/health`
   - Check firewall settings (allow port 3002)
   - Try using different network (not corporate/restricted)

3. **"Module not found" errors**
   - Delete `node_modules`: `rm -rf node_modules`
   - Clear cache: `npm start -- --clear`
   - Reinstall: `npm install`

4. **TypeScript errors**
   - Run type check: `npm run type-check`
   - Check `/mobile/UPDATES.md` for details

5. **App crashes on startup**
   - Check Metro bundler logs
   - Look for missing dependencies
   - Clear Expo cache: `expo start -c`

### Getting Help

- Check logs in terminal where `npm start` is running
- Check device logs in Expo Go app
- Review `/mobile/README.md` for detailed documentation
- Review `/mobile/ARCHITECTURE.md` for technical details

## 🚀 Building for Production

### iOS (TestFlight/App Store)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build iOS app
eas build --platform ios
```

### Android (Google Play)

```bash
# Build Android app
eas build --platform android
```

### Environment Variables for Production

Update `.env` for production:
```env
EXPO_PUBLIC_API_URL=https://your-production-api.com
EXPO_PUBLIC_ENV=production
```

## 📚 Additional Resources

- **Project Documentation:**
  - `/mobile/README.md` - Complete feature list
  - `/mobile/ARCHITECTURE.md` - Technical architecture
  - `/mobile/PROJECT_SUMMARY.md` - Project overview
  - `/mobile/SETUP.md` - Detailed setup guide
  - `/mobile/UPDATES.md` - Recent updates

- **External Resources:**
  - [Expo Documentation](https://docs.expo.dev/)
  - [React Native Paper](https://reactnativepaper.com/)
  - [React Query Docs](https://tanstack.com/query/latest)
  - [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🎯 What's New

### Recently Updated Features

1. **Enhanced Job Model** ✅
   - Work Type (WFO/WFH/Hybrid)
   - Structured Address
   - Number of Openings
   - Benefits & Perks
   - Application Deadlines
   - Interview Process Details

2. **Fixed Issues** ✅
   - Removed undefined API call in jobs list
   - Updated stats calculation
   - Improved type safety

3. **UI Improvements** ✅
   - Better field display
   - Proper validation
   - Enhanced forms

## 📝 Development Notes

- The app uses **Expo Router** for file-based routing
- State management: **React Query** + **Context API**
- UI components: **React Native Paper** (Material Design 3)
- All API calls are typed with **TypeScript**
- Forms include proper **validation**

## 🎨 App Features by Role

### Candidate
- Browse job listings
- View job details
- Apply to jobs (coming soon)
- Track applications
- Manage profile

### HR
- Post new jobs
- Edit existing jobs
- View applications
- Schedule interviews
- Manage company profile

### Admin
- All HR features
- User management
- Company management
- System analytics

## 🔄 Next Development Steps

Consider implementing:
1. Date picker for application deadlines
2. Rich text editor for descriptions
3. Image upload for logos
4. Map integration for addresses
5. Push notifications
6. Offline mode
7. Biometric authentication

## 💡 Tips

1. **Hot Reload:** Shake device and select "Enable Fast Refresh"
2. **Debug Menu:** Shake device to open developer menu
3. **Remote Debugging:** Use Chrome DevTools for debugging
4. **Network Inspection:** Install React Native Debugger
5. **Performance:** Use Expo Performance Monitor

## ✅ Checklist Before Deployment

- [ ] Test on iOS device
- [ ] Test on Android device
- [ ] Test all user roles
- [ ] Verify all API endpoints
- [ ] Check error handling
- [ ] Test offline scenarios
- [ ] Review app permissions
- [ ] Test push notifications
- [ ] Verify analytics tracking
- [ ] Update version numbers

---

## 🚀 Ready to Start!

Your mobile app is fully set up and ready to run. Follow the Quick Start steps above and you'll be testing in minutes!

**Questions or issues?** Check the troubleshooting section or review the documentation files.

Happy coding! 🎉


