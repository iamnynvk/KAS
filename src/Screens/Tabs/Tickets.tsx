import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Dimensions,
} from "react-native";
import { COLORS, FONT } from "../../Constants";
import AppHeader from "../../Components/AppHeader";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { makeAuthenticatedGetRequest } from "../../Config/Axios";
import TicketCard from "../../Components/TicketCard";
import { ActivityIndicator } from "react-native-paper";
import _ from "lodash";
import { paginationItemLimit } from "../../Utils/Utils";

const { width: screenWidth } = Dimensions.get("screen");

const Tickets = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { language } = useSelector((state: any) => state.Preference);
  const { userRole } = useSelector((state: any) => state.user);
  const [activeIndex, setActiveIndex] = useState(0);
  const [ticketData, setTicketData] = useState([]);
  const [isMoreDataAvailable, setIsMoreDataAvailable] = useState(false);
  const [nextUrl, setNextUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const debouncedFetchData = _.debounce(() => {
        fetchData();
      }, 350);
      setTicketData([]);
      setIsLoading(true);
      debouncedFetchData();
      return () => {
        debouncedFetchData.cancel();
      };
    }, [activeIndex])
  );

  const fetchData = async () => {
    const roleId =
      userRole === 7
        ? "supervisor"
        : userRole === 8
        ? "employee"
        : userRole === 5
        ? "project-manager"
        : "customer";

    try {
      const { data } = await dispatch(
        makeAuthenticatedGetRequest(
          `/ticket/list-ticket-${roleId}/?page=1&size=${paginationItemLimit}&is_open=${
            activeIndex === 0 ? "True" : "False"
          }`
        )
      );
      data?.results && setTicketData(data?.results);
      setIsMoreDataAvailable(data?.next != null ? true : false);
      setNextUrl(data?.next);
      setIsLoading(false);
      setRefresh(false);
    } catch (e: any) {
      console.log(e.message);
      setRefresh(false);
      setIsLoading(false);
    }
  };

  const fetchMoreData = async () => {
    try {
      const { data } = await dispatch(makeAuthenticatedGetRequest(nextUrl));
      data?.results &&
        setTicketData((ticketsData: any) => [...ticketsData, ...data?.results]);
      setIsMoreDataAvailable(data?.next != null ? true : false);
      setNextUrl(data?.next);
    } catch (error) {
      console.log(error);
    }
  }

  const renderTicketList = useCallback((tickets: any) => {
    return <TicketCard ticket={tickets} index={activeIndex} />;
  }, []);

  const renderFooter = () => {
    if (!isMoreDataAvailable) return;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const clickMenuHandler = useCallback(() => {
    userRole != 8 && navigation?.navigate("TicketScan", { addTicket: true });
  }, []);

  return (
    <View style={styles.container}>
      <AppHeader
        isBack={true}
        isMenu={true}
        menuIconsName={userRole != 8 && "plus-circle"}
        menuHandler={clickMenuHandler}
        title={language?.ticket}
      />
      <View style={styles.mainContainer}>
        {/* TOP TABS  */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            key={0}
            activeOpacity={1}
            onPress={() => {
              setActiveIndex(0);
            }}
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
              {language?.activeTicket}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            key={1}
            activeOpacity={1}
            onPress={() => {
              setActiveIndex(1);
            }}
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
              {language?.closedTicket}
            </Text>
          </TouchableOpacity>
        </View>
        {/* FLAT LIST LOGIC */}
        <View style={styles.renderContainer}>
          {isLoading ? (
            <View style={{ flex: 1, justifyContent: "center" }}>
              <ActivityIndicator size={"small"} color={COLORS.primary} />
            </View>
          ) : ticketData.length > 0 ? (
            <FlatList
              windowSize={10}
              initialNumToRender={10}
              data={ticketData}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => renderTicketList(item)}
              keyExtractor={({ item, index }) => index}
              ListFooterComponent={renderFooter}
              onEndReached={() => isMoreDataAvailable && fetchMoreData()}
              refreshControl={
                <RefreshControl
                  refreshing={refresh}
                  onRefresh={() => {
                    setRefresh(true);
                    fetchData();
                  }}
                />
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
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    width: screenWidth / 2,
    height: 2,
    backgroundColor: COLORS.primary,
  },
  renderContainer: {
    flex: 1,
  },
});

export default Tickets;
