import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, FlatList, RefreshControl } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { makeAuthenticatedGetRequest } from "../../Config/Axios";
import { COLORS } from "../../Constants";
import LoadingOverlay from "../../Utils/LoadingOverlay";
import TicketCard from "../../Components/TicketCard";
import EmptyComponent from "../../Components/EmptyComponent";
import { paginationItemLimit } from "../../Utils/Utils";

const ActiveTickets = () => {
  const navigation: any = useNavigation();
  const dispatch = useDispatch();
  const { userRole } = useSelector((state: any) => state.user);
  const [ticketData, setTicketData] = useState<any>([]);
  const [isMoreDataAvailable, setIsMoreDataAvailable] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nextUrl, setNextUrl] = useState("");

  useEffect(() => {
    const subsription = navigation.addListener("focus", () => {
      getTicketsData();
    });
    getTicketsData();
    return subsription;
  }, []);

  const getTicketsData = async () => {
    const roleId =
      userRole === 7
        ? "supervisor"
        : userRole === 8
        ? "employee"
        : userRole === 5
        ? "project-manager"
        : "customer";
    try {
      setIsLoading(true);
      const { data } = await dispatch(
        makeAuthenticatedGetRequest(
          `/ticket/list-ticket-${roleId}/?page=1&size=${paginationItemLimit}&is_open=True`
        )
      );
      data?.results && setTicketData(data?.results);
      setIsMoreDataAvailable(data?.next != null ? true : false);
      setNextUrl(data?.next);
      setIsLoading(false);
      LoadingOverlay.hide();
    } catch (error) {
      setIsLoading(false);
      LoadingOverlay.hide();
    }
  };

  const loadMoreItems = async () => {
    try {
      setIsLoading(true);
      const { data } = await dispatch(makeAuthenticatedGetRequest(nextUrl));
      data?.results &&
        setTicketData((ticketsData: any) => [...ticketsData, ...data?.results]);
      setIsMoreDataAvailable(data?.next != null ? true : false);
      setNextUrl(data?.next);
      setIsLoading(false);
      LoadingOverlay.hide();
    } catch (error) {
      setIsLoading(false);
      LoadingOverlay.hide();
    }
  };

  const renderTicketList = (tickets: any) => {
    return (
      <TicketCard
        ticket={tickets}
        clickHandler={() =>
          navigation?.navigate("TicketView", {
            ticket: tickets,
            passed: false,
          })
        }
      />
    );
  };

  const renderFooter = (): any => {
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
    getTicketsData();
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <FlatList
        data={ticketData}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => renderTicketList(item)}
        keyExtractor={({ item, index }) => index}
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

export default ActiveTickets;
