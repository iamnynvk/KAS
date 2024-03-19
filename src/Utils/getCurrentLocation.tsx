import {
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  ToastAndroid,
} from "react-native";
import Geolocation from "react-native-geolocation-service";
import RNMockLocationDetector from "react-native-mock-location-detector";

const getPermissionIOS = async () => {
  const status = await Geolocation.requestAuthorization("whenInUse");

  if (status === "granted") {
    return true;
  }

  if (status === "denied") {
    Alert.alert("Permission", "Location permission denied", [
      {
        text: "Okay",
        onPress: () => console.log("Permission denied by user"),
      },
    ]);
  }

  if (status === "disabled") {
    Alert.alert(
      "Setting",
      "Turn on Location Services to allow KAS to determine your location.",
      [{ text: "Go to Settings", onPress: () => Linking.openSettings() }]
    );
  }
};

const hasLocationPermission = async () => {
  if (Platform.OS === "ios") {
    const hasPermission = await getPermissionIOS();
    return hasPermission;
  }

  if (Platform.OS === "android" && Platform.Version < 23) {
    return true;
  }

  const hasPermission = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  if (hasPermission) {
    return true;
  }

  const status = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  if (status === PermissionsAndroid.RESULTS.GRANTED) {
    return true;
  }

  if (status === PermissionsAndroid.RESULTS.DENIED) {
    Platform.OS === "android" &&
      ToastAndroid.show("Location permission denied", ToastAndroid.LONG);
  } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    Platform.OS === "android" &&
      ToastAndroid.show("Location permission revoked", ToastAndroid.LONG);
  }
  return false;
};

export const getLocation = async () => {
  const hasPermission = await hasLocationPermission();
  if (!hasPermission) {
    return;
  }
  return new Promise((resolve, reject) => {
    Geolocation?.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        if (Platform.OS == "android") {
          const isLocationMocked: boolean =
            await RNMockLocationDetector.checkMockLocationProvider();
          if (isLocationMocked) {
            resolve({ isLocationMocked });
            return;
          }
        }
        resolve({ latitude, longitude });
      },
      (error) => reject(error),
      {
        accuracy: {
          android: "high",
          ios: "best",
        },
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 0,
        forceRequestLocation: true,
        forceLocationManager: false,
        showLocationDialog: true,
      }
    );
  });
};
