import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import Icons from "react-native-vector-icons/Ionicons";
import { COLORS, FONT } from "../Constants";

const { width: screenWidth } = Dimensions.get("screen");

const FilterSection = ({ data, filterHandler, forProject = false }: any) => {
  const { userRole } = useSelector((state: any) => state.user);
  const { language } = useSelector((state: any) => state.Preference);

  return (
    <View style={{ backgroundColor: COLORS.white }}>
      {userRole === 8 && (
        <View style={styles.personalContainer}>
          <Text style={styles.personalText}>{language?.personal}</Text>
        </View>
      )}
      <View style={styles.filterContainer}>
        {!forProject && (
          <View style={{ marginStart: 20 }}>
            <Text style={styles.title}>{data}</Text>
          </View>
        )}
        <TouchableOpacity onPress={filterHandler} activeOpacity={0.7}>
          <View style={styles.filter}>
            <Icons
              name={"funnel"}
              color={COLORS.white}
              size={18}
              style={{ marginEnd: 5 }}
            />
            <Text style={[{ color: COLORS.white }]}>{language?.filter}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  personalContainer: {
    marginVertical: 5,
    backgroundColor: COLORS.white,
  },
  personalText: {
    color: COLORS.solidBlack,
    fontSize: 24,
    fontFamily: FONT.notoSansMedium,
    lineHeight: 35,
    marginHorizontal: 20,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  title: {
    fontSize: 18,
    color: COLORS.solidBlack,
    fontFamily: FONT.notoSansMedium,
    color: COLORS.lightDark,
  },

  filter: {
    flexDirection: "row",
    width: 95,
    height: 35,
    marginHorizontal: 20,
    borderRadius: 50,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FilterSection;
