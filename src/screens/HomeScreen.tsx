import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  RefreshControl,
} from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const { width } = Dimensions.get("window");
const auth = getAuth();

const StarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Text key={i} style={i < rating ? styles.filledStar : styles.emptyStar}>
        {"★"}
      </Text>
    );
  }
  return <View style={styles.starContainer}>{stars}</View>;
};

const HomeScreen = ({ navigation }: any) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [users, setUsers] = useState<any>({}); // ユーザー情報を格納
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // ここでデータを再取得
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  useEffect(() => {
    const db = getDatabase();

    // "posts"データを取得
    const postsRef = ref(db, "posts");
    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      const formattedPosts = data
        ? Object.entries(data).map(([id, post]: [string, any]) => ({
            id,
            ...post,
          }))
        : [];
      setPosts(formattedPosts);
    });

    // "communities"データを取得
    const communitiesRef = ref(db, "communities");
    onValue(communitiesRef, (snapshot) => {
      const data = snapshot.val();
      const formattedCommunities = data
        ? Object.entries(data).map(([id, community]: [string, any]) => ({
            id,
            ...community,
          }))
        : [];
      setCommunities(formattedCommunities);
    });

    // "events"データを取得
    const eventsRef = ref(db, "events");
    onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      const formattedEvents = data
        ? Object.entries(data).map(([id, event]: [string, any]) => ({
            id,
            ...event,
          }))
        : [];
      setEvents(formattedEvents);
    });

    // Firebase Auth のユーザーデータを監視
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // ユーザーがログインしている場合、追加情報を取得
        const userRef = ref(db, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          const userDataFromDb = snapshot.val();
          if (userDataFromDb) {
            setUserData({ ...user, ...userDataFromDb }); // AuthデータとDBデータを統合
          }
        });
      } else {
        setUserData(null); // ユーザーがログアウトした場合
      }
    });

    // すべてのユーザー情報を一度に取得
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      setUsers(data || {});
    });

    return () => unsubscribe(); // コンポーネントのクリーンアップ時にリスナーを解除
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <Image
        source={require("../assets/icons/OceanTribeLogo.png")}
        style={styles.logo}
      />
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconButton}>
          <Image
            source={require("../assets/icons/notifi.png")}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate("Profile")}
        >
          {userData?.mediaUrl ? (
            <Image
              source={{ uri: userData.mediaUrl }}
              style={styles.profilePic}
            />
          ) : (
            <Image
              source={require("../assets/icons/comment.png")}
              style={styles.profilePic}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEventItem = ({ item }: any) => (
    <TouchableOpacity style={styles.eventCard}>
      <Image source={{ uri: item.mediaUrl }} style={styles.eventImage} />
      <View style={styles.eventOverlay}>
        <Text style={styles.eventDate}>
          {new Date(item.date).toLocaleDateString("ja-JP", {
            month: "short",
            day: "numeric",
          })}
        </Text>
      </View>
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.eventParticipants}>
          {item.participants || 0}人参加予定
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderCommunityItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.communityCard}
      onPress={() =>
        navigation.navigate("CommunityDetail", { community: item })
      }
    >
      <Image source={{ uri: item.imageUrl }} style={styles.communityImage} />
      <View style={styles.communityInfo}>
        <Text style={styles.communityTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.communityMembers}>
          {item.memberCount || 0}メンバー
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderPostItem = ({ item }: any) => {
    const postUserData = users[item.userId] || {};

    return (
      <TouchableOpacity style={styles.postCard}>
        <View style={styles.postHeader}>
          <Image
            source={{
              uri: postUserData.mediaUrl || "https://via.placeholder.com/50",
            }}
            style={styles.postUserImage}
          />
          <View style={styles.postUserInfo}>
            <Text style={styles.postUserName}>
              {postUserData.username || "不明ユーザー"}
            </Text>
            <Text style={styles.postTime}>
              {new Date(item.createdAt).toLocaleDateString("ja-JP", {
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        {item.mediaUrl && (
          <Image source={{ uri: item.mediaUrl }} style={styles.postImage} />
        )}

        <View style={styles.postContent}>
          <Text style={styles.spotName}>{item.surfSpotName}</Text>
          <Text style={styles.postText} numberOfLines={3}>
            {item.comment}
          </Text>

          <View style={styles.postStats}>
            <View style={styles.statItem}>
              <Image
                source={require("../assets/icons/wave.png")}
                style={styles.statIcon}
              />
              <Text style={styles.statText}>{item.waveHeight}</Text>
            </View>
            {item.reviewStars && <StarRating rating={item.reviewStars} />}
          </View>

          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Image
                source={require("../assets/icons/like.png")}
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>いいね</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Image
                source={require("../assets/icons/comment.png")}
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>コメント</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPostItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={() => (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>注目のイベント</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {events.map((event) => (
                  <View key={event.id} style={{ marginRight: 12 }}>
                    {renderEventItem({ item: event })}
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>人気のコミュニティ</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {communities.map((community) => (
                  <View key={community.id} style={{ marginRight: 12 }}>
                    {renderCommunityItem({ item: community })}
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>みんなの投稿</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  logo: {
    width: 120,
    height: 32,
    resizeMode: "contain",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: "#666666",
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 16,
  },
  section: {
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    paddingHorizontal: 16,
    color: "#333333",
  },
  eventCard: {
    width: width * 0.7,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginLeft: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#E0E0E0",
  },
  eventOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 6,
    borderRadius: 4,
  },
  eventDate: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  eventInfo: {
    padding: 12,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333333",
  },
  eventParticipants: {
    fontSize: 12,
    color: "#666666",
  },
  communityCard: {
    width: width * 0.4,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginLeft: 16,
  },
  communityImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#E0E0E0",
  },
  communityInfo: {
    padding: 12,
  },
  communityTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333333",
  },
  communityMembers: {
    fontSize: 12,
    color: "#666666",
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  postUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postUserInfo: {
    flex: 1,
  },
  postUserName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333333",
  },
  postTime: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  postImage: {
    width: "100%",
    height: width,
    backgroundColor: "#E0E0E0",
  },
  postContent: {
    padding: 12,
  },
  spotName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333333",
  },
  postText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  postStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  statIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  statText: {
    fontSize: 13,
    color: "#666666",
  },
  postActions: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  actionIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
    tintColor: "#666666",
  },
  actionText: {
    fontSize: 13,
    color: "#666666",
  },
  divider: {
    height: 8,
    backgroundColor: "#F5F5F5",
  },
  filledStar: {
    color: "#FFD700", // 金色の星
    fontSize: 20, // 星のサイズを設定
  },
  emptyStar: {
    color: "#D3D3D3", // グレーの星
    fontSize: 20, // 星のサイズを設定
  },
  starContainer: {
    flexDirection: "row", // 星を横に並べる
    alignItems: "center", // 中央揃え
  },
  iconButton: {
    padding: 10, // パディングを設定
    borderRadius: 5, // 角を丸める
    backgroundColor: "#f0f0f0", // 背景色を設定
  },
  profileButton: {
    padding: 10, // パディングを設定
    borderRadius: 5, // 角を丸める
    backgroundColor: "#f0f0f0", // 背景色を設定
  },
});

export default HomeScreen;
