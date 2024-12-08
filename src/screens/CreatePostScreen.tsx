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
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getDatabase, ref, push } from "firebase/database";
import { getAuth } from "firebase/auth";

const CreatePostScreen = ({ navigation }: any) => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<string | null>(null);

  // メディア選択処理
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
    const user = getAuth().currentUser;

    if (!user) {
      Alert.alert("ログインしていません。再度ログインしてください！");
      return;
    }

    if (!content.trim() && !media) {
      Alert.alert("投稿内容またはメディアを追加してください！");
      return;
    }

    const db = getDatabase();
    const postsRef = ref(db, "posts");

    // Firebase Authenticationからユーザー情報を取得
    const userId = user.uid;
    const username = user.displayName || "匿名ユーザー";

    push(postsRef, {
      userId,
      username,
      content,
      media,
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
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>キャンセル</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.postButton}
            onPress={handlePostSubmit}
          >
            <Text style={styles.postButtonText}>投稿</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <TextInput
            style={styles.input}
            placeholder="いまどうしてる？"
            value={content}
            onChangeText={setContent}
            multiline
          />
        </View>

        {media && (
          <View style={styles.mediaPreviewContainer}>
            {media.endsWith(".mp4") ? (
              <Text style={styles.mediaPlaceholder}>
                動画が選択されています
              </Text>
            ) : (
              <Image source={{ uri: media }} style={styles.mediaPreview} />
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.addMediaButton}
          onPress={handleSelectMedia}
        >
          <Text style={styles.addMediaText}>メディアを追加</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
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
  mediaPreviewContainer: {
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  mediaPreview: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  mediaPlaceholder: {
    // プレースホルダーのスタイルを追加
  },
});

export default CreatePostScreen;
