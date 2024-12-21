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

      const updatedAttendees = [...currentAttendees, userId];

      await update(eventRef, {
        attendees: updatedAttendees,
      });

      alert("参加登録しました！");
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

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <Text key={index} style={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>
        )}

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
          source={require("../assets/icons/OceanTribeLogo.png")}
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>イベント</Text>
        <View style={styles.spacer} />
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("EventCreate")}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

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
  container: { flex: 1 }, // 水色の背景

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#008CBA", // 濃い青色に変更
    backgroundColor: "#008CBA", // 海を連想する深い青
  },
  logo: { width: 50, height: 50, resizeMode: "contain" },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  spacer: {
    flex: 1, // 空のスペースを作るために追加
  },
  
  fab: {
    position: "absolute",
    bottom: 20, // 画面下部から少し離して配置
    right: 15, // 右端に配置
    width: 60,
    height: 60,
    backgroundColor: "#FF5733", // オレンジ色
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    zIndex: 1000, // 他のコンテンツの上に表示
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
  attendees: { fontSize: 16, color: "#0288D1", marginTop: 5 }, // 青色
  joinButton: {
    marginTop: 15,
    backgroundColor: "#008CBA",
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
    backgroundColor: "#0288D1", // 青色
    color: "#fff",
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
});

export default EventScreen;
