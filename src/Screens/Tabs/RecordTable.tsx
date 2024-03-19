import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DataTable } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "../../Components/AppHeader";
import { COLORS, FONT } from "../../Constants";
import { makeAuthenticatedGetRequest } from "../../Config/Axios";
import LoadingOverlay from "../../Utils/LoadingOverlay";
import EmptyComponent from "../../Components/EmptyComponent";

const RecordTable = (props: any) => {
  const navigation: any = useNavigation();
  const { language } = useSelector((state: any) => state?.Preference);
  const dispatch = useDispatch();
  const [projectTableData, setProjectTableData] = useState([]);

  React.useEffect(() => {
    const subscribe = navigation.addListener("focus", () => {
      console.log("FOCUS THE SCREEN -> ");
      fetchProjectTableData();
    });
    LoadingOverlay.show("Loading...");
    return () => subscribe;
  }, []);

  const fetchProjectTableData = async () => {
    try {
      const { data } = await dispatch(
        makeAuthenticatedGetRequest(
          "/attendance/project-manager-attendance-current-status-list/"
        )
      );
      data.status == 200 && setProjectTableData(data.results);
      LoadingOverlay.hide();
    } catch (e: any) {
      LoadingOverlay.hide();
      console.log(e.message);
    }
  };
  return (
    <View style={styles.container}>
      <AppHeader title={language?.record} />
      <ScrollView style={{ flex: 1 }}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title
              style={{ flex: 0.5 }}
              textStyle={styles.headerStyle}
            >
              {language.no}
            </DataTable.Title>
            <DataTable.Title
              style={{ flex: 2.5 }}
              textStyle={styles.headerStyle}
            >
              {language.project}
            </DataTable.Title>
            <DataTable.Title style={{ flex: 1 }} textStyle={styles.headerStyle}>
              {language.checkin}
            </DataTable.Title>
            <DataTable.Title style={{ flex: 1 }} textStyle={styles.headerStyle}>
              {language.checkout}
            </DataTable.Title>
          </DataTable.Header>
          {projectTableData.length > 0 ? (
            projectTableData?.map((pItem: any, index) => {
              return (
                <TouchableOpacity
                  key={pItem?.project?.project_pk}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation?.navigate("RecordCheckIn", {
                      projectId: pItem?.project?.project_pk,
                    })
                  }
                >
                  <DataTable.Row>
                    <DataTable.Cell style={{ flex: 0.5 }}>
                      <Text style={styles.textStyles}>{index + 1}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 2.5 }}>
                      <Text style={styles.textStyles}>
                        {pItem?.project?.project}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      <Text style={styles.textStyles}>
                        {pItem?.is_checkin ? "True" : "false"}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      <Text style={styles.textStyles}>
                        {pItem?.is_checkout ? "true" : "false"}
                      </Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                </TouchableOpacity>
              );
            })
          ) : (
            <EmptyComponent />
          )}
        </DataTable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerStyle: {
    color: COLORS.solidBlack,
    fontFamily: FONT.notoSansBold,
    fontSize: 14,
  },
  textStyles: { color: COLORS.solidBlack, fontFamily: FONT.notoSansRegular },
});

export default React.memo(RecordTable);
