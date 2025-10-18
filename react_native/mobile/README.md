# UMBC NAVIGATION APP : react-native frontend
> 🚧  Work in progress – This project is currently under development.

## About the Project
A React Native app built with Expo and Expo Router for cross-platform UMBC campus navigation and displaying rich points of interest.


## Get Started

1. This project was developed using the following versions of Node.js and npm. Make sure your local environment matches to avoid compatibility issues.
    ```bash
    # Check your Node.js version
    node -v
    # This project uses v22.17.0

    # Check your npm version
    npm -v
    # This project uses 10.9.2
    ```
2. This project uses Expo and React Native with several supporting libraries. All required dependencies are listed in package.json and can be installed automatically with the following command.

   ```bash
   # Navigate to the project folder (mobile) and run
   npm install
   ```

3. Start the app

   ```bash
   # Run in the project folder (mobile)
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo


## Structure of the Project
Relevant files:
```
mobile/
├── app/       
│   ├── _layout.jsx         # Global styling for the app
│   ├── index.jsx           # Home screen, defaults to map
│   ├── navigation.jsx      # Step-by-step navigation screen
│   ├── destination.jsx     # Screen shown when user reaches destination
│   └── modal.jsx           # A reusable pop-up dialouge component, similar to alert() in webdev (javascript)
├── README.md               # What you are reading now. The documentation for the mobile frontend.
└── package.json            # Configuration file. Contains dependencies, scripts, and metadata. 

```

## Key Dependencies 
Some of the main libraries used in this project:

- React & React Native – Core framework
- Expo – Development platform
- Expo Router – File-based routing

- React Navigation:
    - @react-navigation/native
    - @react-navigation/native-stack
    - @react-navigation/bottom-tabs

- UI & Gesture Libraries:
    - @expo/vector-icons
    - @gorhom/bottom-sheet ❤️
    - react-native-gesture-handler
    - react-native-reanimated

- Other Expo Modules:
    - expo-constants, expo-font, expo-haptics, expo-image, expo-linking, expo-splash-screen, expo-status-bar, expo-system-ui, expo-web-browser

- Maps & Portals:
    - react-native-maps
    - react-native-portalize ❤️

#### Development Dependencies
- typescript – TypeScript support
- eslint & eslint-config-expo – Linting
- @types/react – TypeScript type definitions
- @react-native-community/cli – React Native CLI tools



## Sources

Expo resources:
- [Expo documentation](https://docs.expo.dev/)
- [Expo guides](https://docs.expo.dev/guides)
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/)

