# telldus-purple-internal

Internal dev repo for Telldus

**Notes:**

- keep the README.md complete and up to date! Goal is that it contains everything you need to get started.
- Feel free to adapt it as you see fit, you don't need permission.

## Install

All commands are assumed to be ran from project root.

### General

- install [nodejs >= 6](https://nodejs.org/en/)
- install local deps: `npm i`
- install global deps: `npm install -g react-native-cli`

### iOS

- install cacao pods cli: `brew install Caskroom/cask/cocoapods-app`
- install cacao pod deps: `cd ios && pod install`
- install Xcode via [Mac App Store](https://itunes.apple.com/us/app/xcode/id497799835?mt=12)

### Android

- find all the instructions you need for setting up your Android development environment on [React Native Official - Android Setup](https://facebook.github.io/react-native/releases/0.23/docs/android-setup.html)
- **install dependencies with Android Studio**:
  - Android SDK Manager is no longer available as a separate GUI (run `android`), but integrated in [Android Studio](https://developer.android.com/studio/install.html). Install it, go through default setup. When you get to chose your project (new, use existing, etc.), choose `Configure` -> `SDK Manager` on the bottom. This pretty much looks like the old GUI, only now it's split over 3 tabs. Use `Show Package Details` checkbox in the bottom, to expand the dependencies.
  - When you run the app, the `react-native` will use the `ANDROID_HOME` environment variable to find the SDK. So, if you install with Android Studio, use `export ANDROID_HOME=/Users/elbow/Library/Android/sdk` (add it to your `~/.bash_profile`).
- **install dependencies via the command-line** with [`sdkmanager`](https://developer.android.com/studio/command-line/sdkmanager.html). The instructions for `sdkmanager` on the official React Native page are somewhat outdated:
  - download it with `brew install Caskroom/cask/android-sdk` (instead of `brew install android-sdk`)
  - brew now uses a different path to store packages, use `export ANDROID_HOME=/usr/local/share/android-sdk` (instead of `export ANDROID_HOME=/usr/local/opt/android-sdk`)
  - `sdkmanager` might warn that `~/.android/repositories.cfg` could not be loaded. `touch ~/.android/repositories.cfg` to create it
  - to show all Android deps you can install, use `sdkmanager --list --verbose`
  - we currently run Android version 24, which you need to install Android deps for:
  `sdkmanager "build-tools;24.0.1" "platforms;android-24" "system-images;android-24;google_apis;x86_64" "system-images;android-24;google_apis;x86" --verbose` (includes Google Support Library and Play Services)
  - but certain deps need Android version 23, therefore you also need to run:
  `sdkmanager "build-tools;23.0.1" "platforms;android-23" "system-images;android-23;google_apis;x86_64" "system-images;android-23;google_apis;x86" --verbose`
  - we need some general Android deps:
  `sdkmanager "tools" "platform-tools" "extras;android;m2repository" "extras;google;m2repository" --verbose`
- you need a `android/app/google-services.json` file, otherwise the app won't run **TODO: figure out how to add one for local testing**
- to run the app on your device, check out [React Native: Running On Device](https://facebook.github.io/react-native/releases/0.23/docs/running-on-device-android.html#content). When your (virtual) device is connected, you can see it show up when you run `adb devices`. run `react-native run-android` to launch the app on your phone
- use `adb logcat` to look at the Android log file
- when the app launches on your (virtual) device, it will send you to the Settings screen for "Apps that can draw over other apps". Enable this for the Telldus app and launch the app again from your app drawer.


## Development

### Local config

You'll need to add `local.config.js` in the root of your project. It's not to be checked in (ignored by git).

Create a file in the root of the project called 'config.local.js' with the contents of the script and fill with the valid keys.

**Example script:**

```
module.exports = {
	key1: value1,
	key2: value2,
	...
};
```

**Valid keys:**

 - `version`: string - App version
 - `apiServer`: string - Telldus API server url e.g. https://api.telldus.com
 - `publicKey`: string - Telldus API public key
 - `privateKey`: string - Telldus API public key
 - `googleAnalyticsId`: string - Google Analytics Id
 - `testUsername`: string - Used as a default username at login
 - `testPassword`: string - Used as a default passwod at login


## Run

- environment vars?

### iOS

- `react-native run-ios`

### Note:

To make development quick React Native comes with a Launch Packager which is run when you do `react-native run-ios`. This keeps some internal state and allows for hot code swapping and debugging inside the app (`cmd + D`). However, the packager keeps internal state which might go stale without you knowing. The only way to find out is to make a clean build:

- in the app: `cmd + shift + H`, long click on App, delete App
- quit the Launch Packager (runs in own window, so close window should do the trick)
- `react-native run-ios` to trigger a fresh build

### Android

- `react-native run-android`

## Split dependencies

`dependencies` are dependencies require on production like servers, `devDependencies` are deps needed during development and the build process. All the client side libs should therefore reside in `devDependencies`.

## Builds

## Repo structure

## Testing

## Naming convention branches, commits and pull requests

## Logging
