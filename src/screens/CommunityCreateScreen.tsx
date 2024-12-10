import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ref, push, set } from "firebase/database";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const CommunityCreateScreen = ({ navigation }: any) => {
  const [communityTitle, setCommunityTitle] = useState("");
  const [communityDescription, setCommunityDescription] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [communityImage, setCommunityImage] = useState<string | null>(null);

  const availableTags = ["サーフィン", "ライフセービング", "ボディボード"];

  const handleSelectTag = (tag: string) => {
    setSelectedTag(tag);
  };

  const handleSelectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCommunityImage(result.assets[0].uri);
    }
  };

  const handleCreateCommunity = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("エラー", "ログインしてください。");
      return;
    }

    if (!communityTitle || !communityDescription || !selectedTag) {
      Alert.alert("入力エラー", "タイトル、説明、タグを入力してください。");
      return;
    }

    try {
      const database = getDatabase();
      const communitiesRef = ref(database, "communities");
      const newCommunityRef = push(communitiesRef);

      const communityData = {
        title: communityTitle,
        description: communityDescription,
        tag: selectedTag,
        imageUrl: communityImage || "",
        creator: user.uid,
        createdAt: new Date().toISOString(),
      };

      // コミュニティ情報の保存
      await set(newCommunityRef, communityData);
      // コメント用サブコレクション作成部分の修正
      try {
        const commentsRef = ref(
          database,
          `communities/${newCommunityRef.key}/comments`
        );

        // 空の初期化（存在しない場合に作成）
        await set(commentsRef, {});

        console.log("コメントサブコレクションが正常に作成されました！");
      } catch (error) {
        console.error("コメントサブコレクション作成エラー:", error);
        Alert.alert("エラー", "コメント初期化に失敗しました。");
      }

      Alert.alert("成功", "コミュニティ作成完了！", [
        {
          text: "OK",
          onPress: () => navigation.navigate("CommunityScreen"),
        },
      ]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert("エラー", error.message);
      } else {
        Alert.alert("エラー", "不明なエラーが発生しました。");
      }
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}>
        コミュニティ作成
      </Text>

      {/* コミュニティ画像登録ボタン */}
      <TouchableOpacity onPress={handleSelectImage} style={styles.imageButton}>
        {communityImage ? (
          <Image source={{ uri: communityImage }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>＋ 画像を追加</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* コミュニティタイトル入力 */}
      <TextInput
        placeholder="コミュニティタイトル"
        value={communityTitle}
        onChangeText={setCommunityTitle}
        style={styles.input}
      />

      {/* コミュニティ説明入力 */}
      <TextInput
        placeholder="コミュニティの説明"
        value={communityDescription}
        onChangeText={setCommunityDescription}
        multiline
        style={{ ...styles.input, height: 100 }}
      />

      {/* タグ選択UI */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingVertical: 20,
        }}
      >
        {availableTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            onPress={() => setSelectedTag(tag)}
            style={{
              padding: 15,
              backgroundColor: selectedTag === tag ? "#007AFF" : "#ddd",
              borderRadius: 10,
            }}
          >
            <Text style={{ color: selectedTag === tag ? "#fff" : "#000" }}>
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 作成ボタン */}
      <TouchableOpacity onPress={handleCreateCommunity} style={styles.button}>
        <Text style={styles.buttonText}>コミュニティ作成</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  imageButton: {
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 20,
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    fontSize: 20,
    color: "#999",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  tagContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  tagInput: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  addTagButton: {
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 10,
  },
  addTagButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ddd",
    padding: 5,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    marginRight: 5,
  },
  tagRemove: {
    color: "red",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default CommunityCreateScreen;
