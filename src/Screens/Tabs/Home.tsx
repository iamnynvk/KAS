import React, { useEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ProfileHeader from "../../Components/ProfileHeader";
import ProgressCard from "../../Components/ProgressCard";
import { makeAuthenticatedGetRequest } from "../../Config/Axios";
import { COLORS } from "../../Constants";
import { localization } from "../../localization";
import { setActiveLanguage } from "../../Slice/preferenceSlice";
import { setUserAttendanceData } from "../../Slice/userSlice";
import RBSheet from "react-native-raw-bottom-sheet";
import DropDownFilter from "../../Components/DropDownFilter";

const Home = (props: any) => {
  const dispatch = useDispatch();
  const refRBSheet: any = useRef();
  const { userRole } = useSelector((state: any) => state.user);
  const [projectList, setProjectList] = useState([]);
  const { languageIndex }: any = useSelector((state: any) => state.Preference);
  const [optionValue, setOptionValue] = useState<any>(null);

  useEffect(() => {
    // For set-language according language index
    const languageData: object = localization(languageIndex);
    dispatch(setActiveLanguage(languageData));
  }, []);

  useEffect(() => {
    const sub = props?.navigation?.addListener("focus", async () => {
      setOptionValue(null);
      getProjectDetails();
    });
    return sub;
  }, []);

  const getProjectDetails = async () => {
    const passingUrl =
      userRole == 5
        ? optionValue
          ? `/mobile/projectmanager-home/?project_id=${optionValue?.pk}`
          : `/mobile/projectmanager-home/`
        : "/mobile/home/";

    try {
      const { data } = await dispatch(makeAuthenticatedGetRequest(passingUrl));
      dispatch(setUserAttendanceData(data?.results));
    } catch (error) {
      console.log("Error catch in home-screen --->", error);
    }
  };

  const getProjectList = async () => {
    try {
      const { data } = await dispatch(
        makeAuthenticatedGetRequest("/mobile/projectmanager-project-list/")
      );
      setProjectList(data);
    } catch (error) {
      console.log("Error catch in home-screen --->", error);
    }
  };

  const onFilterClick = () => {
    getProjectList();
    refRBSheet.current.open();
  };

  const zoneItemSelect = (zoneSelect: any) => {
    setOptionValue(zoneSelect);
  };

  const refreshToPull = () => {
    setOptionValue(null);
    setProjectList([]);
    getProjectDetails();
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ProfileHeader />
      <ScrollView style={{ flex: 1 }}>
        <ProgressCard
          handleFilter={onFilterClick}
          onRefreshToPull={refreshToPull}
        />
      </ScrollView>

      {userRole == 5 && (
        <RBSheet
          ref={refRBSheet}
          openDuration={250}
          closeOnDragDown={true}
          customStyles={{
            container: {
              paddingHorizontal: 20,
              borderTopEndRadius: 10,
              borderTopStartRadius: 10,
              height: "50%",
            },
          }}
        >
          <DropDownFilter
            resetHandler={() => setOptionValue(null)}
            zoneData={projectList}
            zoneItem={optionValue}
            selectZoneItem={zoneItemSelect}
            submitHandler={() => {
              refRBSheet.current.close();
              getProjectDetails();
            }}
            isDateVisible={false}
            forProject={true}
          />
        </RBSheet>
      )}
    </View>
  );
};

export default Home;
