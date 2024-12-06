import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { useNavigation } from '@react-navigation/native';
import NavBar from "../components/NavBar";


const { width } = Dimensions.get("window");

interface NavItem {
  name: string;
  icon: any; // または正確な型 NodeRequire
}

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [currentScreen, setCurrentScreen] = useState("Home");

  const navItems: NavItem[] = [
    { name: "ホーム", icon: require("../assets/icons/home.png") },
    { name: "イベント", icon: require("../assets/icons/event.png") },
    { name: "ニュース", icon: require("../assets/icons/news.png") },
    { name: "通知", icon: require("../assets/icons/notification.png") },
    { name: "メッセージ", icon: require("../assets/icons/chat2.png") },
  ];
  const postsData = [
    {
      id: "1",
      user: "Taro",
      content: "今日は新しいコードを書きました！",
      avatarUrl: "https://via.placeholder.com/50",
      media: null,
      time: "2分前",
      boardType: "ロングボード",
      homePoint: "茅ヶ崎/クソ下", // 追加
    },
    {
      id: "2",
      user: "Jiro",
      content: "週末にビーチに行ってリラックスしました。",
      avatarUrl: "https://via.placeholder.com/50",
      media: "https://via.placeholder.com/300x200", // 画像の例
      time: "1時間前",
      boardType: "ボディーボード",
      homePoint: "千葉北/片貝", // 追加
    },
    {
      id: "3",
      user: "Hanako",
      content: "新しいボードを買ったので紹介します",
      avatarUrl: "https://via.placeholder.com/50",
      media: "https://www.w3schools.com/html/mov_bbb.mp4", // 動画の例
      time: "3時間前",
      boardType: "ショートボード",
      homePoint: "高知/生見", // 追加
    },
  ];

  const renderPostItem = ({ item }: any) => (
    <View style={styles.postCard}>
      {/* ヘッダー部分 */}
      <View style={styles.postHeader}>
        <View style={styles.postHeaderLeft}>
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {item.user}{" "}
              <Text style={styles.boardType}>({item.boardType})</Text>
            </Text>
            <View style={styles.homePointContainer}>
              <Image
                source={require("../assets/icons/surfing.png")} // アイン画像のパス
                style={styles.homePointIcon}
              />
              <Text style={styles.homePointText}>{item.homePoint}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.postTime}>{item.time}</Text>{" "}
        {/* 投稿時間を右上に配置 */}
      </View>

      {/* 投稿内容 */}
      <Text style={styles.postContent}>{item.content}</Text>

      {/*メディア (画像または動画) */}
      {item.media && (
        <View style={styles.mediaContainer}>
          {item.media.endsWith(".mp4") ? (
            <Video
              source={{ uri: item.media }}
              style={styles.media}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
            />
          ) : (
            <Image source={{ uri: item.media }} style={styles.media} />
          )}
        </View>
      )}

      {/* アクションバー */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton}>
          <Image
            source={require("../assets/icons/like.png")}
            style={styles.actionIcon}
          />
          <Text style={styles.actionButtonText}>いいね</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Image
            source={require("../assets/icons/comment.png")}
            style={styles.actionIcon}
          />
          <Text style={styles.actionButtonText}>コメント</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Image
            source={require("../assets/icons/share.png")}
            style={styles.actionIcon}
          />
          <Text style={styles.actionButtonText}>共有</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 上部フッター */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../assets/icons/OceanTribe2.png")} // 正しい相対パスに変更
            style={styles.headerIcon}
          />
          <Text style={styles.headerTitle}>OCEANTRIBE</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity>
            <Image
              source={require("../assets/icons/sarch.png")} // 検索アイコンURL
              style={styles.searchIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={require("../assets/icons/GX011341_FrameGrab_04.jpg")} // アバターイコンのURL
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* タイムライン */}
      <FlatList
        data={postsData}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.timeline}
      />

      {/* ナビゲ���ションバー */}
      <NavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4", // 明るいグレー背景
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#3AAAD2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, // Android用の影強調
    borderBottomWidth: 0, // 角の丸みを無効化するために追加
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headerIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 15,
  },
  timeline: {
    padding: 10,
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    width: width,
    alignSelf: "center",
    borderRadius: 10, // 角丸追加
  },

  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  boardType: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  postTime: {
    fontSize: 12,
    color: "#95A5A6",
  },
  postContent: {
    fontSize: 14,
    color: "#2C3E50",
    marginBottom: 10,
  },
  homePointContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  homePointIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
  homePointText: {
    fontSize: 12,
    color: "#3AAAD2",
    marginLeft: 5,
  },
  mediaContainer: {
    marginBottom: 10,
  },
  media: {
    width: width - 40,
    height: (width - 40) * 0.56,
    borderRadius: 10,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 2,
  },
  actionButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 14,
    color: "#3AAAD2",
    marginLeft: 5,
  },
  actionIcon: {
    width: 16,
    height: 16,
  },
  iconSmall: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  postHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "column",
    justifyContent: "center",
  },
});

export default HomeScreen;
