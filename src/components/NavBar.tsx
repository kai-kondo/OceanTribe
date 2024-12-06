import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const navItems = [
  { name: "ホーム", icon: require("../assets/icons/home.png"), route: "Home" },
  {
    name: "イベント",
    icon: require("../assets/icons/event.png"),
    route: "Event",
  },
  {
    name: "ニュース",
    icon: require("../assets/icons/news.png"),
    route: "News",
  },
  {
    name: "通知",
    icon: require("../assets/icons/notification.png"),
    route: "Notification",
  },
  {
    name: "メッセージ",
    icon: require("../assets/icons/chat2.png"),
    route: "Messages",
  },
];

const NavBar = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [currentScreen, setCurrentScreen] = useState(route.name);

  // 画面遷移するたびに状態更新
  useEffect(() => {
    setCurrentScreen(route.name);
  }, [route.name]);

  const handleNavigation = (routeName: string) => {
    navigation.navigate(routeName);
  };

  return (
    <View style={styles.navBar}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          onPress={() => handleNavigation(item.route)}
          style={styles.navItem}
        >
          <Image source={item.icon} style={styles.navIcon} />
          <Text
            style={
              currentScreen === item.route
                ? styles.navTextActive
                : styles.navText
            }
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  navItem: {
    alignItems: "center",
  },
  navIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  navText: {
    fontSize: 12,
    color: "#7F8C8D",
  },
  navTextActive: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#000",
  },
});

export default NavBar;
