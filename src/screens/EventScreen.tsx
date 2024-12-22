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

// 日付のフィルタリング
const getFilteredEvents = (events: Event[], filter: string) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  return events.filter((event) => {
    const eventDate = new Date(event.date); // string → Dateに変換

    switch (filter) {
      case "today":
        return eventDate.toDateString() === today.toDateString();
      case "tomorrow":
        return eventDate.toDateString() === tomorrow.toDateString();
      case "thisWeek":
        return eventDate >= today && eventDate <= nextWeek;
      default:
        return true; // フィルタなし
    }
  });
};

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
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<string>(""); // フィルタの状態

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
        setFilteredEvents(formattedEvents); // 初期表示はフィルタなし
      });
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    setFilteredEvents(getFilteredEvents(events, filter));
  }, [filter, events]);

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
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>

      {item.location && (
        <View style={styles.locationRow}>
          <Image
            source={require("../assets/icons/pin.png")}
            style={styles.icon}
          />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
      )}

      {item.mediaUrl && (
        <Image source={{ uri: item.mediaUrl }} style={styles.cardImage} />
      )}

      {/* タグの表示部分 */}
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <Text key={index} style={styles.tag}>
              #{tag}
            </Text>
          ))}
        </View>
      )}

      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.attendeesRow}>
          <Image
            source={require("../assets/icons/community2.png")}
            style={styles.icon}
          />
          <Text style={styles.attendees}>
            {item.attendees ? item.attendees.length : 0} 人参加
          </Text>
        </View>

        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => handleJoin(item.id)}
        >
          <Text style={styles.joinButtonText}>参加する</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={require("../assets/icons/ivebt2.png")}
            style={styles.communityIcon}
          />
          <View>
            <Text style={styles.headerTitle}>イベント</Text>
            <Text style={styles.headerSubtitle}>
              興味のあるイベントに参加してみよう！
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilter("today")}
        >
          <Text style={styles.filterButtonText}>今日のイベント</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilter("tomorrow")}
        >
          <Text style={styles.filterButtonText}>明日のイベント</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilter("thisWeek")}
        >
          <Text style={styles.filterButtonText}>来週のイベント</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("EventCreate")}
      >
        <Text style={styles.createButtonText}>イベントを作成</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={(event) => event.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8F9FF" }, // 海を意識したライトブルー
  header: {
    backgroundColor: "#0277BD",
    paddingTop: 25,
    paddingBottom: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerContent: {
    flexDirection: "row", // 横並びに配置
    alignItems: "center", // アイテムを縦方向に中央揃え
    paddingHorizontal: 20,
  },

  communityIcon: {
    width: 30, // アイコンのサイズ
    height: 30, // アイコンのサイズ
    marginRight: 10, // 画像とテキストの間にスペースを追加
    marginTop: -5, // アイコンを上に上げる
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
    marginTop: 5,
  },

  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  filterButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#0077B6", // サーフィンをイメージした青
    borderRadius: 5,
  },
  filterButtonText: {
    color: "#fff",
    fontSize: 14,
  },

  listContent: { paddingHorizontal: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginVertical: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  title: { fontSize: 16, fontWeight: "bold", color: "#1D3557" }, // 海の色をイメージしたダークブルー
  date: { fontSize: 12, color: "#888" },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  locationText: { fontSize: 14, color: "#666", marginLeft: 5 },

  cardImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginVertical: 10,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginVertical: 5,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  attendeesRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  attendees: { fontSize: 14, color: "#333", marginLeft: 5 },

  joinButton: {
    backgroundColor: "#2196F3", // サンセットのオレンジ
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  joinButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },

  icon: { width: 16, height: 16, tintColor: "#555" },

  spacer: { height: 20 },
  createButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#0077B6", // サンセットオレンジ
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10, // 追加してみる
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // タグ関連のスタイル
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  tag: {
    backgroundColor: "#2196F3", // サンセットオレンジ
    color: "#fff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginRight: 5,
    marginBottom: 5,
    fontSize: 12,
  },
});

export default EventScreen;
