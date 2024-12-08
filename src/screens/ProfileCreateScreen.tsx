import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, set } from "firebase/database";
import { storage } from "../services/firebase";
import { getAuth } from "firebase/auth";

const boardTypes = ["ショートボード", "ロングボード", "ミッドレングス", "ボディーボード", "スキムボード","マリブボード"];

const ProfileCreateScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState("");
  const [homePoint, setHomePoint] = useState("");
  const [boardType, setBoardType] = useState(boardTypes[0]);
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [instagramUrl, setInstagramUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [bio, setBio] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const openBoardModal = () => setModalVisible(true);
  const closeBoardModal = () => setModalVisible(false);

  const selectBoardType = (type: any) => {
    setBoardType(type);
    closeBoardModal();
  };


    const handleSelectMedia = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setMediaUri(result.assets[0].uri);
      }
    };

  const handleSaveProfile = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("エラー発生", "ユーザーがログインしていません。");
        return;
      }

      try {
        let mediaUrl = "";

        if (mediaUri) {
          const response = await fetch(mediaUri);
          const blob = await response.blob();
          const mediaRef = ref(storage, `profiles/${Date.now()}.jpg`);
          await uploadBytes(mediaRef, blob);
          mediaUrl = await getDownloadURL(mediaRef);
        }

        const database = getDatabase();
        const userProfile = {
          username,
          homePoint,
          boardType,
          mediaUrl,
          bio,
          socialLinks: {
            instagram: instagramUrl,
            twitter: twitterUrl,
            facebook: facebookUrl,
          },
        };

        const userRef = dbRef(database, `users/${user.uid}`);
        await set(userRef, userProfile);

        Alert.alert("プロフィール作成完了！");
        navigation.navigate("Main", { screen: "Home" });
      } catch (error: any) {
        Alert.alert("エラー発生", error.message);
      }
    };

    return (
      <View style={{ flex: 1 }}>
        {/* 固定ヘッダー部分 */}
        <View style={styles.header}>
          <Image
            source={require("../assets/icons/iconmain3.png")}
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>プロフィール作成</Text>
        </View>

        {/* コンテンツ部分 */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.container}>
            {/* アバター画像 */}
            <Text style={styles.sectionTitle}>基本情報</Text>
            <TouchableOpacity onPress={handleSelectMedia}>
              {mediaUri ? (
                <Image source={{ uri: mediaUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text>プロフ画像</Text>
                </View>
              )}
            </TouchableOpacity>
            {/* ユーザー名入力 */}r
            <TextInput
              placeholder="ユーザー名"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
            />
            <TextInput
              placeholder="ホームポイント"
              value={homePoint}
              onChangeText={setHomePoint}
              style={styles.input}
            />
            <TextInput
              placeholder="自己紹介文"
              value={bio} // 自己紹介文入力フィールド追加
              onChangeText={setBio}
              style={[styles.input, { height: 100 }]}
              multiline
            />

            {/* ボードタイプ選択 */}
            <Text style={styles.sectionTitle}>使用ボード</Text>
            <TouchableOpacity
              onPress={openBoardModal}
              style={styles.boardButton}
            >
              <Text style={styles.boardButtonText}>
                利用ボード：{boardType}
              </Text>
            </TouchableOpacity>
            {/* モーダル部分 */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={closeBoardModal}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={closeBoardModal}
                style={styles.modalOverlay}
              >
                <View style={styles.modalContent}>
                  {boardTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => selectBoardType(type)}
                      style={styles.modalButton}
                    >
                      <Text style={styles.modalButtonText}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>
            {/* SNSリンク入力 */}
            <Text style={styles.sectionTitle}>各種SNS登録</Text>
            <TextInput
              placeholder="Instagram URL"
              value={instagramUrl}
              onChangeText={setInstagramUrl}
              style={styles.input}
            />
            <TextInput
              placeholder="Twitter URL"
              value={twitterUrl}
              onChangeText={setTwitterUrl}
              style={styles.input}
            />
            <TextInput
              placeholder="Facebook URL"
              value={facebookUrl}
              onChangeText={setFacebookUrl}
              style={styles.input}
            />
            {/* 保存ボタン */}
            <TouchableOpacity onPress={handleSaveProfile} style={styles.button}>
              <Text style={styles.buttonText}>プロフィール作成</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: "#fff",
      paddingVertical: 80,
    },
    header: {
      position: "absolute", // 固定表示する設定
      top: 0,
      left: 0,
      right: 0,
      height: 60, // 高さの設定
      backgroundColor: "#3AAAD2",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
      paddingVertical: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 6,
      elevation: 10, // Androidの影強調
      borderBottomWidth: 0,
      borderTopWidth: 0,
      zIndex: 1, // 他コンポーネントの上に表示するため
    },
    logo: {
      width: 40,
      height: 40,
      resizeMode: "contain",
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#fff",
      marginLeft: 10,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginVertical: 10,
    },

    boardButton: {
      paddingVertical: 15, // 高さの調整（上下の余白）
      backgroundColor: "#f0f0f0",
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      width: "100%",
      marginVertical: 10,
    },
    boardButtonText: {
      fontWeight: "bold",
      fontSize: 16,
      color: "#333",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: "white",
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
      width: "80%",
    },
    modalButton: {
      paddingVertical: 15,
      width: "100%",
      alignItems: "center",
    },
    modalButtonText: {
      fontSize: 18,
    },

    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      alignSelf: "center",
    },
    avatarPlaceholder: {
      height: 120,
      width: 120,
      backgroundColor: "#ccc",
      borderRadius: 60,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
    },
    input: {
      backgroundColor: "#f0f0f0",
      padding: 15,
      borderRadius: 10,
      marginVertical: 10,
      textAlignVertical: "top",
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
  export default ProfileCreateScreen;
