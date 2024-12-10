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
  tags: string[]; // タグは配列として保持
  imageUrl?: string;
};

const CommunityScreen: React.FC<{ navigation: StackNavigationProp<any> }> = ({
  navigation,
}) => {
  const [selectedTab, setSelectedTab] = useState<string>("サーフィン");
  const [searchText, setSearchText] = useState<string>("");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [tags, setTags] = useState<string[]>([]); // ユニークなタグのリスト

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

        // ユニークなタグを抽出
        const allTags: string[] = [];
        formattedCommunities.forEach((community) => {
          if (community.tags) {
            allTags.push(...community.tags);
          }
        });
        setTags([...new Set(allTags)]); // 重複を除去
      });
    };

    fetchCommunities();
  }, []);

  const filterCommunities = (tag: string, text: string) =>
    communities.filter((community) => {
      // tagsが存在するかを確認
      if (community.tags && Array.isArray(community.tags)) {
        return (
          community.tags.includes(tag) &&
          (community.title.toLowerCase().includes(text.toLowerCase()) ||
            (community.description &&
              community.description.toLowerCase().includes(text.toLowerCase())))
        );
      }
      return false;
    });

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
        {tags.length > 0 ? (
          tags.map((tag) => (
            <TouchableOpacity key={tag} onPress={() => setSelectedTab(tag)}>
              <Text
                style={
                  selectedTab === tag ? styles.activeTabText : styles.tabText
                }
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text>タグがありません</Text>
        )}
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
    backgroundColor: "#007AFF", // Facebook風の青
    paddingVertical: 15,
    margin: 15,
    borderRadius: 25, // 丸みを強調
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 6,
    position: "absolute", // 下部に配置
    bottom: 20, // 下からの距離
    left: 15,
    right: 15,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  searchInput: {
    height: 45,
    marginHorizontal: 15,
    marginVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: "#f1f1f1",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#f4f4f4", // タブ背景を少し薄いグレーに
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 15,
  },
  tabText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20, // 丸いボタンにする
    backgroundColor: "#f1f1f1", // タグの背景色
  },
  activeTabText: {
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#007AFF", // アクティブなタブに色をつける
  },
  communityItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 12,
    borderRadius: 15, // 丸みを強調
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    elevation: 5,
  },
  communityImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  communityDetails: {
    flex: 1,
    justifyContent: "center",
  },
  communityName: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#333",
    marginBottom: 5,
  },
  communityDescription: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    justifyContent: "flex-start", // タグを左寄せに
  },
  tagButton: {
    backgroundColor: "#f0f2f5", // Facebook風の薄いグレー
    borderRadius: 30, // 丸みを持たせる
    paddingVertical: 10,
    paddingHorizontal: 20,
    margin: 5,
    borderWidth: 1,
    borderColor: "#d8d8d8", // ボーダーも薄く
  },
  selectedTagButton: {
    backgroundColor: "#007AFF", // Facebook風の青色
    borderColor: "#007AFF", // 同じ色のボーダー
  },
  tagText: {
    fontSize: 16,
    color: "#555",
  },
  selectedTagText: {
    color: "#fff", // 選択されたタグは白文字
    fontWeight: "bold", // 強調するために太字に
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
});
