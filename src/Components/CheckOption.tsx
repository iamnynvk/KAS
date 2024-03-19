import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Checkbox } from "react-native-paper";
import { COLORS, FONT } from "../Constants";
const { width: screenWith } = Dimensions.get("screen");

const CheckOption = ({ item, selectedID, selectedItem }: any) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => selectedItem(item)}
      style={[
        styles.selectView,
        {
          backgroundColor:
            item?.pk === selectedID?.pk ? COLORS.pista : COLORS.gray,
        },
      ]}
      key={item.pk}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Image source={{ uri: item.service_image }} style={styles.iconStyle} />
        <Text style={styles.stateFont}>{item?.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default CheckOption;

const styles = StyleSheet.create({
  selectView: {
    height: screenWith / 7,
    borderRadius: 15,
    borderColor: COLORS.gray,
    margin: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
  },
  iconStyle: {
    width: screenWith / 12,
    margin: 5,
    height: screenWith / 12,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  stateFont: {
    fontFamily: FONT.notoSansRegular,
    fontSize: 16,
    left: 20,
    color: COLORS.solidBlack,
  },
});
