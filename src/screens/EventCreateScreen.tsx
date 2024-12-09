import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ref, set, push } from "firebase/database";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const EventCreateScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  const [time, setTime] = useState("");
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [eventType, setEventType] = useState("inPerson"); // 対面 ("inPerson") またはオンライン ("online")
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirmDate = (selectedDate: Date) => {
    const formattedDate = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD形式に整形
    setDate(formattedDate);
    hideDatePicker();
  };

  const showTimePicker = () => setTimePickerVisible(true);
  const hideTimePicker = () => setTimePickerVisible(false);

  const handleConfirmTime = (selectedTime: Date) => {
    const formattedTime = selectedTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setTime(formattedTime);
    hideTimePicker();
  };


  const handleSelectMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
    }
  };


  const handleAddTag = () => {
    if (currentTag.trim() !== "") {
      setTags((prevTags) => [...prevTags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags((prevTags) => {
      const newTags = prevTags.slice(); // 新しい配列を作成してコピー
      newTags.splice(index, 1); // 指定したインデックスのタグを削除
      return newTags; // 更新した配列を返す
    });
  };

  const handleCreateEvent = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("エラー発生", "ログインしてください。");
      return;
    }

    if (
      !title ||
      !description ||
      !date ||
      !time ||
      (!location && eventType === "inPerson")
    ) {
      Alert.alert("入力エラー", "必要な項目をすべて入力してください。");
      return;
    }

    try {
      const database = getDatabase();
      const eventsRef = ref(database, "events");
      const newEventRef = push(eventsRef);

      let mediaUrl = "";
      if (mediaUri) {
        // Firebase Storage にアップロードするコードを追加する場合はこちらに記載
        mediaUrl = mediaUri; // 例: ローカルURI
      }

      const eventData = {
        title,
        description,
        location: eventType === "inPerson" ? location : "オンライン",
        date,
        time,
        eventType,
        mediaUrl,
        tags,
        organizer: user.uid,
        createdAt: new Date().toISOString(),
      };

      await set(newEventRef, eventData);

      Alert.alert("イベント作成完了", "イベントが正常に作成されました。", [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("EventScreen"); // 作成完了後にEventScreenへ遷移
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("エラー発生", error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container}>
        <Text>イベント作成</Text>

        <TouchableOpacity
          onPress={handleSelectMedia}
          style={styles.mediaButton}
        >
          {mediaUri ? (
            <Image source={{ uri: mediaUri }} style={styles.mediaPreview} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>＋ 画像を追加</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* イベント名 */}
        <TextInput
          placeholder="イベント名"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        {/* 説明 */}
        <TextInput
          placeholder="説明"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 100 }]}
          multiline
        />

        {/* 対面/オンライン選択 */}
        <Text style={styles.sectionTitle}>イベント形式</Text>
        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => setEventType("inPerson")}
          >
            <Text
              style={
                eventType === "inPerson"
                  ? styles.radioSelected
                  : styles.radioText
              }
            >
              対面
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => setEventType("online")}
          >
            <Text
              style={
                eventType === "online" ? styles.radioSelected : styles.radioText
              }
            >
              オンライン
            </Text>
          </TouchableOpacity>
        </View>

        {/* 場所 */}
        {eventType === "inPerson" && (
          <TextInput
            placeholder="場所"
            value={location}
            onChangeText={setLocation}
            style={styles.input}
          />
        )}

        {/* 日付選択部分 */}
        <TouchableOpacity onPress={showDatePicker} style={styles.dateButton}>
          <Text style={styles.dateText}>{date ? date : "日付を選択"}</Text>
        </TouchableOpacity>

        {/* 時間選択部分 */}
        <TouchableOpacity onPress={showTimePicker} style={styles.dateButton}>
          <Text style={styles.dateText}>{time ? time : "時間を選択"}</Text>
        </TouchableOpacity>

        {/* DateTimePicker */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={hideDatePicker}
          locale="ja_JP"
        />
        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={handleConfirmTime}
          onCancel={hideTimePicker}
          locale="ja_JP"
        />

        {/* タグ入力部分 */}
        <View style={styles.tagContainer}>
          <TextInput
            placeholder="タグ入力"
            value={currentTag}
            onChangeText={setCurrentTag}
            style={styles.tagInput}
          />
          <TouchableOpacity onPress={handleAddTag} style={styles.addTagButton}>
            <Text style={styles.addTagButtonText}>＋</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tagList}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tagItem}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity onPress={() => handleRemoveTag(index)}>
                <Text style={styles.tagRemove}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* 作成ボタン */}
        <TouchableOpacity onPress={handleCreateEvent} style={styles.button}>
          <Text style={styles.buttonText}>イベントを作成</Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  mediaText: {
    color: "#555",
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  radioButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#ddd",
  },
  radioText: {
    color: "#555",
  },
  radioSelected: {
    fontWeight: "bold",
    color: "#007AFF",
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

  mediaButton: {
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },

  mediaPreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    backgroundColor: "#e0e0e0",
  },

  placeholderText: {
    fontSize: 20,
    color: "#999",
  },

  dateButton: {
    paddingVertical: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10, 
  },
  dateText: {
    fontSize: 16,
    color: "#555",
  },
});

export default EventCreateScreen;
