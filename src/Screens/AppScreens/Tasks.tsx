import React, { useState } from "react";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import { COLORS, FONT } from "../../Constants";
import { useDispatch, useSelector } from "react-redux";
const { width: screenWidth } = Dimensions.get("screen");
import { makeAuthenticatedGetRequest } from "../../Config/Axios";
import CheckOption from "../../Components/CheckOption";
import LoadingOverlay from "../../Utils/LoadingOverlay";
import AppHeader from "../../Components/AppHeader";

const Tasks = (props: any) => {
  const dispatch = useDispatch();
  const { scanningData, isAddTicket } = props?.route?.params;
  const { language } = useSelector((state: any) => state.Preference);
  const { scanData } = useSelector((state: any) => state.scan);
  const [selectedID, setSelectedID] = useState<any>();

  const itemSelected = async (item: any) => {
    LoadingOverlay.show(language?.loading);
    setSelectedID(item);
    try {
      const { data }: any = await dispatch(
        makeAuthenticatedGetRequest(
          `/scan/scan-get-questions/?service_id=${item?.pk}&zone_id=${scanData}`
        )
      );
      LoadingOverlay.hide();
      props?.navigation?.navigate(isAddTicket ? "AddTicket" : "QuestionList", {
        selectedService: data?.results,
        serviceId: item?.pk,
      });
    } catch (error) {
      LoadingOverlay.hide();
      console.log("Error from select Task screen for Api calling : ", error);
    }
  };

  return (
    <View style={{ backgroundColor: COLORS.white, flex: 1 }}>
      <AppHeader title={language?.inspectTask} />
      <View style={styles.mainContainer}>
        <View style={styles.selectionSection}>
          <FlatList
            data={scanningData}
            style={{ flex: 1 }}
            renderItem={({ item }) => (
              <CheckOption
                item={item}
                selectedItem={itemSelected}
                selectedID={selectedID}
              />
            )}
          />
        </View>
      </View>
    </View>
  );
};

export default Tasks;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  selectionSection: {
    flex: 1,
    top: screenWidth / 20,
  },
});
