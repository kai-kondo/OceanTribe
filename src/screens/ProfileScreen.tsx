import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getAuth } from "firebase/auth";
import {
  getDatabase,
  ref as dbRef,
  query,
  orderByChild,
  get,
} from "firebase/database";

const platforms = ["instagram", "twitter", "facebook"] as const;
type SocialPlatform = (typeof platforms)[number];

const socialIcons: Record<SocialPlatform, any> = {
  instagram: require("../assets/icons/Instagram_Glyph_Gradient.png"),
  twitter: require("../assets/icons/logo-black.png"),
  facebook: require("../assets/icons/Facebook_Logo_Primary.png"),
};

const ProfileScreen = () => {
  const currentUser = getAuth().currentUser;

  const [profileData, setProfileData] = useState({
    username: "",
    homePoint: "",
    boardType: "",
    bio: "",
    mediaUrl: "",
    socialLinks: {
      instagram: "",
      twitter: "",
      facebook: "",
    } as Record<SocialPlatform, string>,
  });

  const [userCommunities, setUserCommunities] = useState<any[]>([]);
  const [userPosts, setUserPosts] = useState<any[]>([]);

  const openLink = (url: any) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  useEffect(() => {
    if (currentUser) {
      const db = getDatabase();

      // ユーザープロフィール情報の取得
      const userRef = dbRef(db, `users/${currentUser.uid}`);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setProfileData({
            username: userData.username,
            homePoint: userData.homePoint,
            boardType: userData.boardType,
            bio: userData.bio,
            mediaUrl: userData.mediaUrl || "",
            socialLinks: userData.socialLinks || {},
          });
        }
      });

      // ユーザー関連コミュニティ取得
      const communitiesRef = dbRef(db, "communities");
      get(communitiesRef).then((snapshot) => {
        if (snapshot.exists()) {
          const communitiesData = snapshot.val() || {};
          const communitiesArray = Object.entries(communitiesData).map(
            ([id, community]: any) => ({
              id,
              ...community,
            })
          );
          setUserCommunities(communitiesArray);
        }
      });

      // ユーザー投稿取得
      const postsRef = query(dbRef(db, "posts"), orderByChild("createdAt"));
      get(postsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const postsData = snapshot.val() || {};
          const postsArray = Object.entries(postsData).map(
            ([id, post]: any) => ({
              id,
              ...post,
            })
          );

          const userSpecificPosts = postsArray.filter(
            (post) => post.userId === currentUser.uid
          );
          setUserPosts(userSpecificPosts);
        }
      });
    }
  }, [currentUser]);

  const ProfileHeader = () => (
    <>
      {/* ヘッダー背景グラデーション */}
      <LinearGradient
        colors={["#4A90E2", "#357ABD"]}
        style={styles.headerGradient}
      >
        <View style={styles.profileHeaderContent}>
          {/* プロフィール画像 */}
          <Image
            source={{ uri: profileData.mediaUrl }}
            style={styles.profileImage}
          />

          {/* ユーザー名とステータス */}
          <Text style={styles.userName}>{profileData.username}</Text>

          {/* フォロー情報 */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>426</Text>
              <Text style={styles.statLabel}>フォロワー</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>351</Text>
              <Text style={styles.statLabel}>フォロー中</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userPosts.length}</Text>
              <Text style={styles.statLabel}>投稿</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* プロフィール詳細カード */}
      <View style={styles.profileDetailsCard}>
        {/* ホームポイントとボードタイプ */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Image
              source={require("../assets/icons/wave2.png")}
              style={styles.detailIcon}
            />
            <View>
              <Text style={styles.detailLabel}>ホームポイント</Text>
              <Text style={styles.detailValue}>{profileData.homePoint}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Image
              source={require("../assets/icons/surf.png")}
              style={styles.detailIcon}
            />
            <View>
              <Text style={styles.detailLabel}>ボードタイプ</Text>
              <Text style={styles.detailValue}>{profileData.boardType}</Text>
            </View>
          </View>
        </View>

        {/* 自己紹介 */}
        <Text style={styles.bio}>{profileData.bio}</Text>

        {/* SNSリンク */}
        <View style={styles.socialLinksContainer}>
          {platforms.map(
            (platform) =>
              profileData.socialLinks[platform] && (
                <TouchableOpacity
                  key={platform}
                  style={styles.socialButton}
                  onPress={() => openLink(profileData.socialLinks[platform])}
                >
                  <Image
                    source={socialIcons[platform]}
                    style={styles.socialIcon}
                  />
                  <Text style={styles.socialText}>{platform}</Text>
                </TouchableOpacity>
              )
          )}
        </View>
      </View>
    </>
  );

  const PostsSection = () => (
    <FlatList
      data={userPosts}
      renderItem={({ item }) => (
        <View style={styles.postsCard}>
          {/* 投稿画像 */}
          {item.mediaUrl && (
            <View style={styles.mediaContainer}>
              <Image source={{ uri: item.mediaUrl }} style={styles.media} />
            </View>
          )}

          {/* コメント */}
          {item.comment && (
            <Text style={[styles.postDetails, { fontSize: 16, marginTop: 10 }]}>
              {item.comment}
            </Text>
          )}

          {/* コンテンツ情報グリッド */}
          <View style={styles.infoGrid}>
            {/* 左側 */}
            <View style={styles.infoColumn}>
              {item.surfSpotName && (
                <View style={styles.infoRow}>
                  <Image
                    source={require("../assets/icons/spot.png")}
                    style={styles.infoIcon}
                  />
                  <Text style={styles.postDetails}>{item.surfSpotName}</Text>
                </View>
              )}
              {item.congestion && (
                <View style={styles.infoRow}>
                  <Image
                    source={require("../assets/icons/congestion.png")}
                    style={styles.infoIcon}
                  />
                  <Text style={styles.postDetails}>{item.congestion}</Text>
                </View>
              )}
              {item.reviewStars && (
                <View style={styles.infoRow}>
                  <Text style={styles.postDetails}>
                    おすすめ：⭐{item.reviewStars}
                  </Text>
                </View>
              )}
            </View>

            {/* 右側 */}
            <View style={styles.infoColumn}>
              {item.surfDate && item.surfTime && (
                <View style={styles.infoRow}>
                  <Image
                    source={require("../assets/icons/clock.png")}
                    style={styles.infoIcon}
                  />
                  <Text style={styles.postDetails}>
                    {item.surfDate} {item.surfTime}
                  </Text>
                </View>
              )}
              {item.waveCondition && (
                <View style={styles.infoRow}>
                  <Image
                    source={require("../assets/icons/wave.png")}
                    style={styles.infoIcon}
                  />
                  <Text style={styles.postDetails}>{item.waveCondition}</Text>
                </View>
              )}
              {item.waveHeight && (
                <View style={styles.infoRow}>
                  <Image
                    source={require("../assets/icons/height.png")}
                    style={styles.infoIcon}
                  />
                  <Text style={styles.postDetails}>{item.waveHeight}</Text>
                </View>
              )}
            </View>
          </View>

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
      )}
      keyExtractor={(item) => item.id}
    />
  );

  const CommunitySection = ({ communities }:any) => (
    <View>
      <View style={styles.sectionHeaderContainer}>
        <Image
          source={require("../assets/icons/community2.png")} // アイコンのパス
          style={styles.sectionIcon}
        />
        <Text style={styles.sectionHeader}>参加コミュニティ</Text>
      </View>
      <FlatList
        data={communities}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.communitiesCard}>
            {item.imageUrl && (
              <View style={styles.communityMediaContainer}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.communityMedia}
                />
              </View>
            )}
            <Text style={styles.communityTitleText}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>

      {/* メインコンテンツ */}
      <FlatList
        data={userCommunities}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* ユーザープロフィール */}
            <ProfileHeader />
          </>
        }
        renderItem={null} // レンダリングはセクションで行うので無効化
        ListFooterComponent={
          <>
            {/* コミュニティセクション */}
            <CommunitySection communities={userCommunities} />

            {/* ポストセクション */}
            <PostsSection />
          </>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E8F9FF", // 海を感じさせる淡い青
  },
  // Profile styles

  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  profileHeaderContent: {
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingVertical: 15,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  profileDetailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    margin: 15,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  detailIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    tintColor: "#4A90E2",
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  bio: {
    marginTop: 20,
    textAlign: "center", // テキストを中央揃え
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 20,
  },
  socialLinksContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6F8",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  socialIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  socialText: {
    fontSize: 12,
    color: "#666",
  },

  communitiesCard: {
    width: 120,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2, // Android用のシャドウ
  },
  communityMediaContainer: {
    width: 80,
    height: 80,
    borderRadius: 40, // 丸型にする
    overflow: "hidden",
    marginBottom: 8,
  },
  communityMedia: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  communityTitleText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: "#555",
  },

  // Posts styles
  postsCard: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  sectionHeaderContainer: {
    flexDirection: "row", // アイコンとテキストを横並びにする
    alignItems: "center", // 縦方向の中央揃え
    marginBottom: 10, // セクションの間にスペースを追加
  },
  sectionIcon: {
    width: 24, // アイコンの幅
    height: 24, // アイコンの高さ
    marginRight: 10, // アイコンとテキストの間にペースを追加
  },
  sectionHeader: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#008CBA",
  },

  mediaContainer: {
    marginVertical: 10,
  },
  media: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
  },
  postDetails: {
    fontSize: 16,
    marginLeft: 5,
    color: "#666",
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoColumn: {
    width: "48%",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  infoIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  actionButton: {
    alignItems: "center",
  },
  actionIcon: {
    width: 22,
    height: 22,
  },
  actionButtonText: {
    fontSize: 14,
    marginTop: 5,
    color: "#008CBA",
  },
});

export default ProfileScreen;
