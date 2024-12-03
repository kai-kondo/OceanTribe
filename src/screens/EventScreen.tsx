import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";

const eventsData = [
  {
    id: "1",
    title: "サーフィン大会",
    date: "2024-12-10",
    location: "湘南",
    description: "楽しいサーフィン大会！",
    image: "https://example.com/cleanup.jpg", // イメージURL
    organizer: "湘南サーフクラブ",
    attendees: 50,
    tags: ["スポーツ", "アウトドア", "湘南"],
    rsvpLink: "https://example.com/rsvp", // RSVPのURL
  },
  {
    id: "2",
    title: "海の清掃活動",
    date: "2024-12-15",
    location: "茅ヶ崎",
    description: "みんなで海をきれいにしよう！",
    image: "https://example.com/cleanup.jpg", // イメージURL
    organizer: "清掃ボランティア",
    attendees: 30,
    tags: ["環境", "ボランティア", "茅ヶ崎"],
    rsvpLink: "https://example.com/rsvp", // RSVPのURL
  },
];

interface Attendees {
  [key: string]: boolean;
}

const EventScreen = ({ navigation }: any) => {
  const [attendees, setAttendees] = useState<Attendees>({
    "1": false,
    "2": false,
  });
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("all"); // フィルタ用

  const handleJoinEvent = (eventId: string) => {
    setAttendees((prev) => ({
      ...prev,
      [eventId]: !prev[eventId], // 参加状態のトグル
    }));
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  const handleFilterChange = (filter: string) => {
    setFilter(filter);
  };

  const renderEventItem = ({ item }: any) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDate}>
        {item.date} - {item.location}
      </Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleJoinEvent(item.id)}
      >
        <Text style={styles.buttonText}>
          {attendees[item.id] ? "参加中" : "参加する"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.detailButton}
        onPress={() => navigation.navigate("EventDetail", { event: item })} // ここで詳細画面へ遷移
      >
        <Text style={styles.buttonText}>詳細</Text>
      </TouchableOpacity>
    </View>
  );

  const filteredEvents = eventsData
    .filter((event) => {
      if (filter === "all") return true; // 全てのイベント
      if (filter === "today") return event.date === "2024-12-10"; // 今日のイベント
      if (filter === "tomorrow") return event.date === "2024-12-11"; // 明日のイベント
      if (filter === "weekend") return event.date === "2024-12-15"; // 今週末のイベント
      return true;
    })
    .filter((event) =>
      event.title.toLowerCase().includes(searchText.toLowerCase())
    ); // 検索テキストでフィルタリング

  const handleCreateEvent = () => {
    navigation.navigate("EventCreate"); // イベント作成画面に遷移
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="イベントを検索"
          value={searchText}
          onChangeText={handleSearchChange}
        />
        {/* イベント作成ボタン */}
        <TouchableOpacity
          style={styles.createEventButton}
          onPress={handleCreateEvent}
        >
          <Text style={styles.createEventButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* フィルタリングタグ */}
      <View style={styles.filterTagsContainer}>
        <TouchableOpacity
          style={[styles.filterTag, filter === "all" && styles.selectedTag]}
          onPress={() => handleFilterChange("all")}
        >
          <Text style={styles.filterTagText}>全イベント</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTag, filter === "today" && styles.selectedTag]}
          onPress={() => handleFilterChange("today")}
        >
          <Text style={styles.filterTagText}>今日</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTag,
            filter === "tomorrow" && styles.selectedTag,
          ]}
          onPress={() => handleFilterChange("tomorrow")}
        >
          <Text style={styles.filterTagText}>明日</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTag, filter === "weekend" && styles.selectedTag]}
          onPress={() => handleFilterChange("weekend")}
        >
          <Text style={styles.filterTagText}>今週末</Text>
        </TouchableOpacity>
      </View>

      {/* イベントリスト */}
      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    flex: 1,
  },
  createEventButton: {
    backgroundColor: "#e74c3c",
    padding: 8, // 余白を調整してアイコンを上に移動
    borderRadius: 50,
    marginLeft: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -5, // 少し上に配置
  },
  createEventButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: -3, // アイコンの位置を微調整
  },
  filterTagsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  filterTag: {
    backgroundColor: "#ddd",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedTag: {
    backgroundColor: "#1abc9c",
  },
  filterTagText: {
    fontSize: 16,
    color: "#333",
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cardImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardDate: {
    fontSize: 14,
    color: "gray",
  },
  cardDescription: {
    fontSize: 14,
    color: "gray",
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#1abc9c",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  detailButton: {
    marginTop: 10,
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});

export default EventScreen;
