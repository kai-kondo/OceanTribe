import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { getDatabase, ref, get, update } from "firebase/database";
import { getAuth } from "firebase/auth";

const EventDetailScreen = ({ route, navigation }: any) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState<any>({});
  const [organizer, setOrganizer] = useState<any>({});
  const auth = getAuth();

  useEffect(() => {
    const db = getDatabase();

    const eventRef = ref(db, `events/${eventId}`);

    get(eventRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const eventData = snapshot.val();
          setEvent(eventData);

          const organizerRef = ref(db, `users/${eventData.organizer}`);
          get(organizerRef).then((organizerSnapshot) => {
            if (organizerSnapshot.exists()) {
              setOrganizer(organizerSnapshot.val());
            }
          });
        }
      })
      .catch((error) => console.error("Failed to load event details:", error));
  }, [eventId]);

  // Google Mapsリンクを開く関数
  const openGoogleMaps = (location: string) => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(location)}`;
    Linking.openURL(url);
  };

  // 参加処理を追加
  const handleJoin = async () => {
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

      // 参加者数を再度反映するためにイベント情報を更新
      setEvent((prevEvent: any) => ({
        ...prevEvent,
        attendees: updatedAttendees,
      }));
    } catch (error) {
      console.error("参加登録エラー:", error);
      alert("エラーが発生しました。再試行してください。");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* イベントカバー写真 */}
      {event.mediaUrl && (
        <Image source={{ uri: event.mediaUrl }} style={styles.coverImage} />
      )}

      {/* イベントタイトル */}
      <Text style={styles.title}>{event.title}</Text>

      {/* 日程、場所、主催者情報 */}
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>📝 イベント説明</Text>

        {/* イベント説明追加 */}
        {event.description && (
          <Text style={styles.descriptionText}>{event.description}</Text>
        )}

        <Text style={styles.infoLabel}>📅 日時</Text>
        <Text style={styles.infoText}>{event.date}</Text>

        <Text style={styles.infoLabel}>📍 場所</Text>
        <TouchableOpacity onPress={() => openGoogleMaps(event.location)}>
          <Text style={styles.infoTextClickable}>{event.location}</Text>
        </TouchableOpacity>

        {/* 現在の参加者数 */}
        <Text style={styles.infoLabel}>現在の参加者数</Text>
        <Text style={styles.infoText}>{event.attendees?.length || 0} 人</Text>

        {/* 主催者情報表示 */}
        <Text style={styles.sectionTitle}>👤 主催者</Text>
        {organizer.username && (
          <View style={styles.organizerSection}>
            {organizer.mediaUrl && (
              <Image
                source={{ uri: organizer.mediaUrl }}
                style={styles.organizerImage}
              />
            )}
            <Text style={styles.organizerName}>{organizer.username}</Text>
          </View>
        )}
      </View>

      {/* 参加ボタン */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.rsvpButton} onPress={handleJoin}>
          <Text style={styles.buttonText}>参加してみる！</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => Linking.openURL(`mailto:${organizer.email}`)}
        >
          <Text style={styles.buttonText}>主催者に問い合わせる</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  coverImage: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    paddingHorizontal: 15,
  },
  infoContainer: {
    padding: 15,
    marginVertical: 10,
  },
  infoLabel: {
    fontWeight: "bold",
    color: "#555",
    fontSize: 16,
    marginTop: 10,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
  },
  infoTextClickable: {
    fontSize: 16,
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  buttonContainer: {
    paddingVertical: 10,
  },
  rsvpButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  contactButton: {
    backgroundColor: "#FF9500",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 18,
  },

  organizerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  organizerSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  organizerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  organizerName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
  },
  descriptionText: {
    fontSize: 16,
    color: "#666",
    marginVertical: 10,
  },
});

export default EventDetailScreen;
