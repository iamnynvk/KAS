import { Dimensions, StyleSheet, Text, View } from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
import { COLORS, FONT } from "../Constants";

const { width: screenWidth } = Dimensions.get("screen");

const ProjectCard = ({
  keys,
  handleTouch,
  title,
  description,
  isTouch,
}: any) => {
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
            {description && <Text style={styles.zoneText}>{description}</Text>}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 95,
    width: "90%",
    marginVertical: 10,
    borderRadius: 15,
    alignSelf: "center",
    backgroundColor: COLORS.lightWhite,
  },
  cardTopContainer: {
    flex: 3,
    justifyContent: "center",
    flexDirection: "row",
  },
  labelContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    marginHorizontal: 20,
  },
  placeText: {
    fontSize: 18,
    fontFamily: FONT.notoSansMedium,
    color: COLORS.secondary,
  },
  zoneText: {
    color: COLORS.secondary,
    fontFamily: FONT.notoSansLight,
    fontSize: 14,
  },
});

export default ProjectCard;
