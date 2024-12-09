import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Linking,
} from "react-native";
import { getAuth } from "firebase/auth";
import { getDatabase, ref as dbRef, get, onValue } from "firebase/database";

const SNS_ICONS: { [key: string]: any } = {
  instagram: require("../assets/icons/Instagram_Glyph_Gradient.png"),
  twitter: require("../assets/icons/logo-black.png"),
  facebook: require("../assets/icons/Facebook_Logo_Primary.png"),
};

type Post = {
  id: string;
  userId: string;
  content: string;
  media?: string;
};

const ProfileScreen = () => {
  const currentUser = getAuth().currentUser;

  const [profileData, setProfileData] = useState({
    username: "",
    homePoint: "",
    boardType: "",
    mediaUrl: "",
    socialLinks: {
      instagram: "",
      twitter: "",
      facebook: "",
    },
    bio: "",
  });

  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [selectedTab, setSelectedTab] = useState<"myPosts" | "likedPosts">(
    "myPosts"
  );

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("リンクを開けませんでした:", error);
    }
  };

  // 投稿データの取得
  useEffect(() => {
    if (currentUser) {
      const postsRef = dbRef(getDatabase(), "posts");

      const unsubscribePosts = onValue(postsRef, (snapshot) => {
        const postsData = snapshot.val() || {};

        const myPostsArray = Object.entries(postsData)
          .filter(([_, post]: any) => post.userId === currentUser.uid)
          .map(([id, post]: any) => ({
            id,
            ...post,
          }));

        setUserPosts(myPostsArray);

        const likedPostsArray = Object.entries(postsData)
          .filter(([_, post]: any) =>
            post.likedUserIds?.includes(currentUser.uid)
          )
          .map(([id, post]: any) => ({
            id,
            ...post,
          }));

        setLikedPosts(likedPostsArray);
      });

      return () => unsubscribePosts();
    }
  }, []);

  // ユーザー情報取得
  useEffect(() => {
    if (currentUser) {
      const userRef = dbRef(getDatabase(), `users/${currentUser.uid}`);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          setProfileData(snapshot.val());
        }
      });
    }
  }, []);

  const renderSnsButtons = () => (
    <View style={styles.socialContainer}>
      {Object.entries(profileData.socialLinks).map(([platform, link]) =>
        link ? (
          <TouchableOpacity key={platform} onPress={() => openLink(link)}>
            <Image source={SNS_ICONS[platform]} style={styles.snsIcon} />
          </TouchableOpacity>
        ) : null
      )}
    </View>
  );

  const renderPostItem = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <Text style={styles.postContent}>{item.content}</Text>
      {item.media && (
        <Image source={{ uri: item.media }} style={styles.postImage} />
      )}
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {(["myPosts", "likedPosts"] as const).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tabButton, selectedTab === tab && styles.activeTab]}
          onPress={() => setSelectedTab(tab as "myPosts" | "likedPosts")}
        >
          <Text style={styles.tabText}>
            {tab === "myPosts" ? "あなたの投稿" : "いいねした投稿"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const getPostsData = () =>
    selectedTab === "myPosts" ? userPosts : likedPosts;

  return (
    <View style={{ flex: 1 }}>
      {/* 固定ヘッダー部分 */}
      <View style={styles.header}>
        <Image
          source={require("../assets/icons/iconmain3.png")}
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>プロフィール</Text>
      </View>
      <View style={styles.container}>
        {/* プロフィール情報 */}
        <View style={styles.profileContainer}>
          {profileData.mediaUrl && (
            <Image source={{ uri: profileData.mediaUrl }} style={styles.avatar} />
          )}
          <Text style={styles.userName}>{profileData.username}</Text>
          {profileData.bio && (
            <Text style={styles.bioText}>{profileData.bio}</Text>
          )}
          <Text style={styles.infoText}>
            ホームポイント: {profileData.homePoint}
          </Text>
          <Text style={styles.infoText}>
            ボードタイプ：{profileData.boardType}
          </Text>

          {renderSnsButtons()}
        </View>

        {/* タブ切り替えボタン */}
        {renderTabs()}

        {/* 投稿リスト表示 */}
        <FlatList
          data={getPostsData()}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.postsContainer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: "#3AAAD2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  profileContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    alignItems: "center",
    marginHorizontal: 15,
    marginTop: 10,
  },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  userName: { fontSize: 24, fontWeight: "bold", color: "#2C3E50" },
  infoText: { fontSize: 16, marginVertical: 4 },
  bioText: { fontStyle: "italic", textAlign: "center", paddingVertical: 5 },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 15,
  },
  snsIcon: { width: 25, height: 25, marginHorizontal: 10 },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  tabButton: { paddingVertical: 8 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: "#007AFF" },
  postCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 3,
  },
  postContent: { fontSize: 16, color: "#333" },
  postImage: { width: "100%", height: 200, borderRadius: 8 },
  postsContainer: { paddingHorizontal: 10 },
  tabText: {
    fontSize: 16,
    color: "#007AFF",
  },
});

export default ProfileScreen;
