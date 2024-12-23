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

  const openGoogleMaps = (location: string) => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(location)}`;
    Linking.openURL(url);
  };

  const handleJoin = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("ログインが必要です");
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
        alert("既に参加しています！");
        return;
      }

      const updatedAttendees = [...currentAttendees, userId];

      await update(eventRef, {
        attendees: updatedAttendees,
      });

      alert("参加登録完了！");
      setEvent((prevEvent: any) => ({
        ...prevEvent,
        attendees: updatedAttendees,
      }));
    } catch (error) {
      console.error("参加登録エラー:", error);
      alert("エラーが発生しました。もう一度お試しください。");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* カバー画像 */}
      <View style={styles.coverContainer}>
        {event.mediaUrl && (
          <Image source={{ uri: event.mediaUrl }} style={styles.coverImage} />
        )}
        <View style={styles.gradientOverlay} />
        <Text style={styles.overlayTitle}>{event.title}</Text>
      </View>

      {/* 参加者数バッジ */}
      <View style={styles.attendeeBadge}>
        <Text style={styles.attendeeCount}>{event.attendees?.length || 0}</Text>
        <Text style={styles.attendeeLabel}>参加者</Text>
      </View>

      {/* メインコンテンツ */}
      <View style={styles.contentContainer}>
        {/* 主催者情報 */}
        <View style={styles.organizerSection}>
          {organizer.mediaUrl && (
            <Image
              source={{ uri: organizer.mediaUrl }}
              style={styles.organizerImage}
            />
          )}
          <View style={styles.organizerInfo}>
            <Text style={styles.organizerName}>{organizer.username}</Text>
            <Text style={styles.organizerRole}>主催者</Text>
          </View>
        </View>

        {/* イベント詳細 */}
        <View style={styles.detailsSection}>
          <View style={styles.detailItem}>
            <Image
              source={require("../assets/icons/detailCalender.png")} // 使用するアイコン画像
              style={styles.detailIcon}
            />
            <Text style={styles.detailText}>{event.date}</Text>
          </View>

          <TouchableOpacity
            style={styles.detailItem}
            onPress={() => openGoogleMaps(event.location)}
          >
            <Image
              source={require("../assets/icons/pin.png")} // 使用するアイコン画像
              style={styles.detailIcon}
            />
            <Text style={styles.detailTextLink}>{event.location}</Text>
          </TouchableOpacity>
        </View>

        {/* イベント説明 */}
        {event.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>イベント詳細</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>
        )}

        {/* アクションボタン */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
            <Text style={styles.joinButtonText}>参加する</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => Linking.openURL(`mailto:${organizer.email}`)}
          >
            <Text style={styles.contactButtonText}>主催者に連絡</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  coverContainer: {
    height: 280,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  overlayTitle: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  attendeeBadge: {
    position: "absolute",
    top: 260,
    right: 20,
    backgroundColor: "#FF6B6B",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    minWidth: 80,
    elevation: 3,
  },
  attendeeCount: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  attendeeLabel: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  contentContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  organizerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  organizerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  organizerInfo: {
    marginLeft: 15,
  },
  organizerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  organizerRole: {
    fontSize: 14,
    color: "#666666",
  },
  detailsSection: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailIcon: {
    width: 18, // アイコンの幅
    height: 18, // アイコンの高さ
    resizeMode: "contain", // アイコンが枠内に収まるように調整
    marginRight: 5, // 右側に余白を追加
  },
  detailText: {
    fontSize: 16,
    color: "#333333",
  },
  detailTextLink: {
    fontSize: 16,
    color: "#4A90E2",
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: "#666666",
    lineHeight: 24,
  },
  actionButtons: {
    gap: 10,
  },
  joinButton: {
    backgroundColor: "#0277BD",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  joinButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  contactButton: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  contactButtonText: {
    color: "#495057",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EventDetailScreen;
