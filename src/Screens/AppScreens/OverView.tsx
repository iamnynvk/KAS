import React, { useEffect, useRef, useState } from "react";
import { FlatList, View, RefreshControl, Platform } from "react-native";
import { COLORS } from "../../Constants";
import PersonalCard from "../../Components/PersonalCard";
import { useDispatch } from "react-redux";
import { ActivityIndicator } from "react-native-paper";
import { makeAuthenticatedGetRequest } from "../../Config/Axios";
import RBSheet from "react-native-raw-bottom-sheet";
import moment from "moment";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useNavigation } from "@react-navigation/native";
import { convertToReadableDate, paginationItemLimit } from "../../Utils/Utils";
import FilterSection from "../../Components/FilterSection";
import DropDownFilter from "../../Components/DropDownFilter";
import EmptyComponent from "../../Components/EmptyComponent";

const todayDate = moment()?.format("YYYY-MM-DD");

const OverView = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const refRBSheet: any = useRef();
  const [overviewData, setOverviewData] = useState<any>([]);
  const [zoneList, setZoneList] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMoreDataAvailable, setIsMoreDataAvailable] =
    useState<boolean>(false);
  const [isDatePickerVisible, setIsDatePickerVisibility] =
    useState<boolean>(false);
  const [dates, setDates] = useState<any>(new Date());
  const [optionValue, setOptionValue] = useState<any>(null);
  const [refresh, setRefresh] = useState(false);
  const [nextUrl, setNextUrl] = useState("");

  useEffect(() => {
    const sub = navigation?.addListener("tabPress", async () => {
      setDates(new Date());
      setOptionValue(null);
      setZoneList([]);
      getOverviewData();
    });
    getOverviewData();
    return sub;
  }, []);

  const getOverviewData = async () => {
    const filterDate = dates && moment(dates)?.format("YYYY-MM-DD");
    try {
      setIsLoading(true);
      const { data } = await dispatch(
        makeAuthenticatedGetRequest(
          optionValue
            ? `/mobile/overview-tab-project-zone/?page=1&size=${paginationItemLimit}&zone_id=${
                optionValue?.zone_id
              }&input_date=${dates ? filterDate : todayDate}`
            : `/mobile/overview-tab-project-zone/?page=1&size=${paginationItemLimit}&input_date=${
                dates ? filterDate : todayDate
              }`
        )
      );
      data?.results && setOverviewData(data?.results);
      setIsMoreDataAvailable(data?.next != null ? true : false);
      setNextUrl(data?.next);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const loadMoreItems = async () => {
    try {
      setIsLoading(true);
      const { data } = await dispatch(makeAuthenticatedGetRequest(nextUrl));
      data?.results &&
        setOverviewData((prevData: any) => [...prevData, ...data?.results]);
      setIsMoreDataAvailable(data?.next != null ? true : false);
      setNextUrl(data?.next);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

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

  const renderHeader = () => {
    const displayUpdateDate = convertToReadableDate(dates);
    return (
      <FilterSection data={displayUpdateDate} filterHandler={onFilterHandler} />
    );
  };

  const renderFooter = () => {
    if (!isMoreDataAvailable) return;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    return <EmptyComponent loading={isLoading} />;
  };

  const onRefresh = () => {
    setDates(new Date());
    setOptionValue(null);
    setZoneList([]);
    getOverviewData();
  };

  const showDatePicker = () => {
    setIsDatePickerVisibility(true);
  };

  const handleConfirm = (date: any) => {
    setDates(date);
    setIsDatePickerVisibility(false);
  };

  const zoneItemSelect = (zoneSelect: any) => {
    setOptionValue(zoneSelect);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <FlatList
        data={overviewData}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <PersonalCard
            details={item}
            passingDate={dates ? moment(dates).format("YYYY-MM-DD") : todayDate}
            isOverView={true}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        onEndReached={() => isMoreDataAvailable && loadMoreItems()}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
        }
      />

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
          date={dates}
          resetHandler={() => setOptionValue(null)}
          zoneData={zoneList}
          zoneItem={optionValue}
          selectZoneItem={zoneItemSelect}
          submitHandler={() => {
            refRBSheet.current.close();
            setIsDatePickerVisibility(false);
            getOverviewData();
          }}
          isDateVisible={true}
        />

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          date={dates}
          onConfirm={handleConfirm}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onCancel={() => setIsDatePickerVisibility(false)}
        />
      </RBSheet>
    </View>
  );
};

export default OverView;
