import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { COLORS, FONT } from "../Constants";
import BackButton from "./BackButton";
import Octicons from "react-native-vector-icons/Octicons";

const { width: screenWidth } = Dimensions.get("screen");

const AppHeader = ({
  title = "",
  isBack = true,
  isMenu = false,
  isClearImage = false,
  menuIconsName,
  menuHandler,
}: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.backContainer}>
        {isBack && <BackButton clearImage={isClearImage} />}
      </View>
      <View style={styles.titleContainer}>
        {title !== "" && (
          <Text numberOfLines={1} style={styles.headerTitleStyle}>
            {title}
          </Text>
        )}
      </View>
      <View style={styles.backContainer}>
        {isMenu && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={menuHandler}
            style={{ padding: 10 }}
          >
            <Octicons
              name={menuIconsName}
              size={25}
              color={COLORS.solidBlack}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: screenWidth / 7,
    flexDirection: "row",
    backgroundColor: COLORS.white,
  },
  backContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleStyle: {
    color: COLORS.solidBlack,
    fontSize: 24,
    fontFamily: FONT.notoSansMedium,
    lineHeight: 35,
  },
});

export default React.memo(AppHeader);
