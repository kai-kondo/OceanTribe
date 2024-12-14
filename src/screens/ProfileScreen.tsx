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
import { getDatabase, ref as dbRef, query, orderByChild, get } from "firebase/database";

const ProfileScreen = () => {
  const currentUser = getAuth().currentUser;

  const [profileData, setProfileData] = useState({
    username: "",
    homePoint: "",
    boardType: "",
    bio: "",
    mediaUrl: "", // プロフィール画像のURL
  });

  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [userCommunities, setUserCommunities] = useState<any[]>([]);

  const [selectedTab, setSelectedTab] = useState<"events" | "communities">("events");

  useEffect(() => {
    if (currentUser) {
      const db = getDatabase();

      // ユーザープロフィールの取得
      const userRef = dbRef(db, `users/${currentUser.uid}`);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setProfileData({
            username: userData.username,
            homePoint: userData.homePoint,
            boardType: userData.boardType,
            bio: userData.bio,
            mediaUrl: userData.mediaUrl || "", // プロフィール画像のURL
          });
        }
      });

      // 投稿、イベント、コミュニティの取得
      const fetchPosts = query(dbRef(db, "posts"), orderByChild("createdAt"));
      get(fetchPosts).then((snapshot) => {
        if (snapshot.exists()) {
          const postsData = snapshot.val() || {};
          const postsArray = Object.entries(postsData).map(([id, post]: any) => ({
            id,
            ...post,
          }));
          setUserPosts(postsArray);
        }
      });

      // イベントの取得
      const eventsRef = dbRef(db, "events");
      get(eventsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const eventsData = snapshot.val() || {};
          const eventsArray = Object.entries(eventsData).map(([id, event]: any) => ({
            id,
            ...event,
          }));
          setUserEvents(eventsArray);
        }
      });

      // コミュニティの取得
      const communitiesRef = dbRef(db, "communities");
      get(communitiesRef).then((snapshot) => {
        if (snapshot.exists()) {
          const communitiesData = snapshot.val() || {};
          const communitiesArray = Object.entries(communitiesData).map(([id, community]: any) => ({
            id,
            ...community,
          }));
          setUserCommunities(communitiesArray);
        }
      });
    }
  }, [currentUser]);

  const openTab = (tab: "events" | "communities") => {
    setSelectedTab(tab);
  };

  // イベントタブ
  const EventsTab = () => (
    <FlatList
      data={userEvents}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text>{item.date}</Text>
        </View>
      )}
      keyExtractor={(item) => item.id}
    />
  );

  // コミュニティタブ
  const CommunitiesTab = () => (
    <FlatList
      data={userCommunities}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text>{item.description}</Text>
        </View>
      )}
      keyExtractor={(item) => item.id}
    />
  );

  

  return (
    <View style={styles.container}>
      {/* プロフィール情報 */}
      <View style={styles.profileContainer}>
        {profileData.mediaUrl? (
          <Image
            source={{ uri: profileData.mediaUrl }}
            style={styles.profileImage}
          />
        ) : (
          <Text>No profile image</Text> // 画像がない場合
        )}
        <Text style={styles.userName}>{profileData.username}</Text>
        {profileData.bio && <Text style={styles.bioText}>{profileData.bio}</Text>}
        <Text style={styles.infoText}>ホームポイント: {profileData.homePoint}</Text>
        <Text style={styles.infoText}>ボードタイプ: {profileData.boardType}</Text>
      </View>

      {/* シンプルなタブ切り替え */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === "events" && styles.activeTab]}
          onPress={() => openTab("events")}
        >
          <Text style={styles.tabText}>イベント</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === "communities" && styles.activeTab]}
          onPress={() => openTab("communities")}
        >
          <Text style={styles.tabText}>コミュニティ</Text>
        </TouchableOpacity>
      </View>

      {/* タブ内容 */}
      <View style={styles.tabContent}>
        {selectedTab === "events" ? <EventsTab /> : <CommunitiesTab />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
  },
  bioText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginVertical: 10,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 5,
    textAlign: "center",
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    marginRight: 5,
    borderRadius: 5,
  },
  activeTab: {
    backgroundColor: "#007bff",
  },
  tabText: {
    fontSize: 16,
    color: "#333",
  },
  tabContent: {
    flex: 1,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ProfileScreen;
