import React, { useState } from "react";
import { StyleSheet, Text, View, Dimensions, FlatList } from "react-native";
import { COLORS } from "../Constants";
import { FONT } from "../Constants/theme";
import { useSelector } from "react-redux";
import ProjectCard from "./ProjectCard";
import { convertToReadableDate } from "../Utils/Utils";
import { useNavigation } from "@react-navigation/native";
import FilterSection from "./FilterSection";
import EmptyComponent from "./EmptyComponent";
import { RefreshControl } from "react-native";

const { width: screenWidth } = Dimensions.get("screen");

const ProgressCard = ({ handleFilter, onRefreshToPull }: any) => {
  const navigation: any = useNavigation();
  const { userRole } = useSelector((state: any) => state.user);
  const { userAttendanceData } = useSelector((state: any) => state.user);
  const { language } = useSelector((state: any) => state.Preference);
  const [refresh, setRefresh] = useState(false);

  const renderHeader = () => {
    return <FilterSection filterHandler={handleFilter} />;
  };

  const renderEmpty = () => {
    return <EmptyComponent />;
  };

  return (
    <View>
      <View style={styles.container}>
        {/* Display date */}
        {userAttendanceData?.date && (
          <Text style={styles.dateText}>
            {convertToReadableDate(
              String(userAttendanceData?.date).substring(0, 10)
            )}
          </Text>
        )}

        {/* Attendance data  */}
        {userRole != 10 && userRole != 5 && (
          <Text style={styles.attendanceText}>
            {language.attendance} : {userAttendanceData?.attendance_marked}
          </Text>
        )}

        {/* Project name */}
        <View style={styles.progressContainer}>
          {userRole != 10 && userRole != 5 && (
            <View style={styles.taskHeader}>
              <Text style={styles.progressText} numberOfLines={1}>
                {language.projectName} : {userAttendanceData?.project?.name}{" "}
                {userAttendanceData?.multiple_active_projects_detected &&
                  `(${language?.multiProject})`}
              </Text>
            </View>
          )}
        </View>
      </View>

      {(userRole == 10 || userRole == 5) && (
        <FlatList
          data={userAttendanceData.project}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          renderItem={({ item, index }) => (
            <ProjectCard
              keys={item.pk}
              handleTouch={() =>
                userRole == 5 &&
                navigation.navigate("OrganizationList", {
                  project: item,
                })
              }
              title={`Project: ${item.name}`}
              description={`Organization: ${item.organization_name}`}
              isTouch={userRole == 10}
            />
          )}
          ListHeaderComponent={userRole == 5 ? renderHeader : <></>}
          refreshControl={
            <RefreshControl refreshing={refresh} onRefresh={onRefreshToPull} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 8,
    marginHorizontal: screenWidth / 20,
    backgroundColor: COLORS.secondary,
  },
  dateText: {
    color: COLORS.white,
    fontSize: 24,
    fontFamily: FONT.notoSansMedium,
  },
  attendanceText: {
    color: COLORS.white,
    textAlignVertical: "center",
    marginVertical: 5,
    fontSize: 16,
    fontFamily: FONT.notoSansMedium,
  },
  progressContainer: {
    flexDirection: "row",
  },
  progressText: {
    color: COLORS.white,
    fontSize: 16,
    marginRight: 5,
    fontFamily: FONT.notoSansMedium,
  },
  taskHeader: {
    justifyContent: "center",
    flex: 1,
  },
});

export default ProgressCard;
