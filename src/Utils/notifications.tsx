import messaging from "@react-native-firebase/messaging";
import { PermissionsAndroid } from "react-native";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification";
import { ToastAndroid } from "react-native";

export const initFirebase = () => {
  messaging().onMessage(localNotifications);
  messaging()
    .getInitialNotification()
    .then((notificationOpen) => {
      if (notificationOpen) {
        console.log(notificationOpen);
      }
    });
};

export const requestUserPermission = async () => {
  const permission: any = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  );
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  initFirebase();

  if (permission == "granted" || enabled) {
    console.log(`Notification permission ${permission}, enable - ${enabled}`);
  } else {
    ToastAndroid.show("Give notification permission", 2000);
  }
};

PushNotification.createChannel(
  {
    channelId: "kas mobile",
    channelName: "kas mobile channel",
    channelDescription: "A channel to categories your notifications",
    playSound: true,
    importance: 4,
    vibrate: true,
  },
  (created: any) => console.log(`createChannel returned '${created}'`)
);

PushNotification.configure({
  onRegister: function (token: any) {
    console.log("TOKEN:", token);
  },
  onNotification: function (notification: any) {
    console.log("NOTIFICATION ------:", notification);
    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },
  onAction: function (notification: any) {
    console.log("ACTION:", notification.action);
    console.log("NOTIFICATION:", notification);
  },
  onRegistrationError: function (err: any) {
    console.error(err.message, err);
  },
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },
  popInitialNotification: true,
  requestPermissions: true,
});

export const localNotifications = (remoteMessage: any) => {
  const { notification, data, messageId } = remoteMessage;

  PushNotification.localNotification({
    channelId: "kas mobile",
    largeIcon: "",
    smallIcon: notification?.android?.smallIcon,
    bigPictureUrl: notification.imageUrl,
    bigText: notification.body || "",
    subText: notification.title,
    title: notification.title,
    message: notification.body || "",
    userInfo: data,
    messageId,
    priority: "high",
    importance: "high",
    visibility: "public",
    allowWhileIdle: true,
    invokeApp: false,
    ignoreInForeground: false,
    usesChronometer: true,
    vibration: 300,
  });
};
