import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
} from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

type Community = {
  id: string;
  title: string;
  description?: string;
  tag?: string;
  imageUrl?: string;
};

const CommunityScreen: React.FC<{ navigation: StackNavigationProp<any> }> = ({
  navigation,
}) => {
  const [selectedTab, setSelectedTab] = useState<string>("サーフィン");
  const [searchText, setSearchText] = useState<string>("");
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    const db = getDatabase();
    const communitiesRef = ref(db, "communities");

    const fetchCommunities = () => {
      onValue(communitiesRef, (snapshot) => {
        const data = snapshot.val() || {};
        const formattedCommunities = Object.entries(data).map(
          ([id, community]: [string, any]) => ({
            id,
            ...community,
          })
        );
        setCommunities(formattedCommunities);
      });
    };

    fetchCommunities();
  }, []);

  const filterCommunities = (tag: string, text: string) =>
    communities.filter(
      (community) =>
        community.tag === tag &&
        (community.title.toLowerCase().includes(text.toLowerCase()) ||
          (community.description &&
            community.description.toLowerCase().includes(text.toLowerCase())))
    );

  const renderCommunityItem = ({ item }: { item: Community }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("CommunityDetail" as never, { community: item })
      }
    >
      <View style={styles.communityItem}>
        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.communityImage}
          />
        )}
        <View style={styles.communityDetails}>
          <Text style={styles.communityName}>{item.title}</Text>
          <Text style={styles.communityDescription}>{item.description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const filteredCommunities = filterCommunities(selectedTab, searchText);

  return (
    <View style={{ flex: 1 }}>
      {/* グループ作成ボタン */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("CommunityCreate")}
      >
        <Text style={styles.createButtonText}>＋ グループ作成</Text>
      </TouchableOpacity>

      {/* タブ部分 */}
      <View style={styles.tabBar}>
        {["サーフィン", "ライフセービング", "ボディボード"].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab)}>
            <Text
              style={
                selectedTab === tab ? styles.activeTabText : styles.tabText
              }
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 検索入力部分 */}
      <TextInput
        placeholder="コミュニティを検索"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
      />

      {/* コミュニティリスト部分 */}
      <FlatList
        data={filteredCommunities}
        keyExtractor={(item) => item.id}
        renderItem={renderCommunityItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default CommunityScreen;

const styles = StyleSheet.create({
  createButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    margin: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  searchInput: {
    height: 40,
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#f8f8f8",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    fontWeight: "bold",
    color: "#007AFF",
  },
  communityItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 10,
    borderRadius: 8,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 4,
  },
  communityImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
  },
  communityDetails: {
    flex: 1,
    justifyContent: "center",
  },
  communityName: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#333",
  },
  communityDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
});
