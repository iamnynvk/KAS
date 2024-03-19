import React from "react";
import { Dimensions } from "react-native";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { COLORS, FONT } from "../Constants";

const { width: screenWidth } = Dimensions.get("screen");

interface IPropsTypes {
  isDisable?: boolean;
  handleSubmitButton?: any;
  isLoading?: boolean;
  title: string;
}

const SubmitButton = ({
  isDisable,
  handleSubmitButton,
  isLoading,
  title,
}: IPropsTypes) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={isDisable}
        style={[
          styles.buttonStyles,
          {
            opacity: isDisable ? 0.5 : 1,
          },
        ]}
        onPress={handleSubmitButton}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text style={styles.textContainer}>{title}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 46,
    width: screenWidth / 1.2,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.solidBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonStyles: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONT.notoSansMedium,
  },
});

export default SubmitButton;
