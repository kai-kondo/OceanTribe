import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Home: undefined;
  CreateEvent: undefined;
  Forum: undefined;
  NewsFeed: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

const HomeScreen = ({ navigation }: Props) => {
  const eventData = [
    { id: "1", title: "サーフィン大会", date: "2024-12-10" },
    { id: "2", title: "海の清掃活動", date: "2024-12-15" },
  ];

  const forumData = [
    { id: "1", topic: "最近の海のコンディション" },
    { id: "2", topic: "おすすめのサーフボード" },
  ];

  const newsFeedData = [
    { id: "1", user: "Taro", activity: "サーフィンしてきました！" },
    { id: "2", user: "Jiro", activity: "新しいボードを購入しました！" },
  ];

  const renderEventItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDate}>{item.date}</Text>
    </View>
  );

  const renderForumItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("Forum")}
    >
      <Text style={styles.cardTitle}>{item.topic}</Text>
    </TouchableOpacity>
  );

  const renderNewsFeedItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.user}</Text>
      <Text style={styles.cardActivity}>{item.activity}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* コンテンツ部分 */}
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.overlay}>
          {/* ヘッダー */}
          <View style={styles.header}>
            <Image
              source={require("../assets/icons/OceanTribe2.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>OceanTribe</Text>
          </View>

          {/* 機能セクション */}
          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => navigation.navigate("CreateEvent")}
          >
            <Text style={styles.featureButtonText}>イベント作成・参加</Text>
          </TouchableOpacity>

          {/* イベントセクション */}
          <Text style={styles.sectionTitle}>イベント</Text>
          <FlatList
            horizontal
            data={eventData}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
          />

          {/* フォーラムセクション */}
          <Text style={styles.sectionTitle}>掲示板・フォーラム</Text>
          <FlatList
            horizontal
            data={forumData}
            renderItem={renderForumItem}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
          />

          {/* ニュースフィードセクション */}
          <Text style={styles.sectionTitle}>ニュースフィード</Text>
          <FlatList
            horizontal
            data={newsFeedData}
            renderItem={renderNewsFeedItem}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </ScrollView>

      {/* 固定ナビゲーションバー */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonText}>ホーム</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonText}>イベント</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonText}>フォーラム</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  scrollContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: "600",
    color: "#2c3e50",
  },
  featureButton: {
    backgroundColor: "#1abc9c",
    paddingVertical: 12,
    marginBottom: 20,
    alignItems: "center",
    borderRadius: 30,
    elevation: 5,
  },
  featureButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 10,
    marginTop: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#2c3e50",
  },
  cardDate: {
    fontSize: 14,
    color: "#95a5a6",
    marginTop: 5,
  },
  cardActivity: {
    fontSize: 14,
    color: "#95a5a6",
    marginTop: 5,
  },

  // ナビゲーションバーのスタイル
  navBar: {
    flexDirection: "row",
    position: "absolute", // 画面下部に固定
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#2c3e50",
    paddingVertical: 10,
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#7f8c8d",
  },
  navButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
});

export default HomeScreen;
