/**
 * @format
 */

import "react-native-reanimated";
import { AppRegistry, Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";
import App from "./App";
import { name as appName } from "./app.json";
import { LocalNotification } from "./src/Utils/notifications";

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Message handled in the background!", remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
