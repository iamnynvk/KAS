import React from "react";
import { Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setUserRole } from "../../Slice/userSlice";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { COLORS, FONT, images } from "../../Constants";

import Home from "../../Screens/Tabs/Home";
import Scan from "../../Screens/Tabs/Scan";
import CheckIn from "../../Screens/Tabs/CheckIn";
import Monitor from "../../Screens/Tabs/Monitor";
import Tickets from "../../Screens/Tabs/Tickets";
import RecordTable from "../../Screens/Tabs/RecordTable";

const TabNavigation = () => {
  const dispatch = useDispatch();
  const Tab = createBottomTabNavigator();
  const { roles } = useSelector((state: any) => state.user);
  const { userRole } = useSelector((state: any) => state.user);
  const { language } = useSelector((state: any) => state.Preference);
  const user_type_pk = [5, 7, 8, 10];

  const tabList = [
    {
      name: "Home",
      component: Home,
      title: language.home,
      icon: images.home,
    },
    {
      name: "CheckIn",
      component: userRole === 5 ? RecordTable : CheckIn,
      title: language.checkin,
      icon: images.calendar,
    },
    {
      name: "Scan",
      component: Scan,
      title: language.scan,
      icon: images.qrcode,
    },
    {
      name: "Monitor",
      component: Monitor,
      title: language.monitor,
      icon: images.monitor,
    },
    {
      name: "Ticket",
      component: Tickets,
      title: language.ticket,
      icon: images.checklist,
    },
  ];

  const getTabs = (tabListData: any): any => {
    const userRole = roles?.find((item: any) => {
      const role_pk = item?.role?.pk;
      return user_type_pk?.includes(role_pk);
    });

    const userType = userRole?.role?.pk;
    dispatch(setUserRole(userType));

    if (userType === 10) {
      return tabListData.filter(
        (tab: any) => tab.name !== "CheckIn" && tab.name !== "Monitor"
      );
    } else if (userType === 5) {
      return tabListData.filter(
        (tab: any) => tab.name !== "Scan" && tab.name !== "Monitor"
      );
    } else {
      return tabListData;
    }
  };

  const tabs = getTabs(tabList);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.secondary,
      }}
      initialRouteName="Home"
    >
      {/* Mapping for each tab here... */}
      <Tab.Group>
        {tabs?.map((item: any, index: any) => {
          return (
            <Tab.Screen
              key={item?.name}
              name={item?.name}
              component={item?.component}
              options={{
                title: item?.title,
                tabBarIcon: ({ focused }): any => {
                  return (
                    <Image
                      source={item.icon}
                      style={{
                        width: 20,
                        height: 20,
                        tintColor: focused ? COLORS.primary : COLORS.secondary,
                      }}
                    />
                  );
                },
                tabBarLabelStyle: {
                  fontFamily: FONT.notoSansMedium,
                  lineHeight: 15,
                  textAlignVertical: "center",
                  position: "relative",
                  bottom: 3,
                },
              }}
            />
          );
        })}
      </Tab.Group>
    </Tab.Navigator>
  );
};

export default TabNavigation;
