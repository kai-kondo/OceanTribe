import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
} from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";
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
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<string>("");

  const auth = getAuth();

  useEffect(() => {
    const db = getDatabase();
    const eventsRef = ref(db, "events");

    onValue(eventsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const formattedEvents = Object.entries(data).map(
        ([id, event]: [string, any]) => ({
          id,
          ...event,
        })
      );
      setEvents(formattedEvents);
      setFilteredEvents(formattedEvents);
    });
  }, []);

  useEffect(() => {
    if (filter === "today" || filter === "tomorrow" || filter === "thisWeek") {
      const filtered = getFilteredEvents(events, filter);
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [filter, events]);

  const renderEventItem = ({ item }: { item: Event }) => {
    const formattedDate = new Date(item.date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });

    const attendeeCount = item.attendees ? item.attendees.length : 0;

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => navigation.navigate("EventDetail", { eventId: item.id })}
      >
        {item.mediaUrl && (
          <Image source={{ uri: item.mediaUrl }} style={styles.eventImage} />
        )}
        <View style={styles.eventContent}>
          <Text style={styles.eventDate}>{formattedDate}</Text>
          <Text style={styles.eventTitle}>{item.title}</Text>

          {item.location && (
            <View style={styles.locationContainer}>
              <Image
                source={require("../assets/icons/pin.png")}
                style={styles.locationIcon}
              />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          )}

          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.eventFooter}>
            <View style={styles.attendeeInfo}>
              <Image
                source={require("../assets/icons/community2.png")}
                style={styles.attendeeIcon}
              />
              <Text style={styles.attendeeCount}>{attendeeCount}人が参加</Text>
            </View>
            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinButtonText}>参加する</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
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

      {/* フィルターバー */}
      <View style={styles.filterBar}>
        {[
          { id: "today", label: "今日" },
          { id: "tomorrow", label: "明日" },
          { id: "thisWeek", label: "今週" },
          { id: "", label: "すべて" },
        ].map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.filterButton,
              filter === item.id && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(item.id)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === item.id && styles.filterButtonTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* イベントリスト */}
      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.eventList}
      />

      {/* イベント作成ボタン */}
      <TouchableOpacity
        style={styles.createEventButton}
        onPress={() => navigation.navigate("EventCreate")}
      >
        <Text style={styles.createEventButtonText}>＋ イベントを作成</Text>
      </TouchableOpacity>
    </View>
  );
};

// 日付フィルタリング関数は変更なし
const getFilteredEvents = (events: Event[], filter: string) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  return events.filter((event) => {
    const eventDate = new Date(event.date);

    switch (filter) {
      case "today":
        return eventDate.toDateString() === today.toDateString();
      case "tomorrow":
        return eventDate.toDateString() === tomorrow.toDateString();
      case "thisWeek":
        return eventDate >= today && eventDate <= nextWeek;
      default:
        return true;
    }
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F9FF", // 薄い水色で海を連想
  },
  header: {
    backgroundColor: "#0277BD", // 濃い青（変更なし）
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
    tintColor: "#FFFFFF", // 画像を白くする
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
  filterBar: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#E8F9FF",
    borderBottomWidth: 1,
    borderBottomColor: "#4DD0E1", // 水色の境界線
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: "#F5F5F5", // 水色
  },
  filterButtonActive: {
    backgroundColor: "#2196F3", // コーラル系の赤
  },
  filterButtonText: {
    fontSize: 13,
    color: "#666666", // ボタンの文字色を白に変更
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  eventList: {
    padding: 12,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  eventContent: {
    padding: 16,
  },
  eventDate: {
    fontSize: 15,
    color: "#00000", // コーラル系の赤
    fontWeight: "600",
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#008CBA", // 深い緑がかった青
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  locationText: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 12,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  attendeeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  attendeeIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
    tintColor: "#008CBA", // 深い緑がかった青
  },
  attendeeCount: {
    fontSize: 16,
    color: "#008CBA", // 深い緑がかった青
  },
  joinButton: {
    backgroundColor: "#008CBA", // コーラル系の赤
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  joinButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  createEventButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#FF6F61", // 深い緑がかった青
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  createEventButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  headerInner: {
    flexDirection: "row", // 横並びに配置
    alignItems: "center", // 縦方向に中央揃え
    paddingHorizontal: 20, // 左右のパディングを指定
  },
});


export default EventScreen;
