# React Native Mobile frontend README

> Sources: 
> (1) [Build mobile apps with React Native and Django Rest Framework](https://youtu.be/Jyj-50T4MqQ?si=nNqsdS9Q8b7dnFh5)

## [1] Getting Started with React Native (and Expo)

### Download Node.js and Expo
* Note: Node.js is a dependency for React Native and Expo is a popular set of libraries for React Native which makes it much more usable

1. Follow download instructions on [Node.js download page](https://nodejs.org/en/download). Please note the versions (see example with versions below.) 

```
***** For Linux, follow instructions for your OS *****

# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"

# Download and install Node.js:
nvm install 22

# Verify the Node.js version:
node -v # Should print "v22.20.0".

# Verify npm version:
npm -v # Should print "10.9.3".
```

2. [Download the Expo Go](https://expo.dev/go) app on your phone
    * Allows demoing on physical mobile device. 

3. (Optional) [Download Android Studio](https://developer.android.com/studio/install)
    * Android emulator to demo directly on your device. 
    * Otherwise, __Expo Go suffices__

4. In VSCode, install the following extensions:
    * React Native Tools
    * Expo Tools

### Setup Frontend Project (Code + Demo)
1. Create expo app
    ```bash
    npx create-expo-app mobile --template expo-router
    ```
    * __In this case, I am using the expo-router template which gives enhanced app routing.__
    * See [this video](https://www.youtube.com/watch?v=Z20nUdAUGmM) for how it works.

2. Install needed libraries.
```



```

2. You'll get prompted some libraries install. Type 'y' for 'yes' to install the package.
    * create-expo-app@3.5.3 -> yes
    * typescript@~5.9.2 -> yes (even though we arent using typescript)
```
Need to install the following packages:
create-expo-app@3.5.3
Ok to proceed? (y) y

? It looks like you're trying to use TypeScript but don't have the required dependencies installed. Would you like to
install typescript@~5.9.2? › (Y/n)
```

3. Start expo dev server. 
    * Navigate to app folder and run expo start command.
    ```
    cd <app-name>
    npx expo start
    ```
    * The terminal will generate a QR code. Scan it with your camera app and open it in Expo Go. It will take a moment to load.
    * To stop server ```ctrl + c```


Now we created our expo app and ran a demo on our mobile device!





## Dependencies
```
npm install react-native-safe-area-context

```

## Common Problems
