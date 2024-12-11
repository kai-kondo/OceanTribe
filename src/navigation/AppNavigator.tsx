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
import EventCreateScreen from "../screens/EventCreateScreen"; // パスを確認・修正
import NotificationScreen from "../screens/SportSharingScreen";
import CommunityScreen from "../screens/CommunityScreen";
import MessagesScreen from "../screens/MessagesScreen";
import CreatePostScreen from "../screens/CreatePostScreen"; // ファイルパスに応じて修正
import ProfileCreateScreen from "../screens/ProfileCreateScreen";
import CommunityDetailScreen from "../screens/CommunityDetailScreen";
import CommunityCreateScreen from "../screens/CommunityCreateScreen";
import SpotSharingScreen from "../screens/SportSharingScreen";
import SpotDetailScreen from '../screens/SpotDetailScreen';


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
            case "コミュニティ":
              iconName = require("../assets/icons/Community.png");
              break;
            case "スポット":
              iconName = require("../assets/icons/sport.png");
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
      <Tab.Screen name="コミュニティ" component={CommunityScreen} />
      <Tab.Screen name="スポット" component={ SpotSharingScreen} />
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
          <Stack.Screen name="CommunityScreen" component={CommunityScreen} />
          <Stack.Screen
            name="CommunityDetail"
            component={CommunityDetailScreen}
          />
          <Stack.Screen
            name="CommunityCreate"
            component={CommunityCreateScreen}
          />

          <Stack.Screen
            name="CreatePost"
            component={CreatePostScreen}
            options={{ title: "新しい投稿" }}
          />
          <Stack.Screen name="EventScreen" component={EventScreen} />
          <Stack.Screen name="EventDetail" component={EventDetailScreen} />
          <Stack.Screen name="EventCreate" component={EventCreateScreen} />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="ProfileCreate" component={ProfileCreateScreen} />
          <Stack.Screen name="Spots" component={SpotSharingScreen} />
          <Stack.Screen name="SpotDetail" component={SpotDetailScreen} />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
};

export default AppNavigator;
