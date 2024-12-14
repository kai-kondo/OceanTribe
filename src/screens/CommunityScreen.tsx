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
    <View style={styles.container}>
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
            <TouchableOpacity
              key={tag}
              onPress={() => setSelectedTab(tag)}
              style={[
                styles.tabButton,
                selectedTab === tag && styles.activeTabButton,
              ]}
            >
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
  container: {
    flex: 1,
    backgroundColor: "#B3E5FC", // 背景色を水色に変更
  },
  createButton: {
    backgroundColor: "#00BFFF", // ボタンの水色
    paddingVertical: 15,
    margin: 15,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#00BFFF", // 水色に合わせた影の色
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 6,
    position: "absolute",
    bottom: 20,
    left: 15,
    right: 15,
  },
  createButtonText: {
    color: "#fff", // 白い文字色
    fontWeight: "bold",
    fontSize: 18,
  },
  searchInput: {
    height: 45,
    marginHorizontal: 15,
    marginVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: "#E8F5FE", // 優しい水色のグラデーション
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#00BFFF", // 水色で目立たせる
    fontSize: 16,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff", // ホーム画面に合わせて白
    borderBottomWidth: 1,
    borderBottomColor: "#ddd", // 下の線を薄いグレー
    marginBottom: 15,
  },
  tabButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#f1f1f1", // 優しいグレー背景
    marginHorizontal: 5, // タブ間のスペース
  },
  tabText: {
    fontSize: 16,
    color: "#00BFFF", // 水色
    fontWeight: "500",
  },
  activeTabButton: {
    backgroundColor: "#00BFFF", // アクティブタブ背景色を水色に
  },
  activeTabText: {
    fontWeight: "bold",
    color: "#fff", // アクティブタブは白文字
  },
  communityItem: {
    flexDirection: "row",
    backgroundColor: "#fff", // コミュニティアイテムの背景を白
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 12,
    borderRadius: 15,
    shadowColor: "#ccc", // 薄いグレー影
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
    borderColor: "#ddd", // 明るいグレー
  },
  communityDetails: {
    flex: 1,
    justifyContent: "center",
  },
  communityName: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#333", // 濃いグレーで文字を際立たせる
    marginBottom: 5,
  },
  communityDescription: {
    fontSize: 14,
    color: "#777", // 薄いグレーで落ち着いた印象
    marginTop: 5,
  },
});
