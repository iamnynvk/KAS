import React, { useState } from "react";
import { Dimensions, FlatList, Image, TouchableOpacity } from "react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import AppHeader from "../../Components/AppHeader";
import CircularProgress from "../../Components/CircularProgress";
import { COLORS, FONT, images } from "../../Constants";

const { width: screenWidth } = Dimensions.get("screen");

const options = [
  {
    id: 0,
    icon: images.checklist,
    title: "Room Cleaning",
  },
  {
    id: 1,
    icon: images.checklist,
    title: "Sanitization",
  },
  {
    id: 2,
    icon: images.checklist,
    title: "Stock Check",
  },
];

const TaskSelect = () => {
  const [taskStatus, setTaskStatus] = useState("Complete");

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }}>
        <AppHeader />
        <View style={styles.headerContainer}>
          <Text style={styles.placeNameText}>Phoenic Market City Kurla</Text>
          <View style={styles.placeContainer}>
            <Text style={styles.placeText}>Wing A</Text>
            <View style={styles.dot} />
            <Text style={styles.placeText}>Floor 3</Text>
            <View style={styles.dot} />
            <Text style={styles.placeText}>Meeting Room</Text>
          </View>
          <View style={styles.progressContainer}>
            <CircularProgress
              percentage={75}
              radius={14}
              strokeWidth={4}
              color={COLORS.primary}
            />
            <Text style={styles.progressText}>75% complete</Text>
          </View>
        </View>

        <View style={styles.taskButtonContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.buttonContainer,
              {
                backgroundColor:
                  taskStatus == "Complete" ? COLORS.primary : COLORS.gray,
                marginEnd: 5,
              },
            ]}
            onPress={() => setTaskStatus("Complete")}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color:
                    taskStatus == "Complete" ? COLORS.white : COLORS.solidBlack,
                },
              ]}
            >
              Complete
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.buttonContainer,
              {
                backgroundColor:
                  taskStatus == "Pending" ? COLORS.primary : COLORS.gray,
                marginStart: 5,
              },
            ]}
            onPress={() => setTaskStatus("Pending")}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color:
                    taskStatus == "Pending" ? COLORS.white : COLORS.solidBlack,
                },
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>
        </View>

        {taskStatus == "Complete" ? (
          // Complete Task here
          <View style={styles.renderContainer}>
            {options.map((item, index) => {
              return (
                <View key={index} style={styles.optionContainer}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Image source={item.icon} style={styles.iconStyle} />
                    <Text style={styles.stateFont}>{item.title}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          // Pending Task here
          <View></View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  placeText: {
    color: COLORS.solidBlack,
    fontSize: 18,
    fontFamily: FONT.notoSansMedium,
  },
  placeNameText: {
    color: COLORS.solidBlack,
    fontSize: 18,
    fontFamily: FONT.notoSansMedium,
  },
  dot: {
    borderRadius: 50,
    width: 5,
    height: 5,
    marginHorizontal: 15,
    backgroundColor: COLORS.solidBlack,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  progressText: {
    color: COLORS.solidBlack,
    marginStart: 5,
    fontSize: 18,
    fontFamily: FONT.notoSansLight,
  },
  taskButtonContainer: {
    flexDirection: "row",
    marginTop: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    padding: 3,
    width: screenWidth / 2.8,
    alignItems: "center",
    borderRadius: 50,
  },
  buttonText: {
    fontFamily: FONT.montserratRegular,
    fontSize: 16,
  },
  renderContainer: {
    marginTop: screenWidth / 10,
  },
  optionContainer: {
    borderWidth: 1,
    height: screenWidth / 7,
    borderRadius: 15,
    borderColor: COLORS.gray,
    margin: 10,
    backgroundColor: COLORS.gray,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconStyle: {
    width: screenWidth / 12,
    margin: 5,
    height: screenWidth / 12,
    marginHorizontal: 10,
  },
  stateFont: {
    fontFamily: FONT.notoSansRegular,
    fontSize: 16,
    left: 20,
    color: COLORS.solidBlack,
  },
});

export default TaskSelect;
