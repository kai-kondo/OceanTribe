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
import { getAuth } from "firebase/auth";

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
  const [userData, setUserData] = useState<User | null>(null);

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

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, "users");

    const fetchUserData = async () => {
      const user = getAuth().currentUser;
      if (user) {
        const userSnapshot = await get(ref(db, `users/${user.uid}`));
        setUserData(userSnapshot.val() || null);
      }
    };

    fetchUserData();
  }, []);

  const renderPostItem = ({ item }: { item: Post }) => {
    const user = item.userData;

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Image
            source={{ uri: user?.mediaUrl || "https://via.placeholder.com/50" }}
            style={styles.avatar}
          />
          <View style={styles.userInfoContainer}>
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

        <Text style={styles.postContent}>{item.content}</Text>
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
            {userData?.mediaUrl ? (
              <Image
                source={{ uri: userData.mediaUrl }}
                style={styles.avatar}
              />
            ) : (
              <Image
                source={require("../assets/icons/notification.png")}
                style={styles.avatar}
              />
            )}
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
    backgroundColor: "#F5F5F5", // 優しい背景色
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#3AAAD2",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    width: 24,
    height: 24,
    tintColor: "#555555",
    marginRight: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25, // 丸型アバター
    marginRight: 10, // アバターとテキスト間の余白
  },
  timeline: {
    paddingBottom: 10,
  },
  postCard: {
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: "hidden",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  userInfo: {
    marginLeft: 12,
  },
  userInfoContainer: {
    flex: 1, // 横幅を占有
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4, // 項目間の余白
  },
  boardType: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 4,
  },
  homePointContainer: {
    flexDirection: "row", // 横並び
    alignItems: "center",
  },
  homePointIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
    marginRight: 6, // アイコンとテキストの間
  },
  homePointText: {
    fontSize: 14,
    color: "#3AAAD2",
  },
  postContent: {
    fontSize: 15,
    color: "#333333",
    marginVertical: 10,
    paddingHorizontal: 12,
    lineHeight: 20,
  },
  mediaContainer: {
    width: "100%",
    aspectRatio: 1, // 正方形を維持
    backgroundColor: "#F9F9F9",
  },
  media: {
    flex: 1,
    resizeMode: "cover",
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  actionIcon: {
    width: 22,
    height: 22,
    tintColor: "#555555",
    marginRight: 5,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#555555",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#FF5722",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 26,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default HomeScreen;
