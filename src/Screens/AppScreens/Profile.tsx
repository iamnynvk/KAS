import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, FONT } from "../../Constants";
import AppHeader from "../../Components/AppHeader";
import { useDispatch, useSelector } from "react-redux";
import { setActiveLanguage, setLanguage } from "../../Slice/preferenceSlice";
import { localization } from "../../localization";
import SubmitButton from "../../Components/SubmitButton";
import { makeAuthenticatedPostRequest } from "../../Config/Axios";
import {
  setAccessToken,
  setRefreshToken,
  setUserAttendanceData,
  setUserData,
  setUserRole,
} from "../../Slice/userSlice";
import { useNavigation } from "@react-navigation/native";
import LoadingOverlay from "../../Utils/LoadingOverlay";
import ProfileCard from "../../Components/ProfileCard";
import LanguageSelectionCard from "../../Components/LanguageSelectionCard";

const languageButtonsArray = [
  {
    index: 0,
    id: "english",
    name: "English",
    active: true,
  },
  {
    index: 1,
    id: "hindi",
    name: "Hindi",
    active: false,
  },
  {
    index: 2,
    id: "marathi",
    name: "Marathi",
    active: false,
  },
];

const Profile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { refreshToken, userData } = useSelector((state: any) => state.user);
  const { userRole } = useSelector((state: any) => state.user);
  const { languageIndex, language } = useSelector(
    (state: any) => state.Preference
  );
  const [activeLang, setActiveLang] = useState(
    languageIndex || languageButtonsArray[0].index
  );

  const logOut = async () => {
    const params = {
      refresh_token: refreshToken,
    };
    try {
      LoadingOverlay.show(language?.loading);
      const { data } = await dispatch(
        makeAuthenticatedPostRequest("/users/custom-logout/", params)
      );
      if (data?.status == 200) {
        dispatch(setUserData(null));
        dispatch(setAccessToken(null));
        dispatch(setRefreshToken(null));
        dispatch(setUserRole(null));
        dispatch(setUserAttendanceData({}));
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
        LoadingOverlay.hide();
      }
    } catch (error) {
      LoadingOverlay.hide();
      console.log("Error from Logout user :", error);
    }
  };

  const inputDetailsArray = [
    {
      lable: language?.fullname,
      name: "fullName",
      value: `${userData?.first_name} ${userData?.last_name}`,
      icon: "user",
    },
    {
      lable: language?.mobile,
      name: "mobile",
      value: userData?.phone,
      icon: "smartphone",
    },
    {
      lable: language?.email,
      name: "email",
      value: userData?.email,
      icon: "mail",
    },
    {
      lable: userData?.organization?.name,
      value:
        userRole == 7
          ? "Role : Supervisor"
          : userRole == 8
          ? "Role : Employee"
          : userRole == 5
          ? "Role : Project Manager"
          : "Role : Customer",
      name: "role",
      icon: "users",
    },
  ];

  const languageSelectHandler = (languageIndex: any) => {
    setActiveLang(languageIndex);
    dispatch(setLanguage(languageIndex));
    dispatch(setActiveLanguage(localization(languageIndex)));
  };

  return (
    <React.Fragment>
      <AppHeader title={language?.profile} />
      <View style={styles.mainContainer}>
        <View style={styles.profileContainer}>
          {/* Mapping inputs as form */}
          {inputDetailsArray.map((item, index) => {
            return <ProfileCard data={item} keys={index} />;
          })}

          {/* Here is the types of localization */}
          <View style={styles.languageController}>
            <Text style={styles.languageTag}>{language.language}</Text>
            <View style={styles.languageButtons}>
              {languageButtonsArray.map((item, index) => {
                return (
                  <LanguageSelectionCard
                    data={item}
                    activeLanguage={activeLang}
                    clickHandler={languageSelectHandler}
                  />
                );
              })}
            </View>
          </View>

          {/* Submit button handler */}
          <SubmitButton title={language?.logout} handleSubmitButton={logOut} />
        </View>
      </View>
    </React.Fragment>
  );
};

export default Profile;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
  },
  profileContainer: {
    flex: 1,
    marginHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  languageController: {
    marginVertical: 10,
    alignItems: "center",
  },
  languageTag: {
    fontFamily: FONT.montserratRegular,
    color: COLORS.lightDark,
  },
  languageButtons: {
    flexDirection: "row",
    marginVertical: 25,
  },
});
