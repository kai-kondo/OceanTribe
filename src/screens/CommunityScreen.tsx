import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  Dimensions,
} from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

const { width } = Dimensions.get("window");

type Community = {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  imageUrl?: string;
  memberCount?: number;
  lastActive?: string;
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
        navigation.navigate("CommunityDetail", { community: item })
      }
      style={styles.communityCard}
    >
      <View style={styles.communityHeader}>
        <Image source={{ uri: item.imageUrl }} style={styles.communityImage} />
        <View style={styles.communityInfo}>
          <Text style={styles.communityTitle}>{item.title}</Text>
          <View style={styles.statsContainer}>
            <Image
              source={require("../assets/icons/community2.png")}
              style={styles.statsIcon}
            />
            <Text style={styles.statsText}>{item.memberCount || 0}人</Text>
            <Text style={styles.lastActive}>
              最終更新: {item.lastActive || "数日前"}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.tagContainer}>
        {item.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const filteredCommunities = filterCommunities(selectedTab, searchText);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={require("../assets/icons/headerCommunity.png")}
            style={styles.communityIcon}
          />
          <View>
            <Text style={styles.headerTitle}>コミュニティ</Text>
            <Text style={styles.headerSubtitle}>
              関心のあるトピックで盛り上がろう！
            </Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Image
          source={require("../assets/icons/sarch.png")}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="コミュニティを検索"
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tags}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedTab(item)}
              style={[
                styles.categoryTab,
                selectedTab === item && styles.selectedCategoryTab,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedTab === item && styles.selectedCategoryText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Communities List */}
      <FlatList
        data={filteredCommunities}
        renderItem={renderCommunityItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.communityList}
        showsVerticalScrollIndicator={false}
      />

      {/* Create Community Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("CommunityCreate")}
      >
        <Text style={styles.createButtonText}>＋ 新規作成</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F9FF",
  },
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: "#999999",
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333333",
  },
  categoryContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  selectedCategoryTab: {
    backgroundColor: "#2196F3",
  },
  categoryText: {
    fontSize: 14,
    color: "#666666",
  },
  selectedCategoryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  communityList: {
    padding: 16,
  },
  communityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  communityHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  communityImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  communityInfo: {
    flex: 1,
    justifyContent: "center",
  },
  communityTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
    tintColor: "#666666",
  },
  statsText: {
    fontSize: 14,
    color: "#666666",
    marginRight: 12,
  },
  lastActive: {
    fontSize: 12,
    color: "#999999",
  },
  description: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#666666",
  },
  createButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  createButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default CommunityScreen;
