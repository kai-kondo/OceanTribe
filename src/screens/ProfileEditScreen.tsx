import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { getAuth } from "firebase/auth";
import {
  getDatabase,
  ref as dbRef,
  update,
  get,
  DataSnapshot,
} from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const ProfileEditScreen = () => {
  const navigation = useNavigation();
  const currentUser = getAuth().currentUser;
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (currentUser) {
      const db = getDatabase();
      const userRef = dbRef(db, `users/${currentUser.uid}`);
      get(userRef).then((snapshot: DataSnapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setProfileData(userData);
        }
      });
    }
  }, [currentUser]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Sorry",
        "We need camera roll permissions to make this work!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();

      const storage = getStorage();
      const imageRef = storageRef(
        storage,
        `profile_images/${currentUser?.uid}`
      );

      try {
        const snapshot = await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(snapshot.ref);
        setProfileData((prev) => ({
          ...prev,
          mediaUrl: downloadURL,
        }));
      } catch (error: any) {
        console.error("Image upload error:", error);
        Alert.alert(
          "エラー",
          "プロフィール画像のアップロードに失敗しました。" +
            (error.code === "storage/unauthorized"
              ? "\n権限がありません。"
              : "\n時間をおいて再度お試しください。")
        );
      }
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const db = getDatabase();
      const userRef = dbRef(db, `users/${currentUser.uid}`);

      await update(userRef, {
        ...profileData,
        updatedAt: new Date().toISOString(),
      });

      Alert.alert("Success", "プロフィールを更新しました", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView>
        <LinearGradient colors={["#4A90E2", "#357ABD"]} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>プロフィール編集</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
            {profileData.mediaUrl ? (
              <Image
                source={{ uri: profileData.mediaUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>タップして写真を選択</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Image
                source={require("../assets/icons/edit.png")}
                style={styles.cameraIcon}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ニックネーム</Text>
              <TextInput
                style={styles.input}
                value={profileData.username}
                onChangeText={(text) =>
                  setProfileData((prev) => ({ ...prev, username: text }))
                }
                placeholder="ニックネームを入力"
                maxLength={20}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ホームポイント</Text>
              <TextInput
                style={styles.input}
                value={profileData.homePoint}
                onChangeText={(text) =>
                  setProfileData((prev) => ({ ...prev, homePoint: text }))
                }
                placeholder="よく行くサーフポイントを入力"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>使用ボード</Text>
              <TextInput
                style={styles.input}
                value={profileData.boardType}
                onChangeText={(text) =>
                  setProfileData((prev) => ({ ...prev, boardType: text }))
                }
                placeholder="使用しているボードを入力"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>自己紹介</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={profileData.bio}
                onChangeText={(text) =>
                  setProfileData((prev) => ({ ...prev, bio: text }))
                }
                placeholder="自己紹介文を入力"
                multiline
                numberOfLines={4}
                maxLength={200}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>SNSリンク</Text>
              <TextInput
                style={styles.input}
                value={profileData.socialLinks.instagram}
                onChangeText={(text) =>
                  setProfileData((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, instagram: text },
                  }))
                }
                placeholder="Instagramのユーザー名"
              />
              <TextInput
                style={styles.input}
                value={profileData.socialLinks.twitter}
                onChangeText={(text) =>
                  setProfileData((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, twitter: text },
                  }))
                }
                placeholder="Twitterのユーザー名"
              />
              <TextInput
                style={styles.input}
                value={profileData.socialLinks.facebook}
                onChangeText={(text) =>
                  setProfileData((prev) => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, facebook: text },
                  }))
                }
                placeholder="Facebookのユーザー名"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? "更新中..." : "保存する"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  header: {
    height: 50,
    paddingTop: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: "#FFFFFF",
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E1E1E1",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  placeholderText: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  editBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#4A90E2",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  cameraIcon: {
    width: 20,
    height: 20,
    tintColor: "#FFFFFF",
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E1E1E1",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 8,
    margin: 16,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProfileEditScreen;
