import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "../../Components/AppHeader";
import SubmitButton from "../../Components/SubmitButton";
import {
  makeAuthenticatedGetRequest,
  makeAuthenticatedPatchRequest,
  makeAuthenticatedPostRequest,
} from "../../Config/Axios";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONT, images } from "../../Constants";
import { getLocation } from "../../Utils/getCurrentLocation";
import { IToggle } from "../Authentication/Login";
import LoadingOverlay from "../../Utils/LoadingOverlay";
import { convertReadableTime, convertToReadableDate } from "../../Utils/Utils";
import { showFeedback } from "../../Slice/feedbackSlice";
import { getUniqueId } from "react-native-device-info";
import { clearCaptureImage } from "../../Slice/ImageSlice";
import { BackHandler } from "react-native";
const { width: screenWidth }: any = Dimensions.get("screen");

const CheckIn = ({ route }: any) => {
  const navigation: any = useNavigation();
  const dispatch = useDispatch();
  const { language }: any = useSelector((state: any) => state.Preference);
  const { userRole }: any = useSelector((state: any) => state.user);
  const { captureImage }: any = useSelector((state: any) => state.image);
  const [statusMessage, setStatusMessage] = useState(null);
  const [signInTime, setSignInTime] = useState(null);
  const [isCheckIn, setIsCheckIn] = useState(false);
  const [isCheckOut, setIsCheckOut] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [handleToggle, setHandleToggle] = useState<IToggle>({
    loading: false,
    isClick: false,
  });

  useEffect(() => {
    const sub = navigation.addListener("focus", async () => {
      getAttendanceStatus();
      getDeviceId();
    });
    getUserLocation();
    return sub;
  }, []);

  const getDeviceId = async () => {
    const deviceID: any = await getUniqueId().then((uniqueId) => uniqueId);
    setDeviceId(deviceID);
  };

  const getAttendanceStatus = async () => {
    try {
      const { data } = await dispatch(
        makeAuthenticatedGetRequest(
          userRole == 5
            ? `/attendance/project-manager-attendance-current-status-detail/${route?.params?.projectId}/`
            : "/attendance/attendance-current-status/"
        )
      );
      if (data.status == 200) {
        setIsCheckIn(data?.results?.is_checkin);
        setIsCheckOut(data?.results?.is_checkout);
        setStatusMessage(data?.results?.attendance_status_msg);
        setSignInTime(data?.results?.sign_in_time);
        LoadingOverlay.hide();
      }
      LoadingOverlay.hide();
    } catch (e: any) {
      LoadingOverlay.hide();
      console.log("Error from check-in status Apis called ----", e?.message);
    }
  };

  const getUserLocation = async () => {
    const location: any = await getLocation();
  };

  // Check-in Button Handler
  const onCheckIn = async () => {
    setHandleToggle({
      loading: true,
      isClick: true,
    });

    const location: any = await getLocation();
    if (location?.isLocationMocked) {
      dispatch(
        showFeedback({
          type: "error",
          message: language?.spoofLocation,
        })
      );
      setHandleToggle({
        loading: false,
        isClick: false,
      });
      return;
    }

    const paramsData: any = {
      location: {
        latitude: JSON.stringify(location?.latitude),
        longitude: JSON.stringify(location?.longitude),
      },
      sign_in_image: captureImage?.base64,
      device_id: deviceId,
    };
    if (userRole == 5) {
      paramsData["project"] = route.params.projectId;
    }
    try {
      const { data }: any = await dispatch(
        makeAuthenticatedPostRequest("/attendance/check-in/", paramsData)
      );
      if (data?.status === 201) {
        dispatch(clearCaptureImage());
        setIsCheckIn(data?.results?.is_checkin);
        setIsCheckOut(data?.results?.is_checkout);
        setStatusMessage(data?.results?.attendance_status);
        setSignInTime(data?.results?.attendance_record?.sign_in_time);
      }
    } catch (err: any) {
      setHandleToggle({
        loading: false,
        isClick: false,
      });
      console.log("Error for Check-in Api called : ", err);
    }

    setHandleToggle({
      loading: false,
      isClick: false,
    });
  };

  // Check-out Button Handler
  const onCheckOut = async () => {
    setHandleToggle({
      loading: true,
      isClick: true,
    });
    const location: any = await getLocation();
    if (location?.isLocationMocked) {
      dispatch(
        showFeedback({
          type: "error",
          message: language?.spoofLocation,
        })
      );
      setHandleToggle({
        loading: false,
        isClick: false,
      });
      return;
    }

    const paramsData: any = {
      location: {
        latitude: JSON.stringify(location?.latitude),
        longitude: JSON.stringify(location?.longitude),
      },
      sign_out_image: captureImage?.base64,
      device_id: deviceId,
    };

    if (userRole == 5) {
      paramsData["project"] = route.params.projectId;
    }

    try {
      const { data }: any = await dispatch(
        makeAuthenticatedPatchRequest(`/attendance/check-out/`, paramsData)
      );
      if (data?.status === 200) {
        dispatch(clearCaptureImage());
        setIsCheckIn(data?.results?.is_checkin);
        setIsCheckOut(data?.results?.is_checkout);
        setStatusMessage(data?.results?.attendance_status);
        setSignInTime(data?.results?.attendance_record?.sign_in_time);
      }
    } catch (err: any) {
      setHandleToggle({
        loading: false,
        isClick: false,
      });
      console.log("Error for Check-out Api called : ", err);
    }

    setHandleToggle({
      loading: false,
      isClick: false,
    });
  };

  // Open camera
  // const onCameraPress = useCallback(async () => {
  //   let options: any = {
  //     maxWidth: 720,
  //     maxHeight: 1280,
  //     quality: 0.5,
  //     storageOptions: {
  //       path: "images",
  //       mediaType: "photo",
  //     },
  //     includeBase64: true,
  //     cameraType: "front",
  //   };
  //   try {
  //     if (Platform.OS == "ios") {
  //       ImagePicker.launchCamera(options, async (response: any) => {
  //         setImageSource(response?.assets[0]?.uri);
  //         return setImageData(response?.assets[0]);
  //       });
  //       return;
  //     }
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.CAMERA,
  //       {
  //         title: "App Camera Permission",
  //         message: "App needs access to your camera ",
  //         buttonNeutral: "Ask Me Later",
  //         buttonNegative: "Cancel",
  //         buttonPositive: "OK",
  //       }
  //     );
  //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //       ImagePicker.launchCamera(options, async (response: any) => {
  //         if (response.assets) {
  //           setImageSource(response?.assets[0]?.uri);
  //           setImageData(response?.assets[0]);
  //         } else {
  //           console.log("Camera permission denied");
  //         }
  //       });
  //     }
  //   } catch (err) {
  //     console.log("Image picker Error:", err);
  //   }
  // }, []);

  const onCameraPress = () => {
    dispatch(clearCaptureImage());
    navigation?.navigate("Camera", { mode: "front" });
  };

  useEffect(() => {
    const backAction = () => {
      dispatch(clearCaptureImage());
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, []);

  return (
    <React.Fragment>
      <AppHeader
        title={language?.attendance}
        isMenu={true}
        menuIconsName={"sync"}
        menuHandler={() => {
          LoadingOverlay.show(language?.refreshing);
          dispatch(clearCaptureImage());
          getAttendanceStatus();
        }}
        isClearImage={true}
      />
      <View style={styles.container}>
        <View style={styles.timeDateContainer}>
          {signInTime && (
            <>
              {signInTime && (
                <Text style={styles.dateText}>
                  {language.date} :{" "}
                  {convertToReadableDate(String(signInTime).substring(0, 10))}
                </Text>
              )}
              {signInTime && (
                <Text style={styles.dateText}>
                  {language.time} :{" "}
                  {convertReadableTime(String(signInTime).substring(11, 16))}
                </Text>
              )}
            </>
          )}

          <Text
            style={[
              styles.dateText,
              {
                color:
                  isCheckIn || isCheckOut ? COLORS.lightGreen : COLORS.primary,
                fontFamily: FONT.notoSansBold,
              },
            ]}
          >
            {statusMessage}
          </Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={images.location}
            resizeMode={"contain"}
            style={styles.locationPin}
          />
        </View>

        {!isCheckOut && (
          <View style={styles.checkInContainer}>
            <SubmitButton
              title={
                captureImage == null
                  ? isCheckIn
                    ? language.clickSelfieCheckOut
                    : language.clickSelfieCheckIn
                  : isCheckIn
                  ? language.checkout
                  : language.checkin
              }
              handleSubmitButton={() =>
                captureImage == null
                  ? onCameraPress()
                  : isCheckIn
                  ? onCheckOut()
                  : onCheckIn()
              }
              isLoading={handleToggle?.loading}
              isDisable={handleToggle?.isClick}
            />
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
    justifyContent: "center",
  },
  timeDateContainer: {
    alignItems: "center",
  },
  dateText: {
    color: COLORS.solidBlack,
    fontSize: 16,
    fontFamily: FONT.notoSansRegular,
  },
  imageContainer: {
    alignItems: "center",
  },
  locationPin: {
    height: screenWidth,
    width: screenWidth / 2,
  },
  checkInContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default React.memo(CheckIn);
