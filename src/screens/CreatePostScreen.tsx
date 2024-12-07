import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getDatabase, ref, push } from "firebase/database";

const CreatePostScreen = ({ navigation }: any) => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<string | null>(null); // メディアのURLを保存

  // メディア選択
  const handleSelectMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMedia(result.assets[0].uri);
    }
  };

  // 投稿処理
  const handlePostSubmit = () => {
    if (!content.trim() && !media) {
      Alert.alert("投稿内容またはメディアを追加してください！");
      return;
    }

    const db = getDatabase(); // FirebaseのRealtime Database
    const postsRef = ref(db, "posts");

    push(postsRef, {
      user: "ユーザー名", // 実際のログインユーザー名を設定
      content,
      media, // メディアURLを追加
      time: new Date().toISOString(),
    })
      .then(() => {
        Alert.alert("投稿しました！");
        navigation.goBack(); // 前の画面に戻る
      })
      .catch((error) => {
        Alert.alert("投稿に失敗しました。", error.message);
      });
  };

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>キャンセル</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postButton} onPress={handlePostSubmit}>
          <Text style={styles.postButtonText}>投稿</Text>
        </TouchableOpacity>
      </View>

      {/* 投稿内容入力 */}
      <View style={styles.contentContainer}>
        <TextInput
          style={styles.input}
          placeholder="いまどうしてる？"
          value={content}
          onChangeText={setContent}
          multiline
        />
      </View>

      {/* メディアプレビュー */}
      {media && (
        <View style={styles.mediaPreviewContainer}>
          {media.endsWith(".mp4") ? (
            <Text style={styles.mediaPlaceholder}>動画が選択されています</Text>
          ) : (
            <Image source={{ uri: media }} style={styles.mediaPreview} />
          )}
        </View>
      )}

      {/* メディア選択ボタン */}
      <TouchableOpacity
        style={styles.addMediaButton}
        onPress={handleSelectMedia}
      >
        <Text style={styles.addMediaText}>メディアを追加</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  cancelText: {
    fontSize: 16,
    color: "#3AAAD2",
  },
  postButton: {
    backgroundColor: "#3AAAD2",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 15,
  },
  postButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  contentContainer: {
    padding: 15,
    flex: 1,
  },
  input: {
    fontSize: 18,
    lineHeight: 22,
    textAlignVertical: "top",
    flex: 1,
  },
  mediaPreviewContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  mediaPreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  mediaPlaceholder: {
    textAlign: "center",
    padding: 20,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    color: "#777",
  },
  addMediaButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#E5E5E5",
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: Platform.OS === "android" ? 20 : 0,
  },
  addMediaText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
  },
});

export default CreatePostScreen;
