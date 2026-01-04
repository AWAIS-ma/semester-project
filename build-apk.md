# APK Build Commands for Trivi App

## Prerequisites
```bash
# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Login to Expo account
eas login
```

## Build APK (EAS Cloud Build - Recommended)

### First Time Setup
```bash
# Navigate to project directory
cd Trivi

# Configure EAS Build
eas build:configure
```

### Build Commands

#### Build APK for Testing/Preview
```bash
eas build --platform android --profile preview
```

#### Build APK for Production
```bash
eas build --platform android --profile production
```

#### Build APK Locally (requires Android Studio)
```bash
eas build --platform android --profile preview --local
```

## Build APK (Local Build - Requires Android Studio)

### Setup Android Environment
1. Install Android Studio
2. Install Android SDK (API 33+)
3. Set ANDROID_HOME environment variable

### Build Commands
```bash
# Navigate to project
cd Trivi

# Generate native Android project
npx expo prebuild --platform android

# Build APK
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

## Useful Commands

### Check Build Status
```bash
eas build:list
```

### Download Built APK
```bash
eas build:download
```

### View Build Logs
```bash
eas build:view
```

### Cancel Build
```bash
eas build:cancel
```

## EAS Build Profiles (in eas.json)

You may need to create `eas.json` in the Trivi folder:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

## Notes
- First build may take 10-20 minutes
- APK file size: ~20-50 MB typically
- Make sure you have sufficient Expo account credits for cloud builds
- Local builds are free but require Android Studio setup

