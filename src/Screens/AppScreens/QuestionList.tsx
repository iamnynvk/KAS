import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  BackHandler,
} from "react-native";
import { COLORS, FONT } from "../../Constants";
import AppHeader from "../../Components/AppHeader";
import InputText from "../../Components/InputText";
import SubmitButton from "../../Components/SubmitButton";
import { RadioButton } from "react-native-paper";
import * as ImagePicker from "react-native-image-picker";
import LoadingOverlay from "../../Utils/LoadingOverlay";
import Icons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { makeAuthenticatedPostRequest } from "../../Config/Axios";
import { showFeedback } from "../../Slice/feedbackSlice";
import PinchableBox from "../../Utils/pinchableBox";
import EmptyComponent from "../../Components/EmptyComponent";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { clearCaptureImage } from "../../Slice/ImageSlice";
import { useNavigation } from "@react-navigation/core";

const { width: screenWidth } = Dimensions.get("screen");

const QuestionList = (props: any) => {
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const { language } = useSelector((state: any) => state.Preference);
  const { captureImage }: any = useSelector((state: any) => state.image);
  const { selectedService } = props?.route?.params;
  const [questionAns, setQuestionAns] = useState<any>({});
  const [openCommentID, setOpenCommentID] = useState<any>();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [imageSources, setImageSources] = useState<any>([]);

  const handleChange = (value: any, primaryKey: any, typeOfAnswer: string) => {
    setQuestionAns({
      ...questionAns,
      [`pk_${primaryKey}`]: {
        ...questionAns[`pk_${primaryKey}`],
        [typeOfAnswer]: value,
      },
    });
  };

  const removeImage = (index: number) => {
    imageSources.splice(index, 1);
    setImageSources((prevValue: any) => [...imageSources]);
  };

  const renderEmpty = () => <EmptyComponent loading={false} />;

  useEffect(() => {
    captureImage && setImageSources((prev: any) => [...prev, captureImage])

  }, [captureImage]);

  useEffect(() => {
    const backAction = () => {
      dispatch(clearCaptureImage());
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, []);

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
  //     cameraType: "back",
  //   };
  //   try {
  //     if (Platform.OS == "ios") {
  //       ImagePicker.launchCamera(options, async (response: any) => {
  //         setImageSources((prev: any) => [...prev, response?.assets[0]]);
  //         return;
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
  //           setImageSources((prev: any) => [...prev, response?.assets[0]]);
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
    navigation?.navigate("Camera", { mode: 'back' });
  }

  const handleSubmit = async () => {
    const base64Array = imageSources?.map((item: any) => item.base64);
    let isFilled = true;
    let warningMessage;

    const scan_item = Object.entries(questionAns).map((ele: any) => {
      return { ...ele[1], project_zone_checklist_item: ele[0]?.split("_")[1] };
    });
    const isAllValid = scan_item
      ?.map((ele: any) => {
        return ele.answer !== undefined && ele?.answer?.length !== 0;
      })
      .filter((item) => item && item !== undefined);

    if (!isAllValid.length || isAllValid.length !== selectedService?.length) {
      isFilled = false;
      warningMessage = language.questionListWarning;
    } else if (imageSources.length == 0) {
      isFilled = false;
      warningMessage = language.takePictureWarning;
    } else {
      LoadingOverlay.show(language?.loading);
      const params = {
        scan: {
          project_zone: selectedService[0]?.project_zone,
        },
        scan_item,
        scan_images: base64Array,
      };
      try {
        const { data }: any = await dispatch(
          makeAuthenticatedPostRequest(
            "/scan/scan-post-store-response/",
            params
          )
        );
        if (data?.status === 201) {
          LoadingOverlay.hide();
          dispatch(clearCaptureImage());
          props?.navigation.reset({
            index: 0,
            routes: [{ name: "Main" }],
          });
        }
      } catch (error) {
        LoadingOverlay.hide();
        console.log("Error from user question answer ---->", error);
      }
      LoadingOverlay.hide();
    }

    if (!isFilled) {
      dispatch(
        showFeedback({
          type: "error",
          message: warningMessage,
        })
      );
      return;
    }
  };

  const renderQuestionList = ({ item }: any) => {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.question}>{`${selectedService.indexOf(item) + 1}) ${item?.checklist_item?.description
          }`}</Text>
        {item?.checklist_item?.question_type === "BOOLEAN-RESPONSE" ? (
          <View style={styles.buttonGroup}>
            <RadioButton.Group
              onValueChange={(value) => {
                handleChange(
                  value === "true" ? true : false,
                  item?.pk,
                  "answer"
                );
              }}
              value={String(questionAns?.[`pk_${item?.pk}`]?.answer)}
            >
              <View style={styles.buttonGroupContainer}>
                <RadioButton
                  value="true"
                  uncheckedColor={COLORS.secondary}
                  color={COLORS.primary}
                />
                <Text style={styles.booleanText}>Yes</Text>

                <View style={styles.falseContainer}>
                  <RadioButton
                    value="false"
                    uncheckedColor={COLORS.secondary}
                    color={COLORS.primary}
                  />
                  <Text style={styles.booleanText}>No</Text>
                </View>
              </View>
            </RadioButton.Group>
          </View>
        ) : (
          <InputText
            textContainer={styles.textInput}
            placeHolderText={language?.answerHint}
            values={questionAns?.[`pk_${item?.pk}`]?.answer || ""}
            onChange={(text: any) => {
              handleChange(text, item.pk, "answer");
            }}
          />
        )}

        <View style={{ width: "40%", marginTop: 5 }}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              padding: 2,
            }}
            onPress={() => {
              setOpenCommentID(item?.pk);
              setIsVisible(true);
            }}
          >
            <Icons
              name={
                item.pk == openCommentID && isVisible
                  ? "caret-down"
                  : "caret-forward"
              }
              size={16}
              color={COLORS.primary}
              style={{
                alignSelf: "center",
              }}
            />
            <Text style={styles.comment}>
              {questionAns?.[`pk_${item?.pk}`]?.comment
                ? language?.editComment
                : language?.addComment}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Comment section */}
        <View style={{ marginTop: 15 }}>
          {item?.pk == openCommentID && (
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
                        style={styles.commentText}
                        placeholder={language?.commentHint}
                        placeholderTextColor={COLORS.gray}
                        value={questionAns?.[`pk_${item?.pk}`]?.comment || ""}
                        onChangeText={(comments) =>
                          handleChange(comments, item?.pk, "comment")
                        }
                      />
                    </View>

                    <View style={styles.submitComment}>
                      <SubmitButton
                        title={language?.done}
                        handleSubmitButton={() => setIsVisible(!isVisible)}
                      />
                    </View>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          )}
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    return (
      <View style={styles.buttonStyle}>
        {!(imageSources.length > 0) && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.imageSourceContainer}
            onPress={onCameraPress}
          >
            <View style={styles.imageViewContainer}>
              <View style={styles.cameraPickContainer}>
                <Icons name="camera" size={20} color={COLORS.white} />
              </View>
              <View>
                <Text
                  style={[styles.question, { fontFamily: FONT.notoSansBold }]}
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
                    imageUri={item?.uri}
                    isBase={true}
                  />
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.removeImage}
                    onPress={() => removeImage(index)}
                  >
                    <Icons name="close-circle" color={COLORS.white} size={18} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <SubmitButton
          title={language.submit}
          handleSubmitButton={handleSubmit}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title={language?.questionList} isClearImage={true} />
      <FlatList
        data={selectedService}
        removeClippedSubviews={false}
        renderItem={renderQuestionList}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: "center",
  },
  fieldContainer: {
    padding: 10,
  },
  question: {
    color: COLORS.solidBlack,
    fontSize: 16,
    fontFamily: FONT.notoSansBold,
  },
  textInput: {
    marginTop: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    marginTop: 10,
  },
  buttonStyle: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 20,
  },
  buttonGroupContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  falseContainer: {
    marginStart: 40,
    flexDirection: "row",
    alignItems: "center",
  },
  booleanText: {
    fontSize: 14,
    color: COLORS.solidBlack,
    fontFamily: FONT.montserratMedium,
  },
  commentText: {
    borderWidth: 0.5,
    borderColor: COLORS.lightDark,
    color: COLORS.secondary,
    fontFamily: FONT.notoSansMedium,
    borderRadius: 10,
    paddingHorizontal: 12,
    width: screenWidth / 1.2,
    height: screenWidth / 2,
    textAlignVertical: "top",
  },
  bottomSheetContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSheet: {
    width: "100%",
    height: "60%",
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
    marginTop: screenWidth / 3,
  },
  comment: {
    color: COLORS.primary,
    fontFamily: FONT.notoSansBold,
    fontSize: 13,
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
  cameraButton: {
    backgroundColor: COLORS.grayWhite,
    justifyContent: "center",
    alignItems: "center",
    height: 80,
    width: 80,
    borderRadius: 5,
  },
  imageSourceContainer: {
    height: screenWidth / 8,
    width: screenWidth / 1.2,
    borderRadius: 10,
    marginTop: 20,
    backgroundColor: COLORS.gray,
    marginBottom: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  imageViewContainer: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  cameraPickContainer: {
    alignItems: "center",
    marginEnd: 10,
    padding: 5,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
  },
});

export default QuestionList;
