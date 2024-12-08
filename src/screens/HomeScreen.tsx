import React, { useEffect, useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { getDatabase, ref, get, onValue } from "firebase/database";

const { width } = Dimensions.get("window");

type Post = {
  id: string;
  userId: string;
  content: string;
  media?: string;
  userData?: User;
};

type User = {
  username: string;
  avatarUrl?: string;
  boardType?: string;
  homePoint?: string;
  mediaUrl?: string;
};

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const db = getDatabase();
    const postsRef = ref(db, "posts");
    const usersRef = ref(db, "users");

    const fetchPostsAndUsers = async () => {
      try {
        const [postsSnapshot, usersSnapshot] = await Promise.all([
          get(postsRef),
          get(usersRef),
        ]);

        const postsData = postsSnapshot.val() || {};
        const usersData = usersSnapshot.val() || {};

        const combinedData = Object.entries(postsData).map(
          ([id, post]: [string, any]) => ({
            id,
            ...post,
            userData: usersData[post.userId] || null,
          })
        );

        setPosts(combinedData);
      } catch (error) {
        console.error("データの取得中にエラーが発生しました:", error);
      }
    };

    // リアルタイムリスナーを追加
    const unsubscribePosts = onValue(ref(db, "posts"), fetchPostsAndUsers);
    const unsubscribeUsers = onValue(ref(db, "users"), fetchPostsAndUsers);

    return () => {
      // コンポーネントのアンマウント時にリスナーを削除
      unsubscribePosts();
      unsubscribeUsers();
    };
  }, []);

  const renderPostItem = ({ item }: { item: Post }) => {
    const user = item.userData;

    return (
      <View style={styles.postCard}>
        <Image
          source={{ uri: user?.mediaUrl || "https://via.placeholder.com/50" }}
          style={styles.avatar}
        />
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.username || "不明ユーザー"}
            </Text>
            <Text style={styles.boardType}>
              使用ボード: {user?.boardType || "不明"}
            </Text>
            <View style={styles.homePointContainer}>
              <Image
                source={require("../assets/icons/surfing.png")}
                style={styles.homePointIcon}
              />
              <Text style={styles.homePointText}>
                ホームポイント: {user?.homePoint || "未設定"}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.postContent}>{item.content}</Text>
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
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../assets/icons/iconmain3.png")}
            style={styles.headerIcon}
          />
          <Text style={styles.headerTitle}>OCEANTRIBE</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity>
            <Image
              source={require("../assets/icons/sarch.png")}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Image
              source={require("../assets/icons/GX011341_FrameGrab_04.jpg")}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.timeline}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreatePost")}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
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

  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#3AAAD2",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Android用
  },
  fabText: {
    fontSize: 30,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default HomeScreen;
