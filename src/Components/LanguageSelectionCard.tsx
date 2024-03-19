import React from "react";
import { TouchableOpacity, StyleSheet, Text, Dimensions } from "react-native";
import { COLORS, FONT } from "../Constants";

const { width: screenWidth } = Dimensions.get("screen");

const LanguageSelectionCard = ({
  data,
  clickHandler,
  activeLanguage,
}: any) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      key={data?.index}
      onPress={() => clickHandler(data?.index)}
      style={[
        styles.button,
        {
          backgroundColor:
            activeLanguage == data?.index ? COLORS.primary : COLORS.gray,
          borderColor:
            activeLanguage == data?.index ? COLORS.primary : COLORS.gray,
        },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          {
            color:
              activeLanguage == data?.index ? COLORS.white : COLORS.lightDark,
          },
        ]}
      >
        {data.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 0.5,
    paddingVertical: 5,
    borderRadius: 15,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    width: screenWidth / 4,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontFamily: FONT.montserratRegular,
  },
});

export default LanguageSelectionCard;
