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
import { getAuth } from "firebase/auth";
import {
  getDatabase,
  ref as dbRef,
  query,
  orderByChild,
  get,
} from "firebase/database";

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
    },
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
    <View style={styles.profileContainer}>
      {/* プロフィール情報の上部: 画像、名前、ホームポイント、ボードタイプ */}
      <View style={styles.profileTop}>
        <Image
          source={{ uri: profileData.mediaUrl }}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{profileData.username}</Text>

          {/* ホームポイントとボードタイプ */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Image
                source={require("../assets/icons/wave2.png")}
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>
                ホームポイント: {profileData.homePoint}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Image
                source={require("../assets/icons/surf.png")}
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>
                ボードタイプ: {profileData.boardType}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 自己紹介 */}
      <Text style={styles.bio}>{profileData.bio}</Text>

      {/* SNSリンク */}
      <View style={styles.socialLinksContainer}>
        {profileData.socialLinks?.instagram && (
          <TouchableOpacity
            onPress={() => openLink(profileData.socialLinks.instagram)}
          >
            <Image
              source={require("../assets/icons/Instagram_Glyph_Gradient.png")}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
        )}
        {profileData.socialLinks?.twitter && (
          <TouchableOpacity
            onPress={() => openLink(profileData.socialLinks.twitter)}
          >
            <Image
              source={require("../assets/icons/logo-black.png")}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
        )}
        {profileData.socialLinks?.facebook && (
          <TouchableOpacity
            onPress={() => openLink(profileData.socialLinks.facebook)}
          >
            <Image
              source={require("../assets/icons/Facebook_Logo_Primary.png")}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../assets/icons/OceanTribeLogo.png")}
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>プロフィール</Text>
        <View style={styles.spacer} />
      </View>

      <FlatList
        data={userCommunities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <>
            {/* コミュニティセクション */}
            <View style={styles.sectionHeaderContainer}>
              <Image
                source={require("../assets/icons/community2.png")} // アイコンのパス
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionHeader}>参加コミュニティ</Text>
            </View>
            <FlatList
              data={userCommunities}
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

                  <Text style={styles.titleText}>{item.title}</Text>
                </View>
              )}
            />

            <View style={styles.sectionHeaderContainer}>
              <Image
                source={require("../assets/icons/post.png")} // アイコンのパス
                style={styles.sectionIcon}
              />
              <Text style={styles.sectionHeader}>ポスト</Text>
            </View>
            <PostsSection />
          </>
        )}
        ListHeaderComponent={
          <>
            {/* ユーザープロフィール表示 */}
            <ProfileHeader />
            {/* その他の内容 */}
          </>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "fff", // 海を感じさせる淡い青
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#008CBA", // 濃い青色に変更
    backgroundColor: "#008CBA", // 海を連想する深い青
  },
  logo: { width: 50, height: 50, resizeMode: "contain" },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  spacer: {
    flex: 1, // 空のスペースを作るために追加
  },
  // Profile styles
  profileContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  profileTop: {
    flexDirection: "row", // 横並び
    alignItems: "flex-start", // 上揃え
    marginBottom: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#008CBA",
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
    marginTop: 10, // 上部にスペースを追加
  },
  userName: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#008CBA",
    marginBottom: 10, // ユーザー名と他の情報の間にスペース
  },
  detailsContainer: {
    marginTop: 10, // 上部にスペースを追加
  },
  detailItem: {
    flexDirection: "row", // アイコンとテキストを横並び
    alignItems: "center", // 縦方向の中央揃え
    marginBottom: 8, // 各項目の間にスペース
  },
  detailIcon: {
    width: 20,
    height: 20,
    marginRight: 8, // アイコンとテキスト間のスペース
  },
  detailText: {
    fontSize: 14,
    color: "#333", // テキストの色を少し暗くして視認性を高める
  },
  bioContainer: {
    flexDirection: "row", // 自己紹介とSNSアイコンを横並び
    alignItems: "center", // 縦方向で中央揃え
    justifyContent: "space-between", // 自己紹介とSNSを分割
    marginTop: 10,
  },
  bio: {
    fontSize: 18,
    color: "#666",
    flex: 1, // SNSリンクとスペースを調整
    marginRight: 10, // アイコンとの間にスペース
  },
  socialLinksContainer: {
    flexDirection: "row", // SNSアイコンを横並びに配置
  },
  socialIcon: {
    width: 23, // アイコンサイズ
    height: 23,
    marginLeft: 5, // 各アイコン間のスペース
  },

  // Communities styles
  communitiesCard: {
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
    marginBottom: 15,
    width: 180,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  communityMedia: {
    width: "100%",
    height: 140,
    borderRadius: 8,
    resizeMode: "cover",
  },

  titleText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
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
    marginRight: 10, // アイコンとテキストの間にスペースを追加
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
  communityMediaContainer: {
    marginVertical: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
});

export default ProfileScreen;
