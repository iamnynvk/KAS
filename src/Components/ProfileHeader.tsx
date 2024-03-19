import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import Icons from "react-native-vector-icons/FontAwesome";
import { COLORS } from "../Constants";
import { FONT } from "../Constants/theme";

const { width: screenWidth } = Dimensions.get("screen");

const ProfileHeader = () => {
  const navigation: any = useNavigation();
  const { language } = useSelector((state: any) => state.Preference);
  const { userData } = useSelector((state: any) => state.user);

  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <View style={styles.userContainer}>
        <Text style={styles.welcomeText}>{language?.welcome}</Text>
        <Text style={styles.userNameText}>
          {`${userData?.first_name} ${userData?.last_name}`}
        </Text>
      </View>
      <View style={styles.profileContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate("Profile")}
        >
          <Icons name="user-circle" size={50} color={COLORS.solidBlack} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    margin: screenWidth / 15,
  },
  userContainer: {
    flex: 2.5,
    justifyContent: "center",
  },
  welcomeText: {
    fontFamily: FONT.notoSansLight,
    color: COLORS.solidBlack,
    fontSize: 18,
    lineHeight: 20,
    textAlignVertical: "center",
  },
  userNameText: {
    fontSize: 24,
    color: COLORS.solidBlack,
    fontFamily: FONT.notoSansMedium,
    lineHeight: 35,
  },
  profileContainer: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});

export default React.memo(ProfileHeader);
