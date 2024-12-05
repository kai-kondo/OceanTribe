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
  Event: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

const HomeScreen = ({ navigation }: Props) => {
  const postsData = [
    {
      id: "1",
      user: "Taro",
      content: "今日は素晴らしい波に乗れました！",
      imageUrl: "https://via.placeholder.com/400", // サンプル画像URL
      time: "2時間前",
    },
    {
      id: "2",
      user: "Jiro",
      content: "新しいボードを購入しました！とても良い感じです！",
      imageUrl: "https://via.placeholder.com/400",
      time: "5時間前",
    },
    {
      id: "3",
      user: "Hanako",
      content: "週末にビーチで清掃活動に参加しました。",
      imageUrl: "https://via.placeholder.com/400",
      time: "1日前",
    },
  ];

  const renderPostItem = ({ item }: any) => (
    <View style={styles.postCard}>
      {/* ユーザー情報 */}
      <View style={styles.postHeader}>
        <Text style={styles.userName}>{item.user}</Text>
        <Text style={styles.postTime}>{item.time}</Text>
      </View>
      {/* 投稿内容 */}
      <Text style={styles.postContent}>{item.content}</Text>
      {/* 投稿画像 */}
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Image
          source={require("../assets/icons/OceanTribe2.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>YOURTRUST</Text>
      </View>

      {/* 投稿リスト */}
      <FlatList
        data={postsData}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.postsContainer}
      />

      {/* ナビゲーションバー */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonText}>ホーム</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("CreateEvent")}
        >
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
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#3498db",
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 10,
  },
  postsContainer: {
    padding: 10,
  },
  postCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  postTime: {
    fontSize: 12,
    color: "#95a5a6",
  },
  postContent: {
    fontSize: 14,
    color: "#2c3e50",
    marginBottom: 10,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
  },
  navBar: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#34495e",
    paddingVertical: 10,
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#2c3e50",
  },
  navButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ecf0f1",
  },
});

export default HomeScreen;
