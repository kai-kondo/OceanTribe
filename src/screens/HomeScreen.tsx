import React from "react";
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

const { width } = Dimensions.get("window");

const HomeScreen = () => {
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
      content: "新しいボードを買ったので紹介します！",
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
            <Text style={styles.homePoint}>🏄‍♂️ {item.homePoint}</Text>
          </View>
        </View>
        <Text style={styles.postTime}>{item.time}</Text>{" "}
        {/* 投稿時間を右上に配置 */}
      </View>

      {/* 投稿内容 */}
      <Text style={styles.postContent}>{item.content}</Text>

      {/* メディア (画像または動画) */}
      {item.media && (
        <View style={styles.mediaContainer}>
          {item.media.endsWith(".mp4") || item.media.endsWith(".webm") ? (
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
          <Text style={styles.actionButtonText}>いいね</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>コメント</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
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
              source={{ uri: "https://via.placeholder.com/30" }} // 検索アイコンのURL
              style={styles.searchIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={{ uri: "https://via.placeholder.com/40" }} // アバターアイコンのURL
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#F2CB57",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    elevation: 4, // Android向け影
    shadowColor: "#000", // iOS向け影
    shadowOffset: { width: 0, height: 2 }, // iOS影の方向
    shadowOpacity: 0.1, // iOS影の透明度
    shadowRadius: 4, // iOS影のぼかし
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#206E8C",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    width: 30,
    height: 30,
    marginRight: 15,
  },
  timeline: {
    padding: 10,
  },
  postCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
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
    color: "#2c3e50",
  },
  boardType: {
    fontSize: 14,
    color: "#7f8c8d", // 薄いグレーで表示
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

  homePoint: {
    fontSize: 12,
    color: "#3498db", // 青系の文字色
    marginTop: 2, // 少し余白
  },
  mediaContainer: {
    marginBottom: 10,
  },
  media: {
    width: width - 40, // 横幅に合わせる
    height: (width - 40) * 0.56, // 16:9比率
    borderRadius: 10,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#3498db",
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
