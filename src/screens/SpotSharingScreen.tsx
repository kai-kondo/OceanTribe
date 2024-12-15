import React, { useEffect, useState,useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  TextInput,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import { getDatabase, ref, get, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";

const { width } = Dimensions.get("window");

type Post = {
  id: string;
  userId: string;
  content: string;
  media?: string;
  userData?: User;
  comment?: string;
  congestion?: string;
  createdAt?: string;
  reviewStars?: number;
  selectedArea?: string;
  surfDate?: string;
  surfSpotName?: string;
  surfTime?: string;
  waveCondition?: string;
  waveHeight?: string;
  mediaUrl?: string;
  reviewCount?: string;
};

type User = {
  username: string;
  avatarUrl?: string;
  boardType?: string;
  homePoint?: string;
  mediaUrl?: string;
};

const SpotSharingScreen = () => {
  const navigation = useNavigation<any>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>('すべて');
  const scrollViewRef = useRef<ScrollView | null>(null); // ScrollViewの参照を保持
  const [searchText, setSearchText] = useState('');

  // エリアの選択肢
  const areas = ['すべて', '北海道・東北', '茨城', '千葉北', '千葉南','湘南','西湘','伊豆','静岡','伊良湖','伊勢','和歌山','四国','南九州','北九州','日本海','アイランド'];

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area); // 選択されたエリアを状態にセット
  };

  // フィルタリングロジック
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.surfSpotName?.toLowerCase().includes(searchText.toLowerCase()) ||
                          post.content?.toLowerCase().includes(searchText.toLowerCase());
    const matchesArea = selectedArea === 'すべて' || post.selectedArea === selectedArea;
    return matchesSearch && matchesArea;
  });

  useEffect(() => {
    const db = getDatabase();
    const postsRef = ref(db, "posts");
    const usersRef = ref(db, "users");

    // リアルタイムリスナーを追加
    const fetchPostsAndUsers = async (snapshot: any) => {
      try {
        const postsData = snapshot.val() || {};
        const usersSnapshot = await get(usersRef);
        const usersData = usersSnapshot.val() || {};

        const combinedData = Object.entries(postsData).map(([id, post]: [string, any]) => {
          // ユーザーデータを取得
          const userData = usersData[post.userId] || {};

          // 投稿データを整形
          return {
            id,
            ...post,
            userData: {
              username: userData.username || '不明ユーザー',
              boardType: userData.boardType || '不明',
              homePoint: userData.homePoint || '未設定',
              mediaUrl: userData.mediaUrl || null,
              socialLinks: userData.socialLinks || {}
            },
            mediaUrl: post.mediaUrl || null,
            comment: post.comment || null
          };
        });

        // 日付順にソート
        const sortedData = combinedData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        console.log('Sorted Combined Data:', sortedData); // デバッグ用
        setPosts(sortedData);
      } catch (error) {
        console.error('データの取得中にエラーが発生しました:', error);
      }
    };

    // postsRefに対してリスナーを設定
    const unsubscribe = onValue(postsRef, fetchPostsAndUsers);

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, "users");

    const fetchUserData = async () => {
      const user = getAuth().currentUser;
      if (user) {
        const userSnapshot = await get(ref(db, `users/${user.uid}`));
        setUserData(userSnapshot.val() || null);
      }
    };

    fetchUserData();
  }, []);

  const renderPostItem = ({ item }: { item: Post }) => {
    const user = item.userData;

    return (
      <View style={styles.postCard}>
        {/* ユーザー情報 */}
        <View style={styles.postHeader}>
          <Image
            source={{ uri: user?.mediaUrl || "https://via.placeholder.com/50" }}
            style={styles.avatar}
          />
          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>
              {user?.username || "不明ユーザー"}
            </Text>
            <Text style={styles.boardType}>
              ボードタイプ: {user?.boardType || "不明"}
            </Text>
            <View style={styles.homePointContainer}>
              <Image
                source={require("../assets/icons/surfing.png")}
                style={styles.homePointIcon}
              />
              <Text style={styles.homePointText}>
                ホームポイント: {user?.homePoint || "未設定"}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.postContentContainer}>


       {/* 投稿画像 */}
        {item.mediaUrl && (
          <View style={styles.mediaContainer}>
            <Image source={{ uri: item.mediaUrl }} style={styles.media} />
          </View>
        )}

        {/* コメント */}
        {item.comment && (
          <Text style={[styles.postDetails, { fontSize: 16, marginTop: 10 }]}>
            {item.comment}
          </Text>
        )}

        {/* コンテンツ */}
        <View style={styles.infoGrid}>
          {/* 左側 */}
          <View style={styles.infoColumn}>

            {/* サーフポイント名 */}
            {item.surfSpotName && (
              <View style={styles.infoRow}>
                <Image
                  source={require("../assets/icons/spot.png")}
                  style={styles.infoIcon}
                />
                <Text style={styles.postDetails}>{item.surfSpotName}</Text>
              </View>
            )}
            {/* 混雑度 */}
            {item.congestion && (
              <View style={styles.infoRow}>
                <Image
                  source={require("../assets/icons/congestion.png")}
                  style={styles.infoIcon}
                />
                <Text style={styles.postDetails}>{item.congestion}</Text>
              </View>
            )}
            {/* 評価 */}
            {item.reviewStars && (
              <View style={styles.infoRow}>
                <Text style={styles.postDetails}>
                  おすすめ：⭐{item.reviewStars}
                </Text>
              </View>
            )}
          </View>
            {/* 右側 */}
          <View style={styles.infoColumn}>
            {/* 日時 */}
            {item.surfDate && item.surfTime && (
              <View style={styles.infoRow}>
                <Image
                  source={require("../assets/icons/clock.png")}
                  style={styles.infoIcon}
                />
                <Text style={styles.postDetails}>
                  {item.surfDate} {item.surfTime}
                </Text>
              </View>
            )}
            {/* 波のコンディション */}
            {item.waveCondition && (
              <View style={styles.infoRow}>
                <Image
                  source={require("../assets/icons/wave.png")}
                  style={styles.infoIcon}
                />
                <Text style={styles.postDetails}>{item.waveCondition}</Text>
              </View>
            )}
            {/* 波のサイズ */}
            {item.waveHeight && (
              <View style={styles.infoRow}>
                <Image
                  source={require("../assets/icons/height.png")}
                  style={styles.infoIcon}
                />
                <Text style={styles.postDetails}>{item.waveHeight}</Text>
              </View>
            )}

          </View>
        </View>

        {/* アクションバー */}
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionButton}>
            <Image
              source={require("../assets/icons/like.png")}
              style={styles.actionIcon}
            />
            <Text style={styles.actionButtonText}>いいね</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Image
              source={require("../assets/icons/comment.png")}
              style={styles.actionIcon}
            />
            <Text style={styles.actionButtonText}>コメント</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Image
              source={require("../assets/icons/share.png")}
              style={styles.actionIcon}
            />
            <Text style={styles.actionButtonText}>共有</Text>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    );
  };

   // エリアボタンを2行に均等に分割
   const getAreasForRows = () => {
    const middleIndex = Math.ceil(areas.length / 2);
    return {
      firstRow: areas.slice(0, middleIndex),
      secondRow: areas.slice(middleIndex)
    };
  };

  // エリアボタンを2行で表示するコンポーネント
  const AreaSelector = () => {
    const { firstRow, secondRow } = getAreasForRows();

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.areaButtonContainer}
        style={styles.areaButtonScrollView}
      >
        <View style={{width: width * 2}}>
          {/* 1行目 */}
          <View style={styles.areaButtonRow}>
            {firstRow.map((area) => (
              <TouchableOpacity
                key={area}
                style={[
                  styles.areaButton,
                  selectedArea === area && styles.selectedAreaButton,
                ]}
                onPress={() => handleAreaSelect(area)}
              >
                <Text style={styles.areaButtonText}>{area}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 2行目 */}
          <View style={[styles.areaButtonRow, { marginBottom: 30 }]}>
            {secondRow.map((area) => (
              <TouchableOpacity
                key={area}
                style={[
                  styles.areaButton,
                  selectedArea === area && styles.selectedAreaButton,
                ]}
                onPress={() => handleAreaSelect(area)}
              >
                <Text style={styles.areaButtonText}>{area}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="サーフスポット名を検索"
        value={searchText}
        onChangeText={setSearchText}
      />
    </View>

      <AreaSelector />


      <FlatList
        data={filteredPosts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.timeline}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("SpotDetail")}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // 全体のコンテナ
  container: {
    flex: 1,
    backgroundColor: "#B3E5FC", // 白に近い淡いグレー
  },

  // 投稿カード関連
  postCard: {
    backgroundColor: "#FFFFFF",
    marginVertical: 12,
    marginHorizontal: 0,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
    padding: 0, // カード内の余白を削減
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10, // 余白を追加
    marginBottom: 0,
  },
  postContentContainer: {
    marginVertical: 0,
  },
  postContent: {
    fontSize: 16,
    color: "#444",
    lineHeight: 22,
  },
  postDetails: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },

  // ユーザー情報関連
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600", // 太字
    color: "#333",
  },
  boardType: {
    fontSize: 14,
    color: "#888", // ソフトな色調
    marginTop: 2,
  },

  // ホームポイント情報関連
  homePointContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  homePointIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
    marginRight: 4,
  },
  homePointText: {
    fontSize: 14,
    color: "#3AAAD2", // アクセントカラー
  },

  // メディア関連
  mediaContainer: {
    width: "100%", // 画面幅全体に表示
    backgroundColor: "#EFEFEF",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 15, // 上下の余白を調整
  },
  media: {
    width: "100%", // 横幅いっぱいに表示
    aspectRatio: 1, // 正方形のアスペクト比（インスタグラム風）
    resizeMode: "cover", // 画像をトリミングして全体を埋める
  },

  // アクションバー関連
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 10,
    paddingBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
    tintColor: "#666",
  },
  actionButtonText: {
    fontSize: 12,
    color: "#666",
  },

  // タイムライン関連
  timeline: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },

  // 情報グリッド関連
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  infoColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  infoIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },

  // FAB関連
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#FF6F61", // 明るいオレンジ
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  fabText: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  areaButtonScrollView: {
    maxHeight: 110, // 2行分の高さを確保
  },
  areaButtonContainer: {
    paddingHorizontal: 0,
    paddingVertical: 10,
  },
  areaButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // 左寄せに変更
    flexWrap: 'wrap', // 折り返しを許可
    marginBottom: 3, // 行間のマージン
    paddingHorizontal: 10, // ボタン全体に少し余白を追加
  },
  areaButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    borderRadius: 16,
    backgroundColor: "#E0E0E0",
  },
  selectedAreaButton: {
    backgroundColor: "#FF6F61",
  },
  areaButtonText: {
    fontSize: 12,
    color: "#333",
  },

  // 検索窓関連
  searchContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
    marginBottom: 10, // タブと検索窓の間にスペースを追加
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
  },
});



export default SpotSharingScreen;
