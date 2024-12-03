import React from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";

const EventDetailScreen = ({ route, navigation }: any) => {
  const { event } = route.params;

  return (
    <ScrollView style={styles.container}>
      {/* イベント画像 */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: event.image }} style={styles.image} />
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>{event.title}</Text>
          <Text style={styles.overlayDate}>{event.date}</Text>
        </View>
      </View>

      {/* イベント詳細情報 */}
      <View style={styles.eventDetails}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.date}>日時: {event.date}</Text>
        <Text style={styles.location}>場所: {event.location}</Text>
        <Text style={styles.organizer}>
          主催者: {event.organizer || "不明"}
        </Text>
        <Text style={styles.attendees}>参加者: {event.attendees} 人</Text>
        <Text style={styles.description}>{event.description}</Text>
      </View>

      {/* RSVPリンク */}
      <TouchableOpacity onPress={() => Linking.openURL(event.rsvpLink)}>
        <View style={styles.rsvpButton}>
          <Text style={styles.rsvpButtonText}>参加登録</Text>
        </View>
      </TouchableOpacity>

      {/* タグ */}
      <View style={styles.tags}>
        {event.tags.map((tag: string, index: number) => (
          <Text key={index} style={styles.tag}>
            {tag}
          </Text>
        ))}
      </View>

      {/* Googleマップリンク */}
      <TouchableOpacity
        onPress={() =>
          Linking.openURL(`https://maps.google.com/?q=${event.location}`)
        }
      >
        <Text style={styles.mapLink}>Googleマップで場所を確認</Text>
      </TouchableOpacity>

      {/* コメントセクション */}
      <Text style={styles.comments}>コメントセクション</Text>
      <Button
        title="コメントを追加"
        onPress={() => navigation.navigate("Comments")}
      />

      <Button title="戻る" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
    paddingHorizontal: 20,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 15,
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 8,
  },
  overlayTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  overlayDate: {
    fontSize: 16,
    color: "white",
    marginTop: 5,
  },
  eventDetails: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  date: {
    fontSize: 18,
    color: "#888",
    marginBottom: 5,
  },
  location: {
    fontSize: 18,
    color: "#888",
    marginBottom: 5,
  },
  organizer: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  attendees: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  rsvpButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    borderRadius: 25,
    marginVertical: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  rsvpButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  tag: {
    backgroundColor: "#1abc9c",
    color: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  mapLink: {
    color: "#3498db",
    fontSize: 16,
    marginVertical: 10,
  },
  comments: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 20,
  },
});

export default EventDetailScreen;
