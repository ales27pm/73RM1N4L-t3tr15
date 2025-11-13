import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NotificationSettingsScreen from "../screens/Notifications/NotificationSettingsScreen";
import AppInformationScreen from "../screens/Settings/AppInformationScreen";
import type { SettingsStackParamList } from "./types";

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export const SettingsNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
    <Stack.Screen name="AppInformation" component={AppInformationScreen} />
  </Stack.Navigator>
);

export default SettingsNavigator;
