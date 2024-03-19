import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { COLORS, FONT } from "../Constants";

const ProfileCard = ({ data, keys }: any) => {
  return (
    <View style={styles.container} key={keys}>
      <Feather
        name={data.icon}
        size={40}
        style={{ padding: 5, color: COLORS.lightDark }}
      />
      <View style={styles.verticalLine} />
      <View style={styles.detailsContainer}>
        <Text style={styles.labelStyle}>{data.lable}</Text>
        <Text numberOfLines={1} style={styles.detailesStyle}>
          {data.name == "mobile" && "+91 "}
          {data.value}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    borderWidth: 0.6,
    padding: 10,
    flexDirection: "row",
    borderRadius: 15,
    borderColor: COLORS.lightDark,
  },
  verticalLine: {
    height: "100%",
    width: 1,
    marginHorizontal: 10,
    backgroundColor: "#909090",
  },
  detailsContainer: {
    flex: 1,
    borderWidth: 0,
    margin: 5,
    justifyContent: "center",
  },
  labelStyle: {
    color: COLORS.lightDark,
    fontFamily: FONT.montserratMedium,
  },
  detailesStyle: {
    color: COLORS.primary,
    fontFamily: FONT.montserratMedium,
    fontWeight: "700",
  },
});

export default ProfileCard;
