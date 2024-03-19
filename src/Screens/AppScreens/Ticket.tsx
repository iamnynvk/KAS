import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Keyboard,
  Alert,
  Platform,
  PermissionsAndroid,
  TouchableWithoutFeedback,
  TextInput,
  Modal,
} from "react-native";
import Icons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, FONT } from "../../Constants";
import { Formik } from "formik";
import { object, string } from "yup";
import {
  makeAuthenticatedGetRequest,
  makeAuthenticatedPostRequest,
} from "../../Config/Axios";
import { Searchbar } from "react-native-paper";
import { convertUTCDateToLocalDates } from "../../Utils/Utils";
import { useNavigation } from "@react-navigation/native";
import PinchableBox from "../../Utils/pinchableBox";
import AppHeader from "../../Components/AppHeader";
import * as ImagePicker from "react-native-image-picker";
import SubmitButton from "../../Components/SubmitButton";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Feather from "react-native-vector-icons/Feather";
import moment from "moment";
import LoadingOverlay from "../../Utils/LoadingOverlay";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { clearCaptureImage } from "../../Slice/ImageSlice";
import { BackHandler } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";

const { width: screenWidth } = Dimensions.get("screen");

const Ticket = ({ route }: any) => {
  const refRBSheet: any = useRef();
  const projectZoneId =
    (route?.params?.selectedService &&
      route?.params?.selectedService[0]?.project_zone) ||
    -1;
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const { scanData } = useSelector((state: any) => state.scan);
  const { userRole } = useSelector((state: any) => state.user);
  const { language } = useSelector((state: any) => state.Preference);
  const { captureImage }: any = useSelector((state: any) => state.image);
  const [imageSources, setImageSources] = useState<any>([]);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [searchedUser, setSearchedUser] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [userList, setUserList] = useState<any>([]);
  const [filterUserList, setFilterUserList] = useState<any>([]);
  const [dates, setDates] = useState();
  const [isDatePickerVisible, setIsDatePickerVisibility] =
    useState<boolean>(false);

  let ticketValidation = object({
    ticket: string().required(language?.fieldIsRequired),
  });

  useEffect(() => {
    userRole == 7 && fetchEmployeeList();
  }, []);

  useEffect(() => {
    captureImage && setImageSources((prev: any) => [...prev, captureImage]);
  }, [captureImage]);

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

  const onCameraPress = () => {
    dispatch(clearCaptureImage());
    navigation?.navigate("Camera", { mode: "back" });
  };

  const submitTicket = async (values: any) => {
    const base64Array = imageSources?.map((item: any) => item?.base64);
    LoadingOverlay.show(language?.loading);
    const now = moment();
    const params = {
      ticket: {
        project_zone: projectZoneId,
        assigned_to_user: selectedEmployee?.pk,
        estimated_completion_time: dates ? dates : now,
        description: values.ticket,
        personal_note: comment,
      },
      ticket_images: base64Array,
    };

    const userParams = {
      ticket: {
        project_zone: projectZoneId,
        description: values.ticket,
        personal_note: comment,
      },
      ticket_images: base64Array,
    };

    try {
      const { data } = await dispatch(
        makeAuthenticatedPostRequest(
          `/ticket/`,
          userRole === 7 ? params : userParams
        )
      );
      LoadingOverlay.hide();
      if (data?.status === 201) {
        dispatch(clearCaptureImage());
        Alert.alert("Submitted", "Ticket has been created successfully.", [
          { text: "OK", onPress: () => navigation.pop(3) },
        ]);
      }
    } catch (err) {
      LoadingOverlay.hide();
      console.log(
        "Erorr from created ticket APIs calling in ticket screen -----",
        err
      );
    }
  };

  const fetchEmployeeList = async () => {
    try {
      const { data } = await dispatch(
        makeAuthenticatedGetRequest(
          `/ticket/assigned-to-user-list/?zone_id=${scanData}&service_id=${route?.params?.serviceId}`
        )
      );

      if (data?.length > 0) {
        setFilterUserList(data);
        setUserList(data);
      }
    } catch (err) {
      console.log("Error from fetch employee list in Ticket Screen -----", err);
    }
  };

  const removeImage = (index: number) => {
    imageSources.splice(index, 1);
    setImageSources((prevValue: any) => [...imageSources]);
  };

  const showDatePicker = () => {
    setIsDatePickerVisibility(true);
  };

  const handleConfirm = (date: any) => {
    const newDate: any = convertUTCDateToLocalDates(date);
    setDates(newDate);
    setIsDatePickerVisibility(false);
  };

  const searchingUser = useCallback(
    (text: string) => {
      setSearchedUser(text);
      if (text == "") {
        return setUserList(filterUserList);
      }
      return setUserList(
        filterUserList.filter((u: any) => {
          if (
            u.first_name.toLowerCase().includes(text.toLowerCase()) ||
            u.last_name.toLowerCase().includes(text.toLowerCase()) ||
            (
              u.first_name.toLowerCase() +
              " " +
              u.last_name.toLowerCase().includes(text.toLowerCase())
            ).includes(text.toLowerCase())
          ) {
            return u;
          }
        })
      );
    },
    [searchedUser]
  );

  return (
    <View style={styles.container}>
      <AppHeader title={language?.ticket} isClearImage={true} />
      <ScrollView style={styles.mainContainer}>
        <View style={styles.tickerContainer}>
          <Formik
            initialValues={{ ticket: "" }}
            validateOnMount={true}
            validationSchema={ticketValidation}
            onSubmit={(values) => submitTicket(values)}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              isValid,
              touched,
              errors,
            }) => (
              <TouchableWithoutFeedback
                onPress={Keyboard.dismiss}
                accessible={false}
              >
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.complaintText}>
                    {language?.complaint}
                  </Text>
                  <TextInput
                    multiline={true}
                    numberOfLines={5}
                    style={styles.commentText}
                    placeholder={language?.complaintHint}
                    placeholderTextColor={COLORS.gray}
                    value={values?.ticket}
                    onChangeText={handleChange("ticket")}
                    onBlur={() => handleBlur("ticket")}
                    scrollEnabled={true}
                  />

                  {touched.ticket && errors.ticket && (
                    <View style={styles.errorContainer}>
                      <Feather
                        name="alert-triangle"
                        size={16}
                        color={COLORS.primary}
                        style={styles.errorImage}
                      />
                      <Text style={styles.errorText}>{errors.ticket}</Text>
                    </View>
                  )}

                  <View
                    style={{
                      width: "30%",
                      marginTop: 10,
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={{
                        flexDirection: "row",
                        padding: 3,
                      }}
                      onPress={() => {
                        setIsVisible(true);
                      }}
                    >
                      <Icons
                        name={isVisible ? "caret-down" : "caret-forward"}
                        size={16}
                        color={COLORS.primary}
                        style={{
                          alignSelf: "center",
                        }}
                      />
                      <Text
                        style={{
                          color: COLORS.primary,
                          fontFamily: FONT.montserratBold,
                          fontSize: 13,
                        }}
                      >
                        {language?.addPersonalNote}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {userRole == 7 && (
                    <React.Fragment>
                      <View
                        style={{
                          borderWidth: 0.5,
                          borderRadius: 5,
                          marginTop: 20,
                          borderColor: COLORS.lightDark,
                        }}
                      >
                        <TouchableOpacity
                          activeOpacity={0.7}
                          style={{ padding: 10 }}
                          onPress={showDatePicker}
                        >
                          <Text
                            style={{
                              textAlign: "center",
                              color: COLORS.primary,
                              fontFamily: FONT.montserratBold,
                            }}
                          >
                            {dates
                              ? JSON.stringify(dates)
                                  .split("T")[0]
                                  .slice(1, 11) +
                                " " +
                                JSON.stringify(dates).split("T")[1].slice(0, 8)
                              : language?.selectedCompletionDate}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {/* // USER MODAL */}
                      <RBSheet
                        ref={refRBSheet}
                        openDuration={250}
                        closeOnDragDown={true}
                        customStyles={{
                          container: {
                            paddingHorizontal: 20,
                            borderTopEndRadius: 10,
                            borderTopStartRadius: 10,
                            height: "70%",
                          },
                        }}
                        dragFromTopOnly={true}
                        closeOnPressBack={true}
                      >
                        <View style={styles.bottomSheetContainer}>
                          <View style={{ marginBottom: 5 }} />
                          <Searchbar
                            placeholder={language?.searchEmployee}
                            onChangeText={(v) => searchingUser(v)}
                            placeholderTextColor={COLORS.solidBlack}
                            iconColor={COLORS.solidBlack}
                            value={searchedUser}
                            style={{
                              backgroundColor: COLORS.gray,
                              marginBottom: 10,
                            }}
                          />
                          <ScrollView
                            style={{
                              flex: 1,
                            }}
                            showsVerticalScrollIndicator={false}
                          >
                            {userList.length > 0 ? (
                              userList.map((user: any) => {
                                return (
                                  <TouchableOpacity
                                    onPress={() => {
                                      setSelectedEmployee(user);
                                      refRBSheet?.current?.close();
                                    }}
                                    style={{
                                      alignItems: "center",
                                      borderWidth: 0.3,
                                      padding: 10,
                                      marginVertical: 5,
                                      borderRadius: 3,
                                    }}
                                  >
                                    <Text>
                                      {user.first_name} {user.last_name}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })
                            ) : (
                              <View
                                style={{
                                  flex: 1,
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Text>{language?.noUser}</Text>
                              </View>
                            )}
                          </ScrollView>
                        </View>
                      </RBSheet>

                      <View
                        style={{
                          borderWidth: 0.5,
                          borderRadius: 5,
                          marginTop: 20,
                          borderColor: COLORS.lightDark,
                        }}
                      >
                        <TouchableOpacity
                          style={{ padding: 10 }}
                          onPress={() => refRBSheet?.current?.open()}
                        >
                          <Text
                            style={{
                              textAlign: "center",
                              color: COLORS.primary,
                              fontFamily: FONT.montserratBold,
                            }}
                          >
                            {selectedEmployee
                              ? selectedEmployee.first_name +
                                " " +
                                selectedEmployee.last_name
                              : language?.selectedWhom}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </React.Fragment>
                  )}

                  {/* COMMENT MODAL */}
                  <View style={{ marginTop: 15 }}>
                    <Modal
                      transparent={true}
                      visible={isVisible}
                      onRequestClose={() => setIsVisible(!isVisible)}
                    >
                      <TouchableWithoutFeedback
                        onPress={() => setIsVisible(!isVisible)}
                      >
                        <View style={styles.bottomSheetContainer}>
                          <View style={styles.bottomSheet}>
                            <View style={styles.topLineStyle} />
                            <View
                              style={{
                                alignItems: "center",
                                marginTop: 30,
                              }}
                            >
                              <TextInput
                                multiline={true}
                                numberOfLines={10}
                                style={[
                                  styles.commentText,
                                  { height: screenWidth / 2, width: "85%" },
                                ]}
                                placeholder={language?.commentHint}
                                placeholderTextColor={COLORS.gray}
                                value={comment}
                                onChangeText={(comments) =>
                                  setComment(comments)
                                }
                              />
                            </View>

                            <View style={styles.submitComment}>
                              <SubmitButton
                                title={language?.done}
                                handleSubmitButton={() =>
                                  setIsVisible(!isVisible)
                                }
                              />
                            </View>
                          </View>
                        </View>
                      </TouchableWithoutFeedback>
                    </Modal>
                  </View>

                  <View style={styles.buttonStyle}>
                    <View>
                      {!(imageSources.length > 0) && (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          style={{
                            height: screenWidth / 8,
                            width: screenWidth / 1.2,
                            borderRadius: 10,
                            marginTop: 20,
                            backgroundColor: COLORS.gray,
                            marginBottom: 50,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onPress={onCameraPress}
                        >
                          <View
                            style={{
                              height: "100%",
                              alignItems: "center",
                              justifyContent: "center",
                              flexDirection: "row",
                            }}
                          >
                            <View
                              style={{
                                alignItems: "center",
                                marginEnd: 10,
                                padding: 5,
                                borderRadius: 30,
                                backgroundColor: COLORS.primary,
                              }}
                            >
                              <Icons
                                name="camera"
                                size={20}
                                color={COLORS.white}
                              />
                            </View>
                            <View>
                              <Text
                                style={[
                                  styles.question,
                                  { fontFamily: FONT.notoSansBold },
                                ]}
                              >
                                {language.captureImage}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}

                      {imageSources.length > 0 && (
                        <View style={{ width: screenWidth / 1.2 }}>
                          <ScrollView
                            showsHorizontalScrollIndicator={false}
                            horizontal
                            contentContainerStyle={{ paddingVertical: 20 }}
                          >
                            <TouchableOpacity
                              onPress={onCameraPress}
                              activeOpacity={0.7}
                              style={styles.cameraButton}
                            >
                              <MaterialIcons
                                name="center-focus-weak"
                                size={30}
                              />
                            </TouchableOpacity>
                            {imageSources?.map((item: any, index: any) => (
                              <View
                                style={[
                                  styles.showImage,
                                  { borderRadius: 5, overflow: "hidden" },
                                ]}
                              >
                                <PinchableBox
                                  smallImageCStyle={{ height: 80, width: 80 }}
                                  imageUri={item?.uri}
                                  isBase={true}
                                />
                                <TouchableOpacity
                                  activeOpacity={0.7}
                                  style={styles.removeImage}
                                  onPress={() => removeImage(index)}
                                >
                                  <Icons
                                    name="close-circle"
                                    color={COLORS.white}
                                    size={18}
                                  />
                                </TouchableOpacity>
                              </View>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                    <SubmitButton
                      title={language.submit}
                      isDisable={
                        !isValid ||
                        !imageSources.length > 0 ||
                        (userRole == 7 && (!selectedEmployee?.pk || !dates))
                      }
                      handleSubmitButton={handleSubmit}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            )}
          </Formik>
        </View>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          is24Hour={false}
          locale="en_GB"
          minimumDate={new Date()}
          date={dates}
          onConfirm={(data) => handleConfirm(data)}
          onCancel={() => setIsDatePickerVisibility(false)}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  mainContainer: {
    flex: 1,
  },
  tickerContainer: {
    alignItems: "center",
  },
  question: {
    color: COLORS.solidBlack,
    fontSize: 16,
    fontFamily: FONT.notoSansBold,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.primary,
    alignItems: "center",
    marginStart: 2,
    fontFamily: FONT.notoSansMedium,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  errorImage: {
    marginTop: 2,
  },
  commentText: {
    borderWidth: 0.5,
    borderColor: COLORS.lightDark,
    color: COLORS.secondary,
    fontFamily: FONT.notoSansMedium,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: screenWidth / 5,
    textAlignVertical: "top",
  },
  showImage: {
    borderRadius: 5,
    marginLeft: 15,
  },
  removeImage: {
    position: "absolute",
    width: 20,
    height: 20,
    right: 2,
    top: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonStyle: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 20,
  },
  complaintText: {
    color: COLORS.primary,
    fontFamily: FONT.notoSansBold,
    fontSize: 16,
    marginBottom: 5,
  },
  bottomSheetContainer: {
    flex: 1,
    flexDirection: "column",
  },
  bottomSheet: {
    width: "100%",
    height: "70%",
    bottom: 0,
    position: "absolute",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.solidBlack,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
  },
  topLineStyle: {
    height: 6,
    width: 50,
    alignSelf: "center",
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: COLORS.gray,
  },
  submitComment: {
    alignItems: "center",
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
  },
  cameraButton: {
    backgroundColor: COLORS.grayWhite,
    justifyContent: "center",
    alignItems: "center",
    height: 80,
    width: 80,
    borderRadius: 5,
  },
});

export default Ticket;
