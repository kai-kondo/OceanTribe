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
import { useNavigation } from "@react-navigation/native";


const eventsData = [
  {
    id: "1",
    title: "サーフィン大会",
    date: "2024-12-10",
    location: "湘南",
    description: "楽しいサーフィン大会！参加者募集中。",
    image: "https://via.placeholder.com/300x200",
    organizer: "湘南サーフクラブ",
    attendees: 120,
    tags: ["スポーツ", "アウトドア", "湘南"],
    rsvpLink: "https://example.com/rsvp",
  },
  {
    id: "2",
    title: "海の清掃活動",
    date: "2024-12-15",
    location: "茅ヶ崎",
    description: "海の清掃活動に参加して環境保護に貢献。",
    image: "https://via.placeholder.com/300x200",
    organizer: "環境ボランティア団体",
    attendees: 50,
    tags: ["環境", "ボランティア", "茅ヶ崎"],
    rsvpLink: "https://example.com/rsvp",
  },
];

const EventScreen = ({ navigation }: any) => {
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredEvents = eventsData
    .filter((event) => {
      if (filter === "all") return true;
      if (filter === "today") return event.date === "2024-12-10";
      if (filter === "tomorrow") return event.date === "2024-12-11";
      if (filter === "weekend") return event.date === "2024-12-15";
      return true;
    })
    .filter((event) =>
      event.title.toLowerCase().includes(searchText.toLowerCase())
    );

  const renderEventItem = ({ item }: any) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.eventDetails}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDate}>
          {item.date} | {item.location}
        </Text>
        <Text style={styles.eventDescription}>{item.description}</Text>

        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.buttonText}>参加する</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => navigation.navigate("EventDetail", { event: item })}
        >
          <Text style={styles.detailButtonText}>詳細</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* コンテンツ部分 */}
      <View style={styles.content}>
        {/* 検索バー */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="イベントを検索"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* フィルタリングタグ */}
        <View style={styles.filterContainer}>
          {["All", "Today", "Tomorrow", "Weekend"].map((option) => (
            <TouchableOpacity
              key={option}
              style={
                filter === option.toLowerCase()
                  ? styles.selectedFilterTag
                  : styles.filterTag
              }
              onPress={() => setFilter(option.toLowerCase())}
            >
              <Text>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* イベントリスト */}
        <FlatList
          data={filteredEvents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
        />
      </View>

     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginVertical: 15,
    borderRadius: 8,
  },
  searchInput: {
    padding: 10,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  filterTag: {
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 20,
  },
  selectedFilterTag: {
    padding: 10,
    backgroundColor: "#1e90ff",
    borderRadius: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  cardImage: {
    height: 200,
    width: "100%",
    borderRadius: 10,
  },
  eventDetails: {
    marginTop: 10,
  },
  eventTitle: {
    fontWeight: "bold",
    fontSize: 20,
  },
  eventDate: {
    color: "gray",
  },
  eventDescription: {
    fontSize: 14,
    color: "#666",
  },
  joinButton: {
    marginVertical: 10,
    backgroundColor: "#28a745",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  detailButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  detailButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default EventScreen;
