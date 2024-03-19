import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  RefreshControl,
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
import EmptyComponent from "../../Components/EmptyComponent";
import { ActivityIndicator } from "react-native-paper";
import _ from "lodash";
import { useNavigation } from "@react-navigation/core";

const Monitor = () => {
  const refRBSheet: any = useRef();
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const { userRole } = useSelector((state: any) => state.user);
  const { language } = useSelector((state: any) => state.Preference);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardData, setCardData] = useState<any>([]);
  const [zoneList, setZoneList] = useState<any>([]);
  const [dates, setDates] = useState(new Date());
  const [optionValue, setOptionValue] = useState<any>(null);
  const [overViewDateState, setOverviewDateState] = useState(new Date());
  const [overViewOptionValue, setOverViewOptionValue] = useState<any>(null);
  const [isDatePickerVisible, setIsDatePickerVisibility] =
    useState<boolean>(false);
  const displayUpdateDate = convertToReadableDate(
    activeIndex === 0 ? dates : overViewDateState
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMoreDataAvailable, setIsMoreDataAvailable] =
    useState<boolean>(false);
  const [nextUrl, setNextUrl] = useState("");
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const debouncedFetchData = _.debounce(() => {
      userRole != 8 && getInitialData();
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
      activeIndex === 0 ? dates : overViewDateState
    )?.format("YYYY-MM-DD");

    try {
      const { data } = await dispatch(
        makeAuthenticatedGetRequest(
          activeIndex === 0
            ? optionValue
              ? `/mobile/personal-tab-project-zone/?page=1&size=${paginationItemLimit}&zone_id=${optionValue?.zone_id}&input_date=${filterDate}`
              : `/mobile/personal-tab-project-zone/?page=1&size=${paginationItemLimit}&input_date=${filterDate}`
            : overViewOptionValue
            ? `/mobile/overview-tab-project-zone/?page=1&size=${paginationItemLimit}&zone_id=${overViewOptionValue?.zone_id}&input_date=${filterDate}`
            : `/mobile/overview-tab-project-zone/?page=1&size=${paginationItemLimit}&input_date=${filterDate}`
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
    } catch (error) {
      console.log(error);
    }
  };

  // Get Zone APIS called
  const getZoneList = async () => {
    try {
      const { data } = await dispatch(
        makeAuthenticatedGetRequest(`/mobile/zone-list-dropdown/`)
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
      : setOverViewOptionValue(zoneSelect);
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

  const clickOnCard = useCallback(
    (
      details: any,
      passingDate: any,
      isOverView: any,
      isManager: any,
      isSuperV: any
    ) => {
      navigation.navigate("ZoneSelect", {
        zoneDetail: details,
        passDate: passingDate,
        overView: isOverView,
        isProjectManager: isManager,
        isSuperVisor: isSuperV,
      });
    },
    []
  );

  const selectedYourZone = useMemo(() =>
    activeIndex === 0 ? optionValue : overViewOptionValue
  ,[]);

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
                {language?.personal}
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
                {language?.overview}
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
                    passingDate={
                      activeIndex === 0
                        ? moment(dates).format("YYYY-MM-DD")
                        : moment(overViewDateState).format("YYYY-MM-DD")
                    }
                    isOverView={activeIndex === 0 ? false : true}
                    clickHandlerOnCard={clickOnCard}
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
          date={activeIndex === 0 ? dates : overViewDateState}
          resetHandler={() =>
            activeIndex === 0
              ? setOptionValue(null)
              : setOverViewOptionValue(null)
          }
          zoneData={zoneList}
          zoneItem={selectedYourZone}
          // zoneItem={activeIndex === 0 ? optionValue : overViewOptionValue}
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
          date={activeIndex === 0 ? dates : overViewDateState}
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

export default Monitor;
