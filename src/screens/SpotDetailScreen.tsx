import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, push } from "firebase/database";
import { storage } from "../services/firebase";
import { getAuth } from "firebase/auth";

const waveHeights = ["フラット", "スネ〜ヒザ", "ヒザ〜モモ","モモ〜コシ","コシ〜ハラ","ハラ〜ムネ","カタ〜頭","頭オーバー"];
const waveConditions = ["ツルツル", "ややざわついている", "ザワザワ","グチャグチャ","ガタガタ"];
const congestionLevels = ["空いている", "普通", "混雑", "激混み"];
const area = ['北海道・東北', '茨城', '千葉北', '千葉南','湘南','西湘','伊豆','静岡','伊良湖','伊勢','和歌山','四国','南九州','北九州','日本海','アイランド'];


const SpotDetailScreen = ({ navigation }: any) => {
  const [waveHeight, setWaveHeight] = useState(waveHeights[0]);
  const [waveCondition, setWaveCondition] = useState(waveConditions[0]);
  const [congestion, setCongestion] = useState(congestionLevels[0]);
  const [selectedArea, setSelectedArea] = useState<string>(area[0]);
  const [surfDate, setSurfDate] = useState("");
  const [surfTime, setSurfTime] = useState("");
  const [comment, setComment] = useState("");
  const [reviewStars, setReviewStars] = useState(0); // ⭐レビューの状態
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [surfSpotName, setSurfSpotName] = useState<string>("");

  const [modalVisible, setModalVisible] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [onSelect, setOnSelect] = useState<(value: string) => void>(() => { });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);


  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSurfDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setSurfTime(selectedTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }));
    }
  };

  // ⭐レビューの状態を表示する関数をコンポーネントスコープ内に移動
  const renderStars = () => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <TouchableOpacity key={index} onPress={() => setReviewStars(index + 1)}>
            <Text style={{ fontSize: 30, color: index < reviewStars ? "gold" : "gray" }}>
              {index < reviewStars ? "★" : "☆"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };


  const openModal = (
    options: string[],
    onSelectCallback: (value: string) => void
  ) => {
    setCurrentOptions(options);
    setOnSelect(() => onSelectCallback);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

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

  const handlePostData = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("エラー", "ログインしていません。");
      return;
    }

    if (!surfDate || !surfTime) {
      Alert.alert("エラー", "必須項目をすべて入力してください。");
      return;
    }

    try {
      let mediaUrl = "";

      if (mediaUri) {
        const response = await fetch(mediaUri);
        const blob = await response.blob();
        const mediaRef = ref(storage, `posts/${Date.now()}.jpg`);
        await uploadBytes(mediaRef, blob);
        mediaUrl = await getDownloadURL(mediaRef);
      }

      const database = getDatabase();
      const postRef = dbRef(database, `posts`);
      const postData = {
        userId: user.uid,
        waveHeight,
        waveCondition,
        congestion,
        surfDate,
        surfTime,
        comment,
        surfSpotName,
        selectedArea,
        reviewStars,
        mediaUrl,
        createdAt: new Date().toISOString(),
        likes: {}, // 初期化
        comments: [], // 初期化
      };

      await push(postRef, postData);

      Alert.alert("投稿が完了しました！");
      navigation.navigate("Main", { screen: "Home" });
    } catch (error: any) {
      Alert.alert("エラー", error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>波情報</Text>

        {/* サーフポイント名入力フィールド */}
        <Text style={styles.sectionTitle}>サーフポイント名</Text>
        <TextInput
          placeholder="ポイント名を入力"
          value={surfSpotName}
          onChangeText={setSurfSpotName}
          style={styles.input}
        />

        {/* 波の高さと波の状態を横に並べる */}
        <View style={styles.row}>
          {/* 波の高さ */}
          <View style={styles.flexItem}>
            <Text style={styles.label}>波の高さ</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => openModal(waveHeights, setWaveHeight)}
            >
              <Text>{waveHeight}</Text>
            </TouchableOpacity>
          </View>

          {/* 波の状態 */}
          <View style={styles.flexItem}>
            <Text style={styles.label}>波の状態</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => openModal(waveConditions, setWaveCondition)}
            >
              <Text>{waveCondition}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 混雑具合とエリアを横に並べる */}
        <View style={styles.row}>
          {/* 混雑具合 */}
          <View style={styles.flexItem}>
            <Text style={styles.label}>混雑具合</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => openModal(congestionLevels, setCongestion)}
            >
              <Text>{congestion}</Text>
            </TouchableOpacity>
          </View>

          {/* エリア */}
          <View style={styles.flexItem}>
            <Text style={styles.label}>エリア</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => openModal(area, setSelectedArea)}
            >
              <Text>{selectedArea}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>サーフィンした日時</Text>
          {/* 日付選択ボタン */}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.inputText}>
          {surfDate || '日付を選択'} {/* 選択された日付 */}
        </Text>
      </TouchableOpacity>

      {/* 時間選択ボタン */}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.inputText}>
          {surfTime || '時間を選択'} {/* 選択された時間 */}
        </Text>
      </TouchableOpacity>

      {/* 日付ピッカー */}
      {showDatePicker && (
        <DateTimePicker
          value={surfDate ? new Date(surfDate) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* 時間ピッカー */}
      {showTimePicker && (
        <DateTimePicker
          value={surfTime ? new Date(`1970-01-01T${surfTime}`) : new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

        {/* レビュー星選択 */}
        <Text style={styles.sectionTitle}>今日のレビュー（星）</Text>
        {renderStars()}

        {/* コメント入力 */}
        <Text style={styles.sectionTitle}>コメント</Text>
        <TextInput
          placeholder="コメントを入力"
          value={comment}
          onChangeText={setComment}
          style={styles.inputMultiline}
          multiline
        />

        {/* 画像選択ボタン */}
        <TouchableOpacity onPress={handleSelectMedia} style={styles.button}>
          <Text style={styles.buttonText}>画像を選択</Text>
        </TouchableOpacity>

        {mediaUri && (
          <Image
            source={{ uri: mediaUri }}
            style={{ width: 200, height: 200, marginVertical: 10 }}
          />
        )}

        <TouchableOpacity onPress={handlePostData} style={styles.button}>
          <Text style={styles.buttonText}>投稿する</Text>
        </TouchableOpacity>

        {/* 🔥 モーダルの追加 */}
        <Modal
          transparent={true}
          animationType="fade"
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView>
                  {currentOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.modalButton}
                      onPress={() => {
                        onSelect(option);
                        closeModal();
                      }}
                    >
                      <Text style={styles.modalButtonText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    onPress={closeModal}
                    style={styles.modalButton}
                  >
                    <Text style={{ color: "red", textAlign: "center" }}>
                      キャンセル
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F9F9F9",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  input: {
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    marginVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  dropdown: {
    backgroundColor: "#EAF7FF",
    padding: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 15,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 25,
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  modalButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  modalButtonText: {
    fontSize: 16,
    textAlign: "center",
    color: "#007AFF",
  },
  inputMultiline: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    height: 120,
    marginVertical: 10,
    textAlignVertical: "top",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  flexItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
});

export default SpotDetailScreen;
