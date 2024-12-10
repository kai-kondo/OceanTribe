import React, { useState } from "react";
import {
  View,
  TextInput,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { getDatabase, ref, push } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import * as ImagePicker from "expo-image-picker";

const availableTags = [
  "サーフィン",
  "ボディボード",
  "ウィンドサーフィン",
  "ライフセービング",
  "ビーチスポーツ",
  "マリーンスポーツ",
  "その他",
];

const CommunityCreateScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null); // 画像URL
  const [uploading, setUploading] = useState(false); // アップロード状態
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // 選択されたタグ

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("エラー", "画像選択に失敗しました");
      console.error(error);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      const blob = await fetch(uri).then((response) => response.blob());
      const storage = getStorage();
      const imageRef = storageRef(
        storage,
        `community_images/${Date.now()}.jpg`
      );

      const snapshot = await uploadBytes(imageRef, blob);
      return await getDownloadURL(snapshot.ref); // 画像のURLを取得
    } catch (error) {
      Alert.alert("エラー", "画像アップロードに失敗しました");
      console.error(error);
      throw error; // エラー発生時にはエラーを投げる
    }
  };

  const handleCreateCommunity = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("エラー", "タイトルと説明を入力してください");
      return;
    }

    setUploading(true);

    try {
      let imageUrl = "";
      if (image) {
        imageUrl = await uploadImage(image); // 画像をアップロードしてURLを取得
      }

      const db = getDatabase();
      const communitiesRef = ref(db, "communities");

      await push(communitiesRef, {
        title,
        description,
        imageUrl,
        tags: selectedTags,
      });

      Alert.alert("成功", "コミュニティが作成されました");
      navigation.goBack(); // 作成後に前の画面に戻る
    } catch (error) {
      console.error("コミュニティ作成エラー:", error);
      Alert.alert("エラー", "コミュニティの作成に失敗しました");
    } finally {
      setUploading(false); // アップロード状態をリセット
    }
  };

  // タグの選択を切り替える
  const toggleTagSelection = (tag: string) => {
    setSelectedTags((prevSelectedTags) =>
      prevSelectedTags.includes(tag)
        ? prevSelectedTags.filter((selectedTag) => selectedTag !== tag)
        : [...prevSelectedTags, tag]
    );
  };

  return (
    <View style={styles.container}>
      {/* タグ選択 */}
      <View style={styles.tagsContainer}>
        {availableTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tagButton,
              selectedTags.includes(tag) && styles.selectedTagButton,
            ]}
            onPress={() => toggleTagSelection(tag)}
          >
            <Text
              style={[
                styles.tagText,
                selectedTags.includes(tag) && styles.selectedTagText,
              ]}
            >
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="タイトル"
        style={styles.input}
      />
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="説明"
        style={styles.input}
      />
      <TouchableOpacity onPress={pickImage}>
        <Text>画像を選択</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.image} />}

      <TouchableOpacity onPress={handleCreateCommunity} disabled={uploading}>
        <Text>{uploading ? "アップロード中..." : "コミュニティ作成"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  tagButton: {
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    padding: 10,
    margin: 5,
  },
  selectedTagButton: {
    backgroundColor: "#4C8BF5",
  },
  tagText: {
    fontSize: 16,
    color: "#555",
  },
  selectedTagText: {
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 10,
  },
});

export default CommunityCreateScreen;
