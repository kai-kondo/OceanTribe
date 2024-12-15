import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
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
  });

  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [userCommunities, setUserCommunities] = useState<any[]>([]);
  const [userPosts, setUserPosts] = useState<any[]>([]);

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
          });
        }
      });

      // ユーザー関連イベント取得
      const eventsRef = dbRef(db, "events");
      get(eventsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const eventsData = snapshot.val() || {};
          const eventsArray = Object.entries(eventsData).map(
            ([id, event]: any) => ({
              id,
              ...event,
            })
          );
          setUserEvents(eventsArray);
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
      {profileData.mediaUrl ? (
        <Image
          source={{ uri: profileData.mediaUrl }}
          style={styles.profileImage}
        />
      ) : (
        <Text>No Image</Text>
      )}
      <Text style={styles.userName}>{profileData.username}</Text>
      <Text>ホームポイント: {profileData.homePoint}</Text>
      <Text>ボードタイプ: {profileData.boardType}</Text>
      <Text>{profileData.bio}</Text>
    </View>
  );

  const PostsSection = () => (
    <FlatList
      data={userPosts}
      renderItem={({ item }) => (
        <View style={styles.card}>
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
    <FlatList
      data={userEvents} // データを親 FlatList に渡しています。
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text>{item.title}</Text>
          <Text>{item.date}</Text>
        </View>
      )}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          {/* ユーザープロフィール表示 */}
          <ProfileHeader />

          {/* イベントセクション */}
          <Text style={styles.sectionHeader}>イベント</Text>
          <FlatList
            data={userEvents}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text>{item.title}</Text>
                <Text>{item.date}</Text>
                {item.mediaUrl && (
                  <View style={styles.mediaContainer}>
                    <Image
                      source={{ uri: item.mediaUrl }}
                      style={styles.media}
                    />
                  </View>
                )}
              </View>
            )}
          />

          {/* コミュニティセクション */}
          <Text style={styles.sectionHeader}>コミュニティ</Text>
          <FlatList
            data={userCommunities}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text>{item.title}</Text>
                <Text>{item.description}</Text>
                {item.imageUrl && (
                  <View style={styles.mediaContainer}>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.media}
                    />
                  </View>
                )}
              </View>
            )}
          />

          {/* 投稿一覧セクション */}
          <Text style={styles.sectionHeader}>投稿一覧</Text>
          <PostsSection />
        </>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  profileContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 24,
  },
  tabButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  tabButton: {
    paddingVertical: 10,
    backgroundColor: "#ccc",
    borderRadius: 5,
  },
  activeTab: {
    backgroundColor: "#007BFF",
  },
  sectionHeader: {
    fontWeight: "bold",
    fontSize: 20,
    paddingVertical: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
  },
  mediaContainer: {
    marginVertical: 10,
  },
  media: {
    width: "100%", // 親コンテナの幅いっぱいに表示
    height: 200,
    borderRadius: 10,
    resizeMode: "cover", // 画像が縦横比を保ちつつ、親コンテナにフィットするよう調整
  },
  postDetails: {
    fontSize: 16,
    marginLeft: 5,
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoColumn: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  infoIcon: {
    width: 24,
    height: 24,
    marginRight: 5,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  actionButton: {
    alignItems: "center",
  },
  actionIcon: {
    width: 20,
    height: 20,
  },
  actionButtonText: {
    fontSize: 12,
  },

  section: {
    marginVertical: 10,
  },
});

export default ProfileScreen;
