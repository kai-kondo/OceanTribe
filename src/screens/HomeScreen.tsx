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
import { Video, ResizeMode } from "expo-av"; // Expoを使用している場合

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
    },
    {
      id: "2",
      user: "Jiro",
      content: "週末にビーチに行ってリラックスしました。",
      avatarUrl: "https://via.placeholder.com/50",
      media: "https://via.placeholder.com/300x200", // 画像の例
      time: "1時間前",
    },
    {
      id: "3",
      user: "Hanako",
      content: "新しいボードを買ったので紹介します！",
      avatarUrl: "https://via.placeholder.com/50",
      media: "https://www.w3schools.com/html/mov_bbb.mp4", // 動画の例
      time: "3時間前",
    },
  ];

  const renderPostItem = ({ item }: any) => (
    <View style={styles.postCard}>
      {/* ヘッダー部分 */}
      <View style={styles.postHeader}>
        <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        <View>
          <Text style={styles.userName}>{item.user}</Text>
          <Text style={styles.postTime}>{item.time}</Text>
        </View>
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
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
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
});

export default HomeScreen;
