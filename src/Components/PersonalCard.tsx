import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Divider } from "react-native-paper";
import { COLORS, FONT } from "../Constants";
import CircularProgress from "./CircularProgress";

const { width: screenWidth } = Dimensions.get("screen");

const PersonalCard = ({
  details,
  passingDate,
  isOverView = false,
  isManager = false,  
  isSuperV = false,
  clickHandlerOnCard,
}: any) => {
  console.log('PERSONAL CARD',);
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.cardContainer}
      onPress={() =>
        clickHandlerOnCard(
          details,
          passingDate,
          isOverView,
          isManager,
          isSuperV
        )
      }
    >
      <View style={styles.cardTopContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.placeText}>Zone : {details.zone_code}</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={styles.zoneText}>
              Service : {details?.service?.name}
            </Text>
          </View>
        </View>
      </View>
      <Divider />
      <View style={styles.cardBottomContainer}>
        <View
          style={{
            marginStart: 30,
            marginEnd: 10,
            justifyContent: "center",
            alignItems: "flex-end",
          }}
        >
          <CircularProgress
            percentage={
              (details?.total_scan / details?.minimum_scan) * 100 > 100
                ? 100
                : (details?.total_scan / details?.minimum_scan) * 100
            }
            radius={14}
            strokeWidth={4}
            color={COLORS.primary}
          />
        </View>
        <View
          style={{
            flex: 1.5,
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <Text style={styles.zoneText}>{`${
            (details?.total_scan / details?.minimum_scan) * 100 > 100
              ? `100`
              : ((details?.total_scan / details?.minimum_scan) * 100).toFixed(2)
          }% complete`}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 150,
    width: "90%",
    marginVertical: 10,
    borderRadius: 30,
    alignSelf: "center",
    backgroundColor: COLORS.lightWhite,
  },
  cardTopContainer: {
    flex: 3,
    justifyContent: "center",
    flexDirection: "row",
  },
  cardBottomContainer: {
    flex: 1,
    flexDirection: "row",
  },
  cardImage: {
    height: screenWidth / 4,
    width: screenWidth / 4,
    borderRadius: 15,
  },
  imageContainer: {
    flex: 0.9,
    justifyContent: "center",
    alignItems: "center",
  },
  labelContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    marginHorizontal: 20,
  },
  placeText: {
    fontSize: 20,
    fontFamily: FONT.notoSansMedium,
    color: COLORS.secondary,
  },
  zoneText: {
    color: COLORS.secondary,
    fontFamily: FONT.notoSansLight,
    fontSize: 14,
  },
  dot: {
    borderRadius: 50,
    width: 5,
    height: 5,
    marginHorizontal: 5,
    backgroundColor: COLORS.solidBlack,
    alignSelf: "center",
  },
});

export default React.memo(PersonalCard);
