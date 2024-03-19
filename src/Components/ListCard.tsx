import { Dimensions, StyleSheet, Text, View } from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
import { Divider } from "react-native-paper";
import { COLORS, FONT } from "../Constants";

const { width: screenWidth } = Dimensions.get("screen");

const ListCard = ({ keys, handleTouch, title, description, isTouch }: any) => {
  return (
    <TouchableOpacity
      key={keys}
      activeOpacity={0.7}
      disabled={isTouch}
      style={styles.cardContainer}
      onPress={handleTouch}
    >
      <View style={styles.cardTopContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.placeText}>{title}</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={styles.zoneText}>{description}</Text>
          </View>
        </View>
      </View>
      <Divider />
      <View style={styles.cardBottomContainer} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    height: screenWidth / 2.4,
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

export default ListCard;
