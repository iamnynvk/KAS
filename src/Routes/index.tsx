import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import Login from "../Screens/Authentication/Login";
import TabNavigation from "./RootNavigation/TabNavigation";
import Profile from "../Screens/AppScreens/Profile";
import Tasks from "../Screens/AppScreens/Tasks";
import ZoneSelect from "../Screens/AppScreens/ZoneSelect";
import QuestionList from "../Screens/AppScreens/QuestionList";
import Ticket from "../Screens/AppScreens/Ticket";
import TicketView from "../Screens/AppScreens/TicketView";
import ZoneDetail from "../Screens/AppScreens/ZoneDetail";
import Scan from "../Screens/Tabs/Scan";
import OrganizationList from "../Screens/AppScreens/OrganizationList";
import UserManage from "../Screens/AppScreens/UserManage";
import CheckIn from "../Screens/Tabs/CheckIn";
import Camera from "../Screens/AppScreens/CameraModules/Camera";

const index = () => {
  const Stack = createNativeStackNavigator();
  const { accessToken }: any = useSelector((state: any) => state.user);
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={() => ({
          headerShown: false,
        })}
        initialRouteName={accessToken ? "Main" : "Login"}
      >
        <Stack.Group>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Main" component={TabNavigation} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Tasks" component={Tasks} />
          <Stack.Screen name="ZoneSelect" component={ZoneSelect} />
          <Stack.Screen name="QuestionList" component={QuestionList} />
          <Stack.Screen name="AddTicket" component={Ticket} />
          <Stack.Screen name="TicketView" component={TicketView} />
          <Stack.Screen name="ZoneDetail" component={ZoneDetail} />
          <Stack.Screen name="TicketScan" component={Scan} />
          <Stack.Screen name="RecordCheckIn" component={CheckIn} />
          <Stack.Screen name="OrganizationList" component={OrganizationList} />
          <Stack.Screen name="UserManage" component={UserManage} />
          <Stack.Screen name="Camera" component={Camera} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default index;
