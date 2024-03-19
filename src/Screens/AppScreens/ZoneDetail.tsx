import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView } from "react-native";
import { StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "../../Components/AppHeader";
import { makeAuthenticatedGetRequest } from "../../Config/Axios";
import { COLORS, FONT } from "../../Constants";
import LoadingOverlay from "../../Utils/LoadingOverlay";
import PinchableBox from "../../Utils/pinchableBox";

const { height: screenHeight, width: screenWidth } = Dimensions.get("screen");

const ZoneDetail = (props: any) => {
  const { selectZone } = props?.route?.params;
  const dispatch = useDispatch();
  const [scanDetailData, setScanDetailData] = useState<any>();
  const { language } = useSelector((state: any) => state.Preference);

  const getScanDetail = async () => {
    LoadingOverlay.show(language?.loading);
    try {
      const { data }: any = await dispatch(
        makeAuthenticatedGetRequest(`/mobile/scandetail/${selectZone?.pk}/`)
      );
      setScanDetailData(data?.results);
      LoadingOverlay.hide();
    } catch (err) {
      LoadingOverlay.hide();
      console.log("Catch error from ZoneDetail --->", err);
    }
  };

  useEffect(() => {
    getScanDetail();
  }, []);

  const handleScrollEnd = (e: any) => {
    if (!e) {
      return;
    }
    const { nativeEvent } = e;
    if (nativeEvent && nativeEvent.contentOffset) {
      let currentSlideNew = 1;
      if (nativeEvent.contentOffset.x === 0) {
        // setCurrentSlideAction(currentSlideNew);
      } else {
        const approxCurrentSlide = nativeEvent.contentOffset.x / screenWidth;
        currentSlideNew = parseInt(
          Math.ceil(approxCurrentSlide.toFixed(2)) + 1
        );
        // setCurrentSlideAction(currentSlideNew);
      }
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title={language?.scanDetail} />
      <ScrollView style={styles.mainContainer}>
        <View style={styles.imageContainer}>
          <Text style={[styles.text, { marginHorizontal: 20 }]}>
            {language?.scanImage}
          </Text>

          <ScrollView
            horizontal
            pagingEnabled
            // onMomentumScrollEnd={handleScrollEnd}
            showsHorizontalScrollIndicator={false}
            style={{ width: screenWidth }}
          >
            {scanDetailData?.scan_images?.map((item: any) => {
              return (
                <View style={styles.pinchableBoxStyle}>
                  <PinchableBox
                    isMultiple={scanDetailData?.scan_images.length}
                    smallImageCStyle={styles.image}
                    imageUri={item?.scan_image}
                  />
                </View>
              );
            })}
          </ScrollView>
          {scanDetailData?.scan_images.length > 1 && (
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
        </View>
        <View style={styles.questionContainer}>
          <Text style={styles.text}>{language?.questionList}</Text>
          {scanDetailData?.scan_items?.map((question: any) => {
            return (
              <View>
                <Text
                  style={[
                    styles.questionText,
                    {
                      marginTop: 10,
                      color: COLORS.solidBlack,
                      fontFamily: FONT.notoSansBold,
                    },
                  ]}
                >{`${scanDetailData?.scan_items.indexOf(question) + 1}) ${
                  question?.project_zone_checklist_item?.checklist_item
                    ?.description
                }`}</Text>
                <View
                  style={[
                    styles.answerContainer,
                    {
                      color: COLORS.solidBlack,
                      fontFamily: FONT.notoSansLight,
                    },
                  ]}
                >
                  <Text style={styles.questionText}>{language?.answer} : </Text>
                  <Text
                    style={[
                      styles.questionText,
                      {
                        color: COLORS.solidBlack,
                        fontFamily: FONT.notoSansLight,
                      },
                    ]}
                  >
                    {question?.free_response
                      ? question?.free_response
                      : question?.boolean_response
                      ? "Yes"
                      : "No"}
                  </Text>
                </View>
                {question?.comment && (
                  <View style={styles.answerContainer}>
                    <Text style={styles.questionText}>
                      {language?.comment} :{" "}
                    </Text>
                    <Text
                      style={[
                        styles.questionText,
                        {
                          color: COLORS.solidBlack,
                          fontFamily: FONT.notoSansLight,
                          width: "80%",
                        },
                      ]}
                    >
                      {question?.comment}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default ZoneDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  mainContainer: {
    flex: 1,
  },
  imageContainer: {
    marginTop: 20,
    // marginHorizontal: 20,
  },
  text: {
    fontSize: 16,
    fontFamily: FONT.notoSansBold,
    color: COLORS.primary,
    marginBottom: 5,
  },
  questionContainer: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  questionText: {
    fontSize: 14,
    color: COLORS.solidBlack,
    fontFamily: FONT.notoSansMedium,
  },
  answerContainer: {
    flexDirection: "row",
  },
  image: {
    height: screenHeight / 3,
    width: "80%",
  },
  pinchableBoxStyle: {
    width: screenWidth,
    zIndex: 1000,
    alignItems: "center",
    marginTop: 10,
  },
  title: {
    fontSize: 14,
    color: COLORS.solidBlack,
    fontFamily: FONT.notoSansMedium,
  },
});
