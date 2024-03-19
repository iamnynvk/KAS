import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
import { COLORS, FONT, images } from "../../../Constants";
import { Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import SubmitButton from "../../../Components/SubmitButton";
import { setCaptureImage } from "../../../Slice/ImageSlice";
import { useNavigation } from "@react-navigation/core";
import { AppState } from "react-native";
import { Camera } from "react-native-camera-kit";
import { request, PERMISSIONS, check } from "react-native-permissions";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");

const flashImages = {
  on: require("./images/flashOn.png"),
  off: require("./images/flashOff.png"),
  auto: require("./images/flashAuto.png"),
};

const flashArray = [
  {
    mode: "auto",
    image: flashImages.auto,
  },
  {
    mode: "on",
    image: flashImages.on,
  },
  {
    mode: "off",
    image: flashImages.off,
  },
] as const;

const CameraScreen = (props: any) => {
  const { mode } = props?.route?.params;
  const navigation: any = useNavigation();
  const dispatch: any = useDispatch();
  const cameraRef: any = useRef<Camera>(null);
  const appState: any = useRef(AppState.currentState);
  const { language }: any = useSelector((state: any) => state.Preference);
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  const [currentFlashArrayPosition, setCurrentFlashArrayPosition] = useState(0);
  const [flashData, setFlashData] = useState<any>(
    flashArray[currentFlashArrayPosition]
  );
  const [zoom, setZoom] = useState<number | undefined>();
  const [torchMode, setTorchMode] = useState(false);
  const [showImageUri, setShowImageUri] = useState<string>("");
  const isCapturing = useRef(false);

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

  const takePhoto = async (_imageData: any) => {
    function toDataUrl(url: string, callback: any) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
          callback(reader.result);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.send();
    }

    try {
      toDataUrl(_imageData?.uri, (myBase64: any) => {
        dispatch(
          setCaptureImage({
            base64: myBase64,
            uri: _imageData?.uri,
          })
        );
        navigation.goBack();
      });
    } catch (error: any) {
      console.log(error);
    }
  };

  const PermissionPopUp = () => {
    return (
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
    );
  };

  const onSetFlash = () => {
    const newPosition = (currentFlashArrayPosition + 1) % 3;
    setCurrentFlashArrayPosition(newPosition);
    setFlashData(flashArray[newPosition]);
  };

  const CaptureButton = ({
    onPress,
    children,
  }: {
    onPress: () => void;
    children?: React.ReactNode;
  }) => {
    const w = 80,
      brdW = 4,
      spc = 6;
    const cInner = "white",
      cOuter = "white";
    return (
      <TouchableOpacity onPress={onPress} style={{ width: w, height: w }} activeOpacity={0.8}>
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: w,
            height: w,
            borderColor: cOuter,
            borderWidth: brdW,
            borderRadius: w / 2,
          }}
        />
        <View
          style={{
            position: "absolute",
            left: brdW + spc,
            top: brdW + spc,
            width: w - (brdW + spc) * 2,
            height: w - (brdW + spc) * 2,
            backgroundColor: cInner,
            borderRadius: (w - (brdW + spc) * 2) / 2,
          }}
        />
        {children}
      </TouchableOpacity>
    );
  };

  const onCaptureImagePressed = async () => {
    if (showImageUri) {
      setShowImageUri("");
      return;
    }
    if (!cameraRef.current || isCapturing.current) return;
    let image: any;
    try {
      isCapturing.current = true;
      image = await cameraRef.current.capture();
      takePhoto(image);
    } catch (e) {
      console.log("error", e);
    } finally {
      isCapturing.current = false;
    }
    if (!image) return;
  };

  return (
    <View style={styles.container}>
      {!cameraPermission ? (
        <PermissionPopUp />
      ) : (
        <View style={styles.screen}>
          <SafeAreaView style={styles.topButtons}>
            {flashData?.image && (
              <TouchableOpacity
                style={styles.topButton}
                onPress={onSetFlash}
                activeOpacity={0.8}
              >
                <Animated.Image
                  source={flashData.image}
                  resizeMode="contain"
                  style={styles.topButtonImg}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.topButton}
              onPress={() => setTorchMode(!torchMode)}
              activeOpacity={0.8}
            >
              <Animated.Image
                source={
                  torchMode
                    ? require("./images/torchOn.png")
                    : require("./images/torchOff.png")
                }
                resizeMode="contain"
                style={styles.topButtonImg}
              />
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.cameraContainer}>
            {showImageUri ? (
              <Image
                source={{ uri: showImageUri }}
                style={styles.cameraPreview}
                resizeMode="contain"
              />
            ) : (
              <Camera
                ref={cameraRef}
                style={styles.cameraPreview}
                cameraType={mode}
                flashMode={flashData?.mode}
                resetFocusWhenMotionDetected
                zoom={zoom}
                maxZoom={10}
                onZoom={(e: any) => {
                  console.log("zoom", e.nativeEvent.zoom);
                  setZoom(e.nativeEvent.zoom);
                }}
                torchMode={torchMode ? "on" : "off"}
              />
            )}
          </View>

          <SafeAreaView style={styles.bottomButtons}>
            <View style={styles.backBtnContainer}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <Animated.Text style={styles.backTextStyle}>
                  {language?.back}
                </Animated.Text>
              </TouchableOpacity>
            </View>

            <View style={styles.captureButtonContainer}>
              <CaptureButton onPress={onCaptureImagePressed}>
                <View style={styles.textNumberContainer} />
              </CaptureButton>
            </View>

            <View style={styles.thumbnailContainer} />
          </SafeAreaView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  preview: {
    flex: 1,
    position: "relative",
  },
  capture: {
    position: "absolute",
    overflow: "hidden",
    backgroundColor: COLORS.white,
    height: 60,
    width: 60,
    borderRadius: 90,
    alignSelf: "center",
    bottom: 50,
    justifyContent: "center",
    alignItems: "center",
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
  flash: {
    position: "absolute",
    overflow: "hidden",
    backgroundColor: COLORS.gray,
    height: 30,
    width: 30,
    borderRadius: 15,
    alignSelf: "flex-end",
    top: 20,
    right: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modalStyle: {
    backgroundColor: COLORS.liteWhite,
    marginHorizontal: 20,
    padding: 25,
    flexDirection: "row",
    justifyContent: "flex-start",
    borderRadius: 5,
  },
  // cameraPreview: {
  //   flex: 1,
  //   justifyContent: "center",
  // },
  screen: {
    height: "100%",
    backgroundColor: "black",
  },
  topButtons: {
    margin: 10,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  topButton: {
    backgroundColor: "#222",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  topButtonImg: {
    margin: 10,
    width: 24,
    height: 24,
  },
  cameraContainer: {
    justifyContent: "center",
    flex: 1,
  },
  cameraPreview: {
    aspectRatio: 3 / 4,
    width: "100%",
  },
  bottomButtons: {
    margin: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtnContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  backTextStyle: {
    padding: 10,
    color: "white",
    fontSize: 20,
  },
  captureButtonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textNumberContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  zoomFactor: {
    color: "#ffffff",
  },
  thumbnailContainer: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginEnd: 10,
  },
});

export default CameraScreen;
