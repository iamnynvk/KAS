import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal, TouchableWithoutFeedback } from "react-native";
import {
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "../../Components/AppHeader";
import {
  makeAuthenticatedGetRequest,
  makeAuthenticatedPatchRequest,
} from "../../Config/Axios";
import { COLORS, FONT } from "../../Constants";
import * as ImagePicker from "react-native-image-picker";
import { Platform } from "react-native";
import { PermissionsAndroid } from "react-native";
import Icons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import PinchableBox from "../../Utils/pinchableBox";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Searchbar } from "react-native-paper";
import InputText from "../../Components/InputText";
import LoadingOverlay from "../../Utils/LoadingOverlay";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
  convertReadableTime,
  convertToReadableDate,
  convertUTCDateToLocalDates,
} from "../../Utils/Utils";
import { clearCaptureImage } from "../../Slice/ImageSlice";
import { BackHandler } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");
const today = new Date();

const TicketView = (props: any) => {
  const dispatch = useDispatch();
  const refRBSheet: any = useRef();
  const navigation: any = useNavigation();
  const { ticket, passed } = props?.route?.params;
  const { userRole } = useSelector((state: any) => state.user);
  const { language } = useSelector((state: any) => state.Preference);
  const { captureImage }: any = useSelector((state: any) => state.image);
  const [imageSources, setImageSources] = useState<any>([]);
  const [date, setDate] = useState(ticket?.estimated_completion_time);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(
    ticket?.assigned_to_user
  );
  const [isDatePickerVisible, setIsDatePickerVisibility] =
    useState<boolean>(false);
  const [userList, setUserList] = useState([]);
  const [filterUserList, setFilterUserList] = useState<any>([]);
  const [searchedUser, setSearchedUser] = useState<string>("");
  const [description, setDescription] = useState(ticket?.resolved_description);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [ticketViewDetails, setTicketViewDetails] = useState<any>(null);

  const showDatePicker = () => {
    setIsDatePickerVisibility(true);
  };

  const handleConfirm = (dates: any) => {
    const newDate: any = convertUTCDateToLocalDates(dates);
    setDate(newDate);
    setIsDatePickerVisibility(false);
  };

  useEffect(() => {
    userRole == 7 && fetchEmployeeList();
    fetchTicketViewDetails();
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

  const fetchTicketViewDetails = async () => {
    LoadingOverlay.show("Loading...");
    try {
      const { data } = await dispatch(
        makeAuthenticatedGetRequest(`/ticket/${ticket?.pk}/`)
      );
      data.status == 200 && setTicketViewDetails(data?.results);
      LoadingOverlay.hide();
    } catch (e: any) {
      console.log(e.message);
    }
  };

  const updateTicketFromSupervisor = async () => {
    LoadingOverlay.show(language?.loading);
    const params = {
      ticket: {
        assigned_to_user: selectedEmployee?.pk,
        estimated_completion_time: date,
      },
    };
    try {
      const { data } = await dispatch(
        makeAuthenticatedPatchRequest(`/ticket/update/${ticket?.pk}/`, params)
      );
      LoadingOverlay.hide();
      data?.status == 200 && navigation.pop(2);
    } catch (err) {
      LoadingOverlay.hide();
      console.log("Ticket View Update catch ----", err);
    }
  };

  const updateTicketFromEmployee = async () => {
    const base64Array = imageSources?.map((item: any) => item.base64);
    LoadingOverlay.show(language?.loading);
    const params = {
      ticket: {
        resolved_description: description,
      },
      ticket_images: base64Array,
    };
    LoadingOverlay.show(language?.loading);
    try {
      const { data } = await dispatch(
        makeAuthenticatedPatchRequest(`/ticket/update/${ticket?.pk}/`, params)
      );
      if (data?.status == 200) {
        dispatch(clearCaptureImage());
        navigation.pop(2);
        LoadingOverlay.hide();
      }
    } catch (err) {
      LoadingOverlay.hide();
      console.log("Ticket View Update catch ----", err);
    }
  };

  const removeImage = (index: number) => {
    imageSources.splice(index, 1);
    setImageSources((prevValue: any) => [...imageSources]);
  };

  const closeHandler = async () => {
    LoadingOverlay.show(language?.loading);
    try {
      const { data } = await dispatch(
        makeAuthenticatedPatchRequest(`/ticket/close/${ticket?.pk}/`)
      );
      data?.status == 200 && navigation?.pop(2);
      LoadingOverlay.hide();
    } catch (err) {
      LoadingOverlay.hide();
      console.log("Ticket View Close catch ----", err);
    }
  };

  const onCameraPress = () => {
    dispatch(clearCaptureImage());
    navigation?.navigate("Camera", { mode: "back" });
  };

  const fetchEmployeeList = async () => {
    try {
      const { data } = await dispatch(
        makeAuthenticatedGetRequest(
          `/ticket/assigned-to-user-list/?zone_id=${ticket?.zone_id}&service_id=${ticket?.service_id}`
        )
      );
      if (data?.length > 0) {
        setFilterUserList(data);
        setUserList(data);
      }
    } catch (err) {
      console.log("Error from fetching employee list APIs ----", err);
    }
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

  const setCurrentSlideAction = (value: any) => {
    setCurrentSlide(value);
  };

  const handleScrollEnd = (e: any) => {
    if (!e) {
      return;
    }
    const { nativeEvent } = e;
    if (nativeEvent && nativeEvent.contentOffset) {
      let currentSlideNew = 1;
      if (nativeEvent.contentOffset.x === 0) {
        setCurrentSlideAction(currentSlideNew);
      } else {
        const approxCurrentSlide = nativeEvent.contentOffset.x / screenWidth;
        currentSlideNew = parseInt(
          Math.ceil(approxCurrentSlide.toFixed(2)) + 1
        );
        setCurrentSlideAction(currentSlideNew);
      }
    }
  };

  const markAsUnresolved = async () => {
    LoadingOverlay.show(language?.loading);
    try {
      const { data } = await dispatch(
        makeAuthenticatedPatchRequest(`/ticket/mark-unresolved/${ticket?.pk}/`)
      );
      data?.status == 200 && navigation?.pop(2);
      LoadingOverlay.hide();
    } catch (err: any) {
      LoadingOverlay.hide();
      console.log("Error from mark as unresolved ----", err);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title={language?.ticketDetail} isClearImage={true} />
      <ScrollView style={styles.mainContainer}>
        <Text
          style={{
            textAlign: "center",
            fontSize: 18,
            paddingTop: 10,
            color: COLORS.solidBlack,
            fontFamily: FONT.notoSansBold,
          }}
        >
          {ticket?.ticket_images[currentSlide - 1]?.image_type}
        </Text>
        <ScrollView
          horizontal
          pagingEnabled
          onMomentumScrollEnd={handleScrollEnd}
          showsHorizontalScrollIndicator={false}
          style={{ width: screenWidth }}
        >
          {ticketViewDetails?.ticket_images?.map((item: any) => {
            return (
              <View style={styles.pinchableBoxStyle} key={item?.ticket_image}>
                <PinchableBox
                  isMultiple={ticketViewDetails?.ticket_images.length}
                  smallImageCStyle={styles.image}
                  imageUri={item?.ticket_image}
                />
              </View>
            );
          })}
        </ScrollView>
        {ticketViewDetails?.ticket_images.length > 1 && (
          <View style={{ marginTop: 5, alignItems: "center" }}>
            <Text
              style={[
                styles.title,
                { color: COLORS.primary, fontFamily: FONT.notoSansBold },
              ]}
            >
              {language?.swipeMore}
            </Text>
          </View>
        )}

        <View style={styles.titleContainer}>
          <Text
            style={[styles.heading, { fontSize: 18, color: COLORS.primary }]}
          >
            {language?.details}
          </Text>

          {/* Description */}
          <Text
            style={[
              styles.title,
              {
                marginTop: 10,
                color: COLORS.solidBlack,
                fontFamily: FONT.notoSansBold,
              },
            ]}
          >
            {language?.description} :{" "}
            <Text
              style={{
                color: COLORS.solidBlack,
                fontFamily: FONT.notoSansLight,
              }}
            >
              {ticket?.description}
            </Text>
          </Text>

          {/* Personal Note */}
          {ticket?.personal_note && (
            <Text
              style={[
                styles.title,
                {
                  marginTop: 10,
                  color: COLORS.solidBlack,
                  fontFamily: FONT.notoSansBold,
                },
              ]}
            >
              {language?.addPersonalNote} :{" "}
              <Text
                style={{
                  color: COLORS.solidBlack,
                  fontFamily: FONT.notoSansLight,
                }}
              >
                {ticket?.personal_note}
              </Text>
            </Text>
          )}

          {/* estimated completion time - estimatedTime */}
          {ticket?.estimated_completion_time && (
            <Text
              style={[
                styles.title,
                {
                  marginTop: 10,
                  color: COLORS.solidBlack,
                  fontFamily: FONT.notoSansBold,
                },
              ]}
            >
              {language?.estimatedTime} :{" "}
              <Text
                style={{
                  color: COLORS.solidBlack,
                  fontFamily: FONT.notoSansLight,
                }}
              >
                {convertToReadableDate(
                  String(ticket?.estimated_completion_time).substring(0, 10)
                )}
                ,{" "}
                {convertReadableTime(
                  String(ticket?.estimated_completion_time).substring(11, 16)
                )}
              </Text>
            </Text>
          )}

          <Text
            style={[
              styles.title,
              {
                marginTop: 10,
                color: COLORS.solidBlack,
                fontFamily: FONT.notoSansBold,
              },
            ]}
          >
            {language?.Assigner} :{" "}
            <Text
              style={{
                color: COLORS.solidBlack,
                fontFamily: FONT.notoSansLight,
              }}
            >
              {ticket?.assigner_type}
            </Text>
          </Text>

          {/* Assigned to user */}
          {(userRole == 7 ||
            (userRole == 10 && ticket?.assigned_to_user?.first_name)) && (
            <Text
              style={[
                styles.title,
                {
                  marginTop: 10,
                  color: COLORS.solidBlack,
                  fontFamily: FONT.notoSansBold,
                },
              ]}
            >
              {language?.assignedTo} :{" "}
              <Text
                style={{
                  color: COLORS.solidBlack,
                  fontFamily: FONT.notoSansLight,
                }}
              >
                {ticket?.assigned_to_user?.first_name
                  ? ticket?.assigned_to_user?.first_name +
                    " " +
                    ticket?.assigned_to_user?.last_name
                  : language?.notAssign}
              </Text>
            </Text>
          )}

          {/* AssignBy */}
          {userRole == 8 && (
            <Text
              style={[
                styles.title,
                {
                  marginTop: 10,
                  color: COLORS.solidBlack,
                  fontFamily: FONT.notoSansBold,
                },
              ]}
            >
              {language?.assignBy} :{" "}
              <Text
                style={{
                  color: COLORS.solidBlack,
                  fontFamily: FONT.notoSansLight,
                }}
              >
                {ticket?.assigned_by_user?.first_name +
                  " " +
                  ticket?.assigned_by_user?.last_name}
              </Text>
            </Text>
          )}

          <Text
            style={[
              styles.title,
              {
                marginTop: 10,
                color: COLORS.solidBlack,
                fontFamily: FONT.notoSansBold,
              },
            ]}
          >
            {language?.resolveTime} :{" "}
            <Text
              style={{
                color: COLORS.solidBlack,
                fontFamily: FONT.notoSansLight,
              }}
            >
              {ticket.completion_time
                ? convertToReadableDate(
                    String(ticket.completion_time).substring(0, 10)
                  ) +
                  ", " +
                  convertReadableTime(
                    String(ticket.completion_time).substring(11, 16)
                  )
                : "any"}
            </Text>
          </Text>

          {/* Resolve description */}
          {ticket?.resolved_description && (
            <Text
              style={[
                styles.title,
                {
                  marginTop: 10,
                  color: COLORS.solidBlack,
                  fontFamily: FONT.notoSansBold,
                },
              ]}
            >
              {language?.resolveDescription} :{" "}
              <Text
                style={{
                  color: COLORS.solidBlack,
                  fontFamily: FONT.notoSansLight,
                }}
              >
                {ticket?.resolved_description}
              </Text>
            </Text>
          )}

          {passed && (
            <Text
              style={[
                styles.title,
                {
                  marginTop: 10,
                  color: COLORS.solidBlack,
                  fontFamily: FONT.notoSansBold,
                },
              ]}
            >
              {language?.completionTime} :{" "}
              <Text
                style={{
                  color: COLORS.solidBlack,
                  fontFamily: FONT.notoSansLight,
                }}
              >
                {ticket.completion_time
                  ? convertToReadableDate(
                      String(ticket.completion_time).substring(0, 10)
                    ) +
                    ", " +
                    convertReadableTime(
                      String(ticket.completion_time).substring(11, 16)
                    )
                  : "any"}
              </Text>
            </Text>
          )}

          {/* Active ticket or not */}
          <Text
            style={[
              styles.title,
              {
                marginTop: 10,
                color: COLORS.solidBlack,
                fontFamily: FONT.notoSansBold,
              },
            ]}
          >
            {language?.ticketActivation} :{" "}
            <Text
              style={{
                color: COLORS.solidBlack,
                fontFamily: FONT.notoSansLight,
              }}
            >
              {ticket.is_open ? "True" : "False"}
            </Text>
          </Text>
        </View>

        {userRole == 7 && !passed && (
          <View style={{ margin: 20 }}>
            {ticket?.resolved_description == "" && (
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
                      {date
                        ? JSON.stringify(date).split("T")[0].slice(1, 11) +
                          " " +
                          JSON.stringify(date).split("T")[1].slice(0, 8)
                        : language?.selectedCompletionDate}
                    </Text>
                  </TouchableOpacity>
                </View>

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
                        : ticket?.assigned_to_user?.first_name &&
                          ticket?.assigned_to_user?.last_name
                        ? ticket?.assigned_to_user?.first_name +
                          " " +
                          ticket?.assigned_to_user?.last_name
                        : language?.selectedWhom}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[
                    styles.updateContainer,
                    { opacity: !date || !selectedEmployee ? 0.5 : 1 },
                  ]}
                  disabled={!date || !selectedEmployee}
                  onPress={updateTicketFromSupervisor}
                >
                  <Text style={styles.buttonText}>{language?.update}</Text>
                </TouchableOpacity>
              </React.Fragment>
            )}

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

            {ticket?.resolved_description && (
              <TouchableOpacity
                activeOpacity={0.9}
                style={[
                  styles.updateContainer,
                  { backgroundColor: COLORS.secondary },
                ]}
                onPress={markAsUnresolved}
              >
                <Text style={styles.buttonText}>
                  {language?.markAsUnresolved}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.updateContainer,
                { backgroundColor: COLORS.danger },
              ]}
              onPress={closeHandler}
            >
              <Text style={styles.buttonText}>{language?.close}</Text>
            </TouchableOpacity>
          </View>
        )}

        {userRole == 8 && !passed && (
          <View style={{ margin: 20 }}>
            <Text
              style={[
                styles.heading,
                { fontSize: 18, color: COLORS.solidBlack },
              ]}
            >
              {language?.resolveTicket}
            </Text>

            <InputText
              placeHolderText={language?.resolveDescription}
              values={description}
              isAutoFocus={false}
              isMultiLine={true}
              textContainer={{
                alignSelf: "center",
                marginTop: 10,
              }}
              onChange={(text: any) => setDescription(text)}
            />

            <View style={styles.buttonStyle}>
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
                      <Icons name="camera" size={20} color={COLORS.white} />
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
                      <MaterialIcons name="center-focus-weak" size={30} />
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
                          imageUri={item.uri}
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

            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.updateContainer,
                {
                  opacity: !imageSources || !description ? 0.5 : 1,
                  marginTop: 0,
                },
              ]}
              disabled={!imageSources || !description}
              onPress={updateTicketFromEmployee}
            >
              <Text style={styles.buttonText}>{language?.update}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {!passed && (
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          locale="en_GB"
          minimumDate={today}
          date={date == ticket.estimated_completion_time ? today : date}
          onConfirm={(data) => handleConfirm(data)}
          onCancel={() => setIsDatePickerVisibility(false)}
        />
      )}
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
  image: {
    height: screenHeight / 3,
    width: "85%",
  },
  titleContainer: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  heading: {
    fontFamily: FONT.notoSansBold,
    textAlign: "justify",
  },
  title: {
    fontSize: 14,
    color: COLORS.solidBlack,
    fontFamily: FONT.notoSansMedium,
  },
  updateContainer: {
    marginTop: 20,
    backgroundColor: COLORS.lightGreen,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    borderRadius: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: FONT.notoSansMedium,
  },
  buttonStyle: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 20,
  },
  bottomSheetContainer: {
    flex: 1,
    flexDirection: "column",
  },
  question: {
    color: COLORS.solidBlack,
    fontSize: 16,
    fontFamily: FONT.notoSansBold,
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
  showImage: {
    borderRadius: 5,
    marginLeft: 15,
  },
  pinchableBoxStyle: {
    width: screenWidth,
    alignItems: "center",
    marginTop: 15,
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

export default TicketView;
