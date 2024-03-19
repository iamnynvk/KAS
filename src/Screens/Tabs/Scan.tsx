import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  AppState,
  Image,
  Linking,
  Platform,
  Vibration,
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import SubmitButton from "../../Components/SubmitButton";
import { COLORS, FONT, images } from "../../Constants";
import BackButton from "../../Components/BackButton";
import { makeAuthenticatedGetRequest } from "../../Config/Axios";
import { useDispatch, useSelector } from "react-redux";
import { setScanData } from "../../Slice/scanSlice";
import { showFeedback } from "../../Slice/feedbackSlice";
import { CameraScreen } from "react-native-camera-kit";
import { PERMISSIONS, check, request } from "react-native-permissions";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");

// const eventName = Platform.OS === "android" ? "focus" : "change";

const Scan = (props: any) => {
  const isAddTicket = props?.route?.params?.addTicket;
  const isFocused = useIsFocused();
  const navigation: any = useNavigation();
  const dispatch = useDispatch();
  const { language }: any = useSelector((state: any) => state.Preference);
  const cameraRef: any = useRef();
  const appState: any = useRef(AppState.currentState);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [barCodeData, setBarCodeData] = useState("");

  useEffect(() => {
    const subscription: any = AppState.addEventListener("change", async () => {
      if (appState.current === "active") {
        const permission = await check(
          Platform.OS === "android"
            ? PERMISSIONS.ANDROID.CAMERA
            : PERMISSIONS.IOS.CAMERA
        );
        setCameraPermission(permission === "granted" ? true : false);
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const unsubscribe: any = navigation?.addListener("focus", async () => {
      checkPermission();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    barCodeData && getScanServices();
  }, [barCodeData]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", () => {
      setBarCodeData("");
    });
    return unsubscribe;
  }, [navigation]);

  const checkPermission = async () => {
    const permission = await check(
      Platform.OS === "android"
        ? PERMISSIONS.ANDROID.CAMERA
        : PERMISSIONS.IOS.CAMERA
    );
    if (permission === "granted") {
      setCameraPermission(true);
    } else {
      const requestPerm = await request(
        Platform.OS === "android"
          ? PERMISSIONS.ANDROID.CAMERA
          : PERMISSIONS.IOS.CAMERA
      );
      setCameraPermission(requestPerm === "granted" ? true : false);
    }
  };

  const getScanServices = async () => {
    dispatch(setScanData(barCodeData));
    Vibration?.vibrate(100);
    try {
      const { data } = await dispatch(
        makeAuthenticatedGetRequest(
          `/scan/scan-get-services/?zone_id=${barCodeData}`
        )
      );
      if (data?.status === 200) {
        if (data?.results.length > 0) {
          setBarCodeData("");
          navigation?.navigate("Tasks", {
            scanningData: data?.results,
            isAddTicket: isAddTicket,
          });
        } else {
          dispatch(
            showFeedback({
              type: "error",
              message: language?.noDataAvailable,
            })
          );
        }
      }
    } catch (err: any) {}
  };

  return (
    <View style={styles.container}>
      {!cameraPermission ? (
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <Image
              source={images.camera}
              resizeMode={"contain"}
              style={styles.imageStyle}
            />
            <Text style={styles.titleText}>{language?.cameraPermission}</Text>
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              {language?.cameraPermissionDescription}
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <SubmitButton
              title={language?.openSetting}
              handleSubmitButton={async () => await Linking.openSettings()}
            />
          </View>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          {isFocused && (
            <CameraScreen
              ref={cameraRef}
              scanBarcode={true}
              onReadCode={(event) =>
                setBarCodeData(event?.nativeEvent?.codeStringValue)
              }
              showFrame={true}
              laserColor={"red"}
              frameColor={"white"}
            />
          )}

          <View style={styles.backContainer}>
            <BackButton color={COLORS.white} />
          </View>

          <View style={styles.textScanContainer}>
            <Text style={styles.scanText}>{language?.scanText}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default Scan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  imageContainer: {
    marginTop: screenWidth / 4,
  },
  imageStyle: {
    height: screenWidth / 2,
    width: screenWidth,
  },
  titleText: {
    color: COLORS.solidBlack,
    fontFamily: FONT.notoSansBold,
    alignSelf: "center",
    marginTop: screenWidth / 10,
    fontSize: 18,
  },
  descriptionContainer: {
    marginTop: screenWidth / 10,
    marginHorizontal: 20,
  },
  description: {
    color: COLORS.secondary,
    textAlign: "center",
    fontFamily: FONT.notoSansMedium,
    fontSize: 14,
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: screenWidth / 5,
  },
  cameraContainer: {
    flex: 1,
  },
  cameraStyles: {
    flex: 1,
  },
  qrCodeContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  backContainer: {
    position: "absolute",
    left: 15,
    top: 5,
  },
  textScanContainer: {
    width: "100%",
    position: "absolute",
    bottom: "20%",
    justifyContent: "center",
    alignItems: "center",
  },
  scanText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONT.notoSansMedium,
  },
});
