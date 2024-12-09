import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { getDatabase, ref, onValue, update, get } from "firebase/database";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { getAuth } from "firebase/auth";

type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
  image?: string;
  mediaUrl?: string;
  tags?: string[];
  attendees?: string[];
};

type RootStackParamList = {
  EventCreate: undefined;
  EventDetail: { eventId: string };
};

const EventScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [events, setEvents] = useState<Event[]>([]);
  const auth = getAuth();


  useEffect(() => {
    const db = getDatabase();
    const eventsRef = ref(db, "events");

    const fetchEvents = () => {
      onValue(eventsRef, (snapshot) => {
        const data = snapshot.val() || {};
        const formattedEvents = Object.entries(data).map(
          ([id, event]: [string, any]) => ({
            id,
            ...event,
          })
        );
        setEvents(formattedEvents);
      });
    };

    fetchEvents();
  }, []);

  const handleJoin = async (eventId: string) => {
    const user = auth.currentUser;

    if (!user) {
      alert("ログインが必要です。");
      return;
    }

    const db = getDatabase();
    const eventRef = ref(db, `events/${eventId}`);

    try {
      const snapshot = await get(eventRef);
      const currentEvent = snapshot.val();

      if (!currentEvent) return;

      const currentAttendees = currentEvent.attendees || [];
      const userId = user.uid;

      if (currentAttendees.includes(userId)) {
        alert("既にこのイベントに参加しています！");
        return;
      }

      // 参加者リストを更新してFirebaseに保存
      const updatedAttendees = [...currentAttendees, userId];

      await update(eventRef, {
        attendees: updatedAttendees,
      });

      alert("参加登録しました！");

      // リストをリフレッシュして最新参加者数を反映
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? { ...event, attendees: updatedAttendees }
            : event
        )
      );
    } catch (error) {
      console.error("参加登録エラー:", error);
      alert("エラーが発生しました。再試行してください。");
    }
  };


  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("EventDetail", { eventId: item.id })}
    >
      {item.mediaUrl && (
        <Image source={{ uri: item.mediaUrl }} style={styles.cardImage} />
      )}
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>
          📅 {item.date} | 📍 {item.location}
        </Text>
        <Text style={styles.attendees}>
          👥 参加者数: {item.attendees ? item.attendees.length : 0}
        </Text>

        {/* タグ表示 */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <Text key={index} style={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>
        )}

        {/* 参加ボタン */}
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => handleJoin(item.id)}
        >
          <Text style={styles.joinButtonText}>参加してみる</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../assets/icons/iconmain3.png")}
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>イベント</Text>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("EventCreate")}
        >
          <Text style={styles.fabText}>＋</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(event) => event.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#3AAAD2",
  },
  logo: { width: 30, height: 30, resizeMode: "contain" },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  fab: {
    width: 40,
    height: 40,
    backgroundColor: "#FF5733",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  fabText: { color: "#fff", fontSize: 28, fontWeight: "bold" },

  listContent: { paddingHorizontal: 10 },

  card: {
    backgroundColor: "#fff",
    marginVertical: 10,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    padding: 15,
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: 180, borderRadius: 15 },
  cardContent: { paddingVertical: 10 },
  title: { fontSize: 22, fontWeight: "bold", color: "#333" },
  date: { fontSize: 14, color: "#777" },
  attendees: { fontSize: 16, color: "#007BFF", marginTop: 5 },
  joinButton: {
    marginTop: 15,
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  joinButtonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  tag: {
    backgroundColor: "#3AAAD2",
    color: "#fff",
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
});

export default EventScreen;
