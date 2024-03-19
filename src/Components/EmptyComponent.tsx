import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useSelector } from "react-redux";
import { COLORS, FONT } from "../Constants";

const EmptyComponent = ({ loading, containerStyles, fontStyles }: any) => {
  const { language } = useSelector((state: any) => state.Preference);
  return (
    <View style={[styles.container, containerStyles]}>
      {loading ? (
        <ActivityIndicator color={COLORS.primary} size={"small"} />
      ) : (
        <Text style={[styles.titleStyles, fontStyles]}>
          {language?.noDataAvailable}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
  },
  titleStyles: {
    marginTop: 20,
    fontFamily: FONT.notoSansBold,
    fontSize: 14,
    color: COLORS.solidBlack,
  },
});

export default EmptyComponent;
