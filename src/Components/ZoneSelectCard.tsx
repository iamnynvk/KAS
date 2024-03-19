import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { COLORS, FONT } from "../Constants";
import { convertReadableTime, convertToReadableDate } from "../Utils/Utils";

const { width: screenWidth } = Dimensions.get("screen");

const ZoneSelectCard = ({ zoneDatas, getSelectProperty }: any) => {
  const { language } = useSelector((state: any) => state.Preference);

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.container]}
      onPress={() => getSelectProperty(zoneDatas)}
    >
      <View style={styles.headingContainer}>
        <Text style={styles.zoneText} numberOfLines={1} ellipsizeMode={"tail"}>
          {language?.zoneCode} : {zoneDatas?.zone_code}{" "}
        </Text>
      </View>
      {zoneDatas?.zone_description && (
        <View style={styles.zoneContainer}>
          <Text
            style={styles.zoneCode}
            numberOfLines={1}
            ellipsizeMode={"tail"}
          >
            {language?.zoneDescription} : {zoneDatas?.zone_description}
          </Text>
        </View>
      )}
      <View style={styles.zoneContainer}>
        <Text style={styles.zoneCode} numberOfLines={1} ellipsizeMode={"tail"}>
          {language?.serviceName} : {zoneDatas?.service_name}
        </Text>
      </View>
      <View style={styles.zoneContainer}>
        <Text style={styles.zoneCode} numberOfLines={1} ellipsizeMode={"tail"}>
          {language?.user} :{" "}
          {zoneDatas?.user_first_name + " " + zoneDatas?.user_last_name}
        </Text>
      </View>
      <View style={styles.zoneContainer}>
        {zoneDatas?.created && (
          <Text
            style={styles.zoneCode}
            numberOfLines={1}
            ellipsizeMode={"tail"}
          >
            {language?.created} :{" "}
            {convertToReadableDate(String(zoneDatas?.created).substring(0, 10))}
            ,{" "}
            {convertReadableTime(String(zoneDatas?.created).substring(11, 16))}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
    paddingVertical: 15,
    width: "90%",
    borderRadius: 15,
    backgroundColor: COLORS.secondary,
    alignSelf: "center",
    justifyContent: "center",
  },
  headingContainer: {
    marginHorizontal: 10,
  },
  zoneText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONT.notoSansMedium,
  },
  zoneContainer: {
    flexDirection: "row",
    marginHorizontal: 10,
  },
  zoneCode: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONT.notoSansMedium,
  },
});

export default React.memo(ZoneSelectCard);
