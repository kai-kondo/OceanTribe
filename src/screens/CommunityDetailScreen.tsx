import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";

const CommunityDetailScreen = ({ route }: any) => {
  const { community } = route.params;
  const [communityData, setCommunityData] = useState(community);

  return (
    <ScrollView style={styles.container}>
      {/* コミュニティ画像 */}
      {communityData.imageUrl ? (
        <Image
          source={{ uri: communityData.imageUrl }}
          style={styles.coverImage}
        />
      ) : null}

      {/* タイトル */}
      <Text style={styles.title}>{communityData.title}</Text>

      {/* 説明 */}
      <Text style={styles.description}>{communityData.description}</Text>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  coverImage: {
    width: "100%",
    height: 200, // 高さを300から200に変更してサイズを小さく
    resizeMode: "cover",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  description: {
    fontSize: 16,
    paddingHorizontal: 15,
    color: "#666",
  },
  tag: {
    fontSize: 18,
    color: "#007AFF",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
});

export default CommunityDetailScreen;
