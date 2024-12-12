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
  comment?: string; // 追加
  congestion?: string; // 追加
  createdAt?: string; // 追加
  reviewStars?: number; // 追加
  selectedArea?: string; // 追加
  surfDate?: string; // 追加
  surfSpotName?: string; // 追加
  surfTime?: string; // 追加
  waveCondition?: string; // 追加
  waveHeight?: string; // 追加
  mediaUrl?: string; // 追加
  reviewCount?: string
};

type User = {
  username: string;
  avatarUrl?: string;
  boardType?: string;
  homePoint?: string;
  mediaUrl?: string;
};

const SpotSharingScreen = () => {
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
        {/* ユーザー情報 */}
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
              ボードタイプ: {user?.boardType || "不明"}
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
        <View style={styles.postContentContainer}>

        </View>
        {/* コンテンツ */}
        <Text style={styles.postContent}>{item.content}</Text>

        {/* 詳細情報 */}
        {item.comment && (
          <Text style={styles.postDetails}>コメント: {item.comment}</Text>
        )}

        {item.congestion && (
          <View style={styles.infoRow}>
            <Image
              source={require("../assets/icons/congestion.png")}
              style={styles.infoIcon}
            />
            <Text style={styles.postDetails}>混雑度: {item.congestion}</Text>
          </View>
        )}
        {item.createdAt && (
          <View style={styles.infoRow}>
            <Image
              source={require("../assets/icons/pin.png")}
              style={styles.infoIcon}
            />
            <Text style={styles.postDetails}>作成日時: {item.createdAt}</Text>
          </View>
        )}
        {item.surfSpotName && (
          <View style={styles.infoRow}>
            <Image
              source={require("../assets/icons/spot.png")}
              style={styles.infoIcon}
            />
            <Text style={styles.postDetails}>
              スポット: {item.surfSpotName}
            </Text>
          </View>
        )}
        {item.surfDate && item.surfTime && (
          <View style={styles.infoRow}>
            <Image
              source={require("../assets/icons/clock.png")}
              style={styles.infoIcon}
            />
            <Text style={styles.postDetails}>
              日時: {item.surfDate} {item.surfTime}
            </Text>
          </View>
        )}
        {item.waveCondition && (
          <View style={styles.infoRow}>
            <Image
              source={require("../assets/icons/wave.png")}
              style={styles.infoIcon}
            />
            <Text style={styles.postDetails}>
              波の状態: {item.waveCondition}
            </Text>
          </View>
        )}
        {item.waveHeight && (
          <View style={styles.infoRow}>
            <Image
              source={require("../assets/icons/height.png")}
              style={styles.infoIcon}
            />
            <Text style={styles.postDetails}>波の高さ: {item.waveHeight}</Text>
          </View>
        )}
        {item.reviewStars && (
          <View style={styles.infoRow}>
            <Text style={styles.postDetails}>
              評価平均: {item.reviewStars}⭐（レビュー数: {item.reviewCount}件）
            </Text>
          </View>
        )}

        {/* メディア */}
        {item.mediaUrl && (
          <View style={styles.mediaContainer}>
            <Image source={{ uri: item.mediaUrl }} style={styles.media} />
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
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.timeline}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("SpotDetail")}
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
  mediaContainer: {
    width: "100%",
    aspectRatio: 1, // 正方形を維持
    backgroundColor: "#F9F9F9",
  },
  media: {
    flex: 1,
    resizeMode: "cover",
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
  reviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginVertical: 8,
  },

  reviewStar: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },

  reviewCount: {
    fontSize: 14,
    color: "#555",
    paddingLeft: 8,
    alignSelf: "center",
  },

  postDetails: {
    fontSize: 15,
    color: "#333",
    paddingHorizontal: 12,
    paddingVertical: 2,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },

  infoIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: "contain",
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
    alignItems: "center",
    padding: 10,
  },

  actionIcon: {
    width: 24,
    height: 24,
    tintColor: "#555",
  },

  actionButtonText: {
    fontSize: 14,
    color: "#555",
  },

  postCard: {
    backgroundColor: "#FFFFFF",
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    overflow: "hidden",
  },

  postContent: {
    fontSize: 16,
    color: "#444",
    paddingHorizontal: 12,
    lineHeight: 22,
  },

  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },

  postContentContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  postMedia: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: "cover",
  },

  postContentText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 20,
    flex: 1, // テキストがスペースを最大限に占有
  },
});

export default SpotSharingScreen;
