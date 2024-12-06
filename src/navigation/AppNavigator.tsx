import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaView, Image } from "react-native";

import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import EventScreen from "../screens/EventScreen";
import EventDetailScreen from "../screens/EventDetailScreen";
import NotificationScreen from "../screens/NotificationScreen";
import NewsScreen from "../screens/NewsScreen";
import MessagesScreen from "../screens/MessagesScreen";


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: { backgroundColor: "#FFFFFF" },
        tabBarIcon: ({ focused }) => {
          let iconName;

          switch (route.name) {
            case "ホーム":
              iconName = require("../assets/icons/home.png");
              break;
            case "イベント":
              iconName = require("../assets/icons/event.png");
              break;
            case "ニュース":
              iconName = require("../assets/icons/news.png");
              break;
            case "通知":
              iconName = require("../assets/icons/notification.png");
              break;
            case "メッセージ":
              iconName = require("../assets/icons/chat2.png");
          }

          return <Image source={iconName} style={{ width: 24, height: 24 }} />;
        },
      })}
    >
      <Tab.Screen name="ホーム" component={HomeScreen} />
      <Tab.Screen name="イベント" component={EventScreen} />
      <Tab.Screen name="ニュース" component={NewsScreen} />
      <Tab.Screen name="通知" component={NotificationScreen} />
      <Tab.Screen name="メッセージ" component={MessagesScreen} />
    </Tab.Navigator>
  );
};


const AppNavigator = () => {
  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          {/* MainはTabナビゲーションバーとして統一 */}
          <Stack.Screen
            name="Main"
            component={BottomTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="EventDetail" component={EventDetailScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
};

export default AppNavigator;
