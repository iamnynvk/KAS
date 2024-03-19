import React, { useRef, useState } from "react";
import { FlatList, View, RefreshControl, Platform } from "react-native";
import { COLORS } from "../../Constants";
import PersonalCard from "../../Components/PersonalCard";
import { useDispatch } from "react-redux";
import { ActivityIndicator } from "react-native-paper";
import { makeAuthenticatedGetRequest } from "../../Config/Axios";
import RBSheet from "react-native-raw-bottom-sheet";
import moment from "moment";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { convertToReadableDate, paginationItemLimit } from "../../Utils/Utils";
import FilterSection from "../../Components/FilterSection";
import DropDownFilter from "../../Components/DropDownFilter";
import EmptyComponent from "../../Components/EmptyComponent";
import _ from "lodash";

const Personal = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const refRBSheet: any = useRef();
  const [personalData, setPersonalData] = useState<any>([]);
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

  useFocusEffect(
    React.useCallback(() => {
      const debouncedFetchData = _.debounce(() => {
        getPersonalData();
      }, 350);
      setDates(new Date());
      setOptionValue(null);
      setZoneList([]);
      debouncedFetchData();
      return () => {
        debouncedFetchData.cancel();
      };
    }, [])
  );

  const getPersonalData = async () => {
    const filterDate = moment(dates)?.format("YYYY-MM-DD");
    try {
      setIsLoading(true);
      const { data } = await dispatch(
        makeAuthenticatedGetRequest(
          optionValue
            ? `/mobile/personal-tab-project-zone/?page=1&size=${paginationItemLimit}&zone_id=${optionValue?.zone_id}&input_date=${filterDate}`
            : `/mobile/personal-tab-project-zone/?page=1&size=${paginationItemLimit}&input_date=${filterDate}`
        )
      );
      data?.results && setPersonalData(data?.results);
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
      setIsLoading(true);
      const { data } = await dispatch(makeAuthenticatedGetRequest(nextUrl));
      data?.results &&
        setPersonalData((prevData: any) => [...prevData, ...data?.results]);
      setIsMoreDataAvailable(data?.next != null ? true : false);
      setNextUrl(data?.next);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const getZoneList = async () => {
    console.log("getZoneList");
    try {
      const { data } = await dispatch(
        makeAuthenticatedGetRequest(`/mobile/zone-list-dropdown/`)
      );
      setZoneList(data);
    } catch (error: any) {
      console.log(
        "Error from get zone list apis calling in personal screen ---",
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
    console.log("onRefresh");
    setRefresh(true);
    setZoneList([]);
    getPersonalData();
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
        data={personalData}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <PersonalCard
            details={item}
            passingDate={moment(dates).format("YYYY-MM-DD")}
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
            getPersonalData();
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

export default Personal;
