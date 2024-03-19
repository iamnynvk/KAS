import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { useDispatch } from "react-redux";
import AppHeader from "../../Components/AppHeader";
import ProjectCard from "../../Components/ProjectCard";
import DropDownFilter from "../../Components/DropDownFilter";
import FilterSection from "../../Components/FilterSection";
import EmptyComponent from "../../Components/EmptyComponent";
import { RefreshControl } from "react-native";
import { COLORS } from "../../Constants";
import { makeAuthenticatedGetRequest } from "../../Config/Axios";

const OrganizationList = (props: any) => {
  const dispatch = useDispatch();
  const refRBSheet: any = useRef();
  const { project } = props?.route?.params;
  const [organizationData, setOrganizationData] = useState([]);
  const [organizationList, setOrganizationList] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [optionValue, setOptionValue] = useState<any>(null);

  useEffect(() => {
    getOrganizationData();
  }, []);

  const getOrganizationData = async () => {
    try {
      const { data } = await dispatch(
        makeAuthenticatedGetRequest(
          optionValue
            ? `/mobile/projectmanager-organizations/?project_id=${project?.pk}&organization_id=${optionValue?.organization_id}`
            : `/mobile/projectmanager-organizations/?project_id=${project?.pk}`
        )
      );
      data?.status === 200 && setOrganizationData(data?.results);
    } catch (err: any) {
      console.log("Error from get organization data ----", err.message);
    }
  };

  const getOrganizationList = async () => {
    try {
      const { data } = await dispatch(
        makeAuthenticatedGetRequest(
          `/mobile/projectmanager-organization-list/?project_id=${project?.pk}`
        )
      );
      data && setOrganizationList(data);
    } catch (err: any) {
      console.log("Error from get organization list ---", err.message);
    }
  };

  const handleFilter = () => {
    getOrganizationList();
    refRBSheet.current.open();
  };

  const renderHeader = () => <FilterSection filterHandler={handleFilter} />;

  const renderEmpty = () => <EmptyComponent />;

  const projectItemSelect = (projectItem: any) => {
    setOptionValue(projectItem);
  };

  const onRefreshToPull = () => {
    setOptionValue(null);
    setOrganizationData([]);
    getOrganizationData();
  };

  return (
    <View style={styles.container}>
      <AppHeader title={project?.name} />
      <View style={styles.mainContainer}>
        <FlatList
          data={organizationData}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }: any) => {
            return (
              <ProjectCard
                keys={item.organization_id}
                handleTouch={() =>
                  props?.navigation.navigate("UserManage", {
                    project: project,
                    organization: item,
                  })
                }
                title={item.name}
              />
            );
          }}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={refresh} onRefresh={onRefreshToPull} />
          }
        />
      </View>

      {/* Filter sheet */}
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
      >
        <DropDownFilter
          resetHandler={() => setOptionValue(null)}
          zoneData={organizationList}
          zoneItem={optionValue}
          selectZoneItem={projectItemSelect}
          submitHandler={() => {
            refRBSheet.current.close();
            getOrganizationData();
          }}
          isDateVisible={false}
          forProject={true}
        />
      </RBSheet>
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
});

export default OrganizationList;
