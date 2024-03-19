import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View, RefreshControl } from "react-native";
import AppHeader from "../../Components/AppHeader";
import { COLORS, FONT } from "../../Constants";
import { ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import ZoneSelectCard from "../../Components/ZoneSelectCard";
import { useDispatch, useSelector } from "react-redux";
import { makeAuthenticatedGetRequest } from "../../Config/Axios";
import { paginationItemLimit } from "../../Utils/Utils";

const ZoneSelect = (props: any) => {
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const { userRole } = useSelector((state: any) => state.user);
  const { zoneDetail, passDate, overView, isSuperVisor } = props?.route?.params;
  const { language } = useSelector((state: any) => state.Preference);
  const [isLoading, setIsLoading] = useState(false);
  const [zoneData, setZoneData] = useState<any>([]);
  const [isMoreDataAvailable, setIsMoreDataAvailable] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [nextUrl, setNextUrl] = useState("");

  const getZoneDetail = (zone: any) => {
    navigation?.navigate("ZoneDetail", {
      selectZone: zone,
    });
  };

  useEffect(() => {
    fetchListData();
  }, []);

  const fetchExactUrl = () => {
    if (userRole != 5) {
      return overView
        ? `/mobile/overview-tab-scan/?page=1&size=${paginationItemLimit}&project_zone_id=${zoneDetail?.pk}&input_date=${passDate}`
        : `/mobile/personal-tab-scan/?page=1&size=${paginationItemLimit}&project_zone_id=${zoneDetail?.pk}&input_date=${passDate}`;
    } else {
      const passingUserType = isSuperVisor ? "supervisor" : "employee";
      return `/mobile/${passingUserType}-tab-scan/?page=1&size=${paginationItemLimit}&project_zone_id=${zoneDetail?.pk}&input_date=${passDate}`;
    }
  };

  const fetchListData = async () => {
    try {
      setIsLoading(true);
      const { data } = await dispatch(
        makeAuthenticatedGetRequest(fetchExactUrl())
      );
      data?.results && setZoneData(data?.results);
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
      data?.results && setZoneData((prev: any) => [...prev, ...data?.results]);
      setIsMoreDataAvailable(data?.next != null ? true : false);
      setNextUrl(data?.next);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const onRefresh = () => {
    setZoneData([]);
    fetchListData();
  };

  const renderEmpty = () => {
    return (
      <View
        style={{ alignItems: "center", justifyContent: "center", height: 200 }}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.primary} size={"small"} />
        ) : (
          <Text style={[styles.titleStyles, { marginTop: 20 }]}>
            {language?.noDataAvailable}
          </Text>
        )}
      </View>
    );
  };

  const renderHeader = () => {
    return <Text style={styles.placeText}>{language?.scanlist}</Text>;
  };

  const renderFooter = () => {
    if (!isMoreDataAvailable) return;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title={zoneDetail?.zone_code} />
      <FlatList
        key={Math.random()}
        data={zoneData}
        stickyHeaderIndices={[0]}
        renderItem={({ item, index }) => (
          <ZoneSelectCard zoneDatas={item} getSelectProperty={getZoneDetail} />
        )}
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        onEndReached={() => isMoreDataAvailable && loadMoreItems()}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  placeText: {
    fontSize: 18,
    color: COLORS.solidBlack,
    fontFamily: FONT.notoSansMedium,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
  },
  titleStyles: {
    fontFamily: FONT.notoSansBold,
    fontSize: 14,
    color: COLORS.solidBlack,
  },
});

export default ZoneSelect;
