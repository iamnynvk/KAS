import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Divider } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";
import { COLORS, FONT } from "../Constants";
import { convertReadableTime, convertToReadableDate } from "../Utils/Utils";
import { useNavigation } from "@react-navigation/core";

const TicketCard = ({ ticket, isPassed, index }: any) => {
  const navigation: any = useNavigation();
  console.log("TICKER CARD");
  const { language } = useSelector((state: any) => state.Preference);
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        navigation?.navigate("TicketView", {
          ticket: ticket,
          passed: index === 0 ? false : true,
        });
      }}
    >
      <View style={styles.listContainer}>
        <View style={[styles.imageContainer, { alignSelf: "center" }]}>
          <Icon
            name={"clipboard-check-outline"}
            size={26}
            color={COLORS.white}
            style={{
              padding: 7,
              borderRadius: 30,
              backgroundColor: COLORS.primary,
            }}
          />
        </View>
        <View style={styles.listView}>
          <Text numberOfLines={1} ellipsizeMode={"tail"} style={styles.text}>
            {ticket?.description}
          </Text>
          <Text style={styles.description}>
            {language?.assignedTo +
              " : " +
              (ticket?.assigned_to_user?.first_name ||
              ticket?.assigned_to_user?.last_name
                ? ticket?.assigned_to_user?.first_name +
                  " " +
                  ticket?.assigned_to_user?.last_name
                : language?.notAssign)}
          </Text>
          <Text style={[styles.description, { marginTop: 0 }]}>
            {`${language?.Assigner} : ${ticket?.assigner_type}`}
          </Text>

          {ticket.created && (
            <Text style={[styles.description, { marginTop: 0 }]}>
              {`${language?.createDate} : ${convertToReadableDate(
                String(ticket.created).substring(0, 10)
              )}, ${convertReadableTime(
                String(ticket.created).substring(11, 16)
              )}`}
            </Text>
          )}

          {ticket.resolved_time ? (
            <Text style={[styles.description, { marginTop: 0 }]}>
              {`${language?.resolveTime} : ${convertToReadableDate(
                String(ticket.resolved_time).substring(0, 10)
              )}, ${convertReadableTime(
                String(ticket.resolved_time).substring(11, 16)
              )}`}
            </Text>
          ) : (
            <Text style={[styles.description, { marginTop: 0 }]}>
              {`${language?.resolveTime} :  --`}
            </Text>
          )}

          {isPassed && (
            <Text style={[styles.description, { marginTop: 0 }]}>
              {language?.completionTime} :{" "}
              {ticket.completion_time
                ? convertToReadableDate(
                    String(ticket.completion_time).substring(0, 10)
                  ) +
                  ", " +
                  convertReadableTime(
                    String(ticket.completion_time).substring(11, 16)
                  )
                : "any"}
            </Text>
          )}

          {/* 
             {`${language?.completionTime} :  ${convertToReadableDate(
                  String(ticket.completion_time).substring(0, 10)
                )}, ${convertReadableTime(
                  String(ticket.completion_time).substring(11, 16)
                )}`} */}

          {ticket?.resolved_description == "" ? (
            <Text style={styles.notResolvedText}>{language?.notResolve}</Text>
          ) : (
            <Text style={styles.resolvedText}>{language?.resolve}</Text>
          )}
        </View>
      </View>
      <Divider />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flexDirection: "row",
  },
  imageContainer: {
    flex: 0.2,
    alignItems: "center",
    justifyContent: "center",
  },
  listView: {
    flex: 1,
    flexDirection: "column",
    padding: 10,
  },
  text: {
    color: COLORS.solidBlack,
    fontFamily: FONT.notoSansMedium,
    fontSize: 15,
  },
  description: {
    marginTop: 5,
    color: COLORS.lightDark,
    fontFamily: FONT.notoSansRegular,
    fontSize: 12,
  },
  resolvedText: {
    color: COLORS.lightGreen,
    fontFamily: FONT.notoSansMedium,
  },
  notResolvedText: {
    color: COLORS.lightRed,
    fontFamily: FONT.notoSansMedium,
  },
});

export default React.memo(TicketCard);
