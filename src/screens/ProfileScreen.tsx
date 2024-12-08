import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { getAuth } from "firebase/auth";
import { getDatabase, ref as dbRef, get } from "firebase/database";

const SNS_ICONS: { [key: string]: any } = {
  instagram: require("../assets/icons/iconmain3.png"),
  twitter: require("../assets/icons/iconmain3.png"),
  facebook: require("../assets/icons/iconmain3.png"),
};

const ProfileScreen = () => {
  const [profileData, setProfileData] = useState<{
    username: string;
    homePoint: string;
    boardType: string;
    mediaUrl: string;
    socialLinks: {
      instagram: string;
      twitter: string;
      facebook: string;
    };
    bio: string; // 自己紹介文追加
    posts: never[];
  }>({
    username: "",
    homePoint: "",
    boardType: "",
    mediaUrl: "",
    socialLinks: {
      instagram: "",
      twitter: "",
      facebook: "",
    },
    bio: "", // 自己紹介文の初期値
    posts: [],
  });

  const currentUser = getAuth().currentUser;

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

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>プロフィール情報</Text>
      </View>

      {/* ユーザー情報 */}
      <View style={styles.profileContainer}>
        {profileData.mediaUrl && (
          <Image source={{ uri: profileData.mediaUrl }} style={styles.avatar} />
        )}
        <Text style={styles.userName}>{profileData.username}</Text>
        <Text style={styles.bio}>ホームポイント: {profileData.homePoint}</Text>
        <Text style={styles.bio}>ボードタイプ：{profileData.boardType}</Text>

        {/* 自己紹介文表示 */}
        <Text style={styles.bio}>{profileData.bio}</Text>

        {/* 区切り線 */}
        <View style={styles.separator} />

        {/* SNSリンク */}
        <View style={styles.socialContainer}>
          {Object.entries(profileData.socialLinks).map(([platform, link]) =>
            link ? (
              <TouchableOpacity
                key={platform}
                onPress={() => console.log(link)}
              >
                <Image source={SNS_ICONS[platform]} style={styles.snsIcon} />
              </TouchableOpacity>
            ) : null
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: "#3AAAD2", padding: 20 },
  headerTitle: { fontSize: 20, color: "#fff", textAlign: "center" },

  profileContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    elevation: 5,
    marginTop: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    backgroundColor: "#DDD",
  },
  userName: { fontWeight: "bold", fontSize: 24, color: "#2C3E50" },
  bio: { fontSize: 16, paddingVertical: 5, color: "#555" },

  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  snsIcon: {
    width: 50,
    height: 50,
  },
  separator: {
    width: "100%",
    height: 1,
    backgroundColor: "#CCC",
    marginVertical: 15,
  },

});

export default ProfileScreen;
