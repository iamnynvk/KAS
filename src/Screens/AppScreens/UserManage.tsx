import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  FlatList,
} from "react-native";
import AppHeader from "../../Components/AppHeader";
import { COLORS, FONT } from "../../Constants";
import Personal from "../AppScreens/Personal";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { makeAuthenticatedGetRequest } from "../../Config/Axios";
import { convertToReadableDate, paginationItemLimit } from "../../Utils/Utils";
import FilterSection from "../../Components/FilterSection";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import DropDownFilter from "../../Components/DropDownFilter";
import RBSheet from "react-native-raw-bottom-sheet";
import PersonalCard from "../../Components/PersonalCard";
import _ from "lodash";
import EmptyComponent from "../../Components/EmptyComponent";
import { ActivityIndicator } from "react-native-paper";

const UserManage = (props: any) => {
  const { organization, project } = props?.route?.params;
  const refRBSheet: any = useRef();
  const dispatch = useDispatch();
  const { userRole } = useSelector((state: any) => state.user);
  const { language } = useSelector((state: any) => state.Preference);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardData, setCardData] = useState<any>([]);
  const [zoneList, setZoneList] = useState<any>([]);
  const [dates, setDates] = useState(new Date());
  const [optionValue, setOptionValue] = useState<any>(null);
  const [superVisorDateState, setOverviewDateState] = useState(new Date());
  const [superVisorOptionValue, setSuperVisorOptionValue] = useState<any>(null);
  const [isDatePickerVisible, setIsDatePickerVisibility] =
    useState<boolean>(false);
  const displayUpdateDate = convertToReadableDate(
    activeIndex === 0 ? dates : superVisorDateState
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMoreDataAvailable, setIsMoreDataAvailable] =
    useState<boolean>(false);
  const [nextUrl, setNextUrl] = useState("");
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const debouncedFetchData = _.debounce(() => {
      getInitialData();
    }, 300);
    setCardData([]);
    setIsLoading(true);
    debouncedFetchData();
    return () => {
      debouncedFetchData.cancel();
    };
  }, [activeIndex]);

  // Get Initial APis called
  const getInitialData = async () => {
    const filterDate = moment(
      activeIndex === 0 ? dates : superVisorDateState
    )?.format("YYYY-MM-DD");

    try {
      const { data } = await dispatch(
        makeAuthenticatedGetRequest(
          activeIndex === 0
            ? optionValue
              ? `/mobile/employee-tab-project-zone/?page=1&size=${paginationItemLimit}&project_id=${project?.pk}&organization_id=${organization?.organization_id}&input_date=${filterDate}&zone_id=${optionValue?.zone_id}`
              : `/mobile/employee-tab-project-zone/?page=1&size=${paginationItemLimit}&project_id=${project?.pk}&organization_id=${organization?.organization_id}&input_date=${filterDate}`
            : superVisorOptionValue
            ? `/mobile/supervisor-tab-project-zone/?page=1&size=${paginationItemLimit}&project_id=${project?.pk}&organization_id=${organization?.organization_id}&input_date=${filterDate}&zone_id=${optionValue?.zone_id}`
            : `/mobile/supervisor-tab-project-zone/?page=1&size=${paginationItemLimit}&project_id=${project?.pk}&organization_id=${organization?.organization_id}&input_date=${filterDate}`
        )
      );
      data?.results && setCardData(data?.results);
      setIsMoreDataAvailable(data?.next != null ? true : false);
      setNextUrl(data?.next);
      setIsLoading(false);
      setRefresh(false);
    } catch (error) {
      setIsLoading(false);
      setRefresh(false);
    }
  };

  const loadMoreItems = async () => {
    try {
      const { data } = await dispatch(makeAuthenticatedGetRequest(nextUrl));
      data?.results &&
        setCardData((prevData: any) => [...prevData, ...data?.results]);
      setIsMoreDataAvailable(data?.next != null ? true : false);
      setNextUrl(data?.next);
      console.log("data?.next", data?.next);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Zone APIS called
  const getZoneList = async () => {
    try {
      const { data } = await dispatch(
        makeAuthenticatedGetRequest(
          `/mobile/project-manager-zone-list-dropdown/?project_id=${project?.pk}&organization_id=${organization?.organization_id}`
        )
      );
      setZoneList(data);
    } catch (error: any) {
      console.log(
        "Error from get zone list apis calling in overview screen ---",
        error.message
      );
    }
  };

  const onFilterHandler = () => {
    getZoneList();
    refRBSheet.current.open();
  };

  const showDatePicker = () => {
    setIsDatePickerVisibility(true);
  };

  const zoneItemSelect = (zoneSelect: any) => {
    activeIndex === 0
      ? setOptionValue(zoneSelect)
      : setSuperVisorOptionValue(zoneSelect);
  };

  const renderFooter = () => {
    if (!isMoreDataAvailable) return;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const onRefresh = () => {
    setRefresh(true);
    setZoneList([]);
    getInitialData();
  };

  const renderEmpty = () => {
    return <EmptyComponent loading={isLoading} />;
  };

  const handleConfirm = (date: any) => {
    activeIndex === 0 ? setDates(date) : setOverviewDateState(date);
    setIsDatePickerVisibility(false);
  };

  return (
    <View style={styles.container}>
      <AppHeader isBack={true} title={language?.monitor} />
      {userRole === 8 ? (
        <View style={styles.mainContainer}>
          <Personal />
        </View>
      ) : (
        <View style={styles.mainContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setActiveIndex(0)}
              style={[
                styles.itemContainer,
                {
                  borderBottomWidth: activeIndex == 0 ? 1 : 0,
                  borderColor: COLORS.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.heading,
                  {
                    color: activeIndex == 0 ? COLORS.primary : COLORS.secondary,
                  },
                ]}
              >
                {language?.employee}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setActiveIndex(1)}
              style={[
                styles.itemContainer,
                {
                  borderBottomWidth: activeIndex == 1 ? 1 : 0,
                  borderColor: COLORS.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.heading,
                  {
                    color: activeIndex == 1 ? COLORS.primary : COLORS.secondary,
                  },
                ]}
              >
                {language?.superVisor}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Render Portion */}
          <View style={styles.renderContainer}>
            <FilterSection
              data={displayUpdateDate}
              filterHandler={onFilterHandler}
            />

            {isLoading ? (
              <View style={{ flex: 1, justifyContent: "center" }}>
                <ActivityIndicator size={"small"} color={COLORS.primary} />
              </View>
            ) : cardData.length > 0 ? (
              <FlatList
                data={cardData}
                extraData={activeIndex}
                showsVerticalScrollIndicator={true}
                renderItem={({ item, index }) => (
                  <PersonalCard
                    details={item}
                    passingDate={activeIndex === 0 ? moment(dates).format("YYYY-MM-DD") : moment(superVisorDateState).format("YYYY-MM-DD")}
                    isManager={true}
                    isSuperV={activeIndex === 0 ? false : true}
                  />
                )}
                ListFooterComponent={renderFooter}
                onEndReached={() => isMoreDataAvailable && loadMoreItems()}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                  <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
                }
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: FONT.notoSansBold }}>
                  {language?.noDataAvailable}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

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
        closeOnPressBack={true}
        onClose={() => setIsDatePickerVisibility(false)}
      >
        <DropDownFilter
          isShowCalender={showDatePicker}
          date={activeIndex === 0 ? dates : superVisorDateState}
          resetHandler={() =>
            activeIndex === 0
              ? setOptionValue(null)
              : setSuperVisorOptionValue(null)
          }
          zoneData={zoneList}
          zoneItem={activeIndex === 0 ? optionValue : superVisorOptionValue}
          selectZoneItem={zoneItemSelect}
          submitHandler={() => {
            refRBSheet.current.close();
            setIsDatePickerVisibility(false);
            getInitialData();
          }}
          isDateVisible={true}
        />

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          date={activeIndex === 0 ? dates : superVisorDateState}
          onConfirm={handleConfirm}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onCancel={() => setIsDatePickerVisibility(false)}
        />
      </RBSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    height: 45,
  },
  itemContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    color: COLORS.solidBlack,
    fontSize: 18,
    fontFamily: FONT.notoSansMedium,
  },
  renderContainer: {
    marginTop: 5,
    flex: 1,
  },
});

export default UserManage;
