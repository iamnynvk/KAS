import React, { useEffect } from "react";
import Routes from "./src/Routes";
import {
  NativeModules,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider } from "react-redux";
import { persistor, store } from "./src/Store/ConfigureStore";
import { PersistGate } from "redux-persist/integration/react";
import { COLORS } from "./src/Constants";
import LoadingOverlay, { LoadingOverlayRef } from "./src/Utils/LoadingOverlay";
import { setBackCamera, setFrontCamera } from "./src/Slice/scanSlice";
import GlobalMessagePopUp from "./src/Components/GlobalMessagePopUp";
import { setActiveLanguage, setLanguage } from "./src/Slice/preferenceSlice";
import { localization } from "./src/localization";
import messaging from "@react-native-firebase/messaging";
import { setFcmToken } from "./src/Slice/userSlice";
import { requestUserPermission } from "./src/Utils/notifications";
import codePush from "react-native-code-push";

type React$Node = /*unresolved*/ any;
const MyApp: () => React$Node = () => {
  useEffect(() => {
    store.dispatch(setLanguage(store.getState().Preference.languageIndex));
    store.dispatch(
      setActiveLanguage(localization(store.getState().Preference.languageIndex))
    );
  });

  useEffect(() => {
    requestUserPermission();
    getFCMToken();
    if (Platform.OS == "android") {
      const splashScreenInterval = setTimeout(() => {
        NativeModules.SplashScreenModule.hide();
      }, 2000);
      return () => clearTimeout(splashScreenInterval);
    }
  }, []);

  const getFCMToken = async () => {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      store.dispatch(setFcmToken(fcmToken));
    } else {
      console.log("Failed", "No token received");
    }
  };

  return (
    <PaperProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <StatusBar
            animated={true}
            barStyle="dark-content"
            backgroundColor={COLORS.white}
          />
          <SafeAreaView style={styles.container} />
          <GlobalMessagePopUp />
          <Routes />
          <LoadingOverlay ref={LoadingOverlayRef} />
        </PersistGate>
      </Provider>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
  },
});

export default codePush(MyApp);
