import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; 

const auth = getAuth();

const StarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Text key={i} style={i < rating ? styles.filledStar : styles.emptyStar}>
        {'★'}
      </Text>
    );
  }
  return <View style={styles.starContainer}>{stars}</View>;
};

const HomeScreen = ({ navigation }: any) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null); // userData を初期化

  useEffect(() => {
    const db = getDatabase();

    // "posts"データを取得
    const postsRef = ref(db, 'posts');
    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      const formattedPosts = data ? Object.entries(data).map(([id, post]: [string, any]) => ({ id, ...post })) : [];
      setPosts(formattedPosts);
    });

    // "communities"データを取得
    const communitiesRef = ref(db, 'communities');
    onValue(communitiesRef, (snapshot) => {
      const data = snapshot.val();
      const formattedCommunities = data ? Object.entries(data).map(([id, community]: [string, any]) => ({ id, ...community })) : [];
      setCommunities(formattedCommunities);
    });

    // "events"データを取得（イベントの取得処理）
    const eventsRef = ref(db, 'events');
    onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      const formattedEvents = data ? Object.entries(data).map(([id, event]: [string, any]) => ({ id, ...event })) : [];
      setEvents(formattedEvents);
    });

    // Firebase Auth のユーザーデータを監視
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // ユーザーがログインしている場合、追加情報を取得
        const userRef = ref(db, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          const userDataFromDb = snapshot.val();
          if (userDataFromDb) {
            setUserData({ ...user, ...userDataFromDb }); // AuthデータとDBデータを統合
          }
        });
      } else {
        setUserData(null); // ユーザーがログアウトした場合
      }
    });
    return () => unsubscribe(); // コンポーネントのクリーンアップ時にリスナーを解除
  }, []);

  const renderPostItem = ({ item }: any) => (
    <View style={styles.postCard}>
      {/* 投稿画像 */}
      <Image source={{ uri: item.mediaUrl }} style={styles.postImage} />
      
      {/* 投稿情報 */}
      <View style={styles.postInfo}>
        <Text style={styles.postTitle}>{item.surfSpotName}</Text>
        <Text style={styles.postTime}>
          {new Date(item.surfDate).toLocaleDateString()} - {item.surfTime}
        </Text>
        {item.reviewStars && <StarRating rating={item.reviewStars} />}
        <Text style={styles.postComment}>{item.reviewComment}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* HeaderはFlatListの外に配置 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../assets/icons/iconmain3.png")}
            style={styles.headerIcon}
          />
          <Text style={styles.headerTitle}>OCEANTRIBE</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity>
            <Image
              source={require("../assets/icons/notifi.png")}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            {userData?.mediaUrl ? (
              <Image source={{ uri: userData.mediaUrl }} style={styles.avatar} />
            ) : (
              <Image source={require('../assets/icons/notification.png')} style={styles.avatar} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* FlatList本体 */}
      <FlatList
        style={styles.container}
        data={posts} // 投稿データを渡す
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={() => (
          <>
            {/* イベントリスト 横スクロール */}
            <Text style={styles.sectionTitle}>おすすめイベント</Text>
            <FlatList
              data={events}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.eventCard}>
                  <Image source={{ uri: item.mediaUrl }} style={styles.eventImage} />
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <Text style={styles.eventDate}>
                    {new Date(item.date).toLocaleString('ja-JP', {
                      timeZone: 'Asia/Tokyo',
                      hour: '2-digit',
                      minute: '2-digit',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}>
                    <Text style={styles.detailButton}>詳細を確認</Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            {/* コミュニティリスト 横スクロール */}
            <Text style={styles.sectionTitle}>おすすめコミュニティ</Text>
            <FlatList
              data={communities}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.communityCard}>
                  <Image source={{ uri: item.imageUrl }} style={styles.communityImage} />
                  <Text style={styles.communityTitle}>{item.title}</Text>
                  <Text style={styles.communityDescription}>{item.description}</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('CommunityDetail', { communityId: item.id })}>
                    <Text style={styles.communityButton}>コミュニティを見る</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            <Text style={styles.sectionTitle}>新着投稿</Text>
          </>
        )}
        renderItem={renderPostItem} // 投稿リストをレンダリング
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B3E5FC', // 水色系の背景色
    padding: 15,
  },
  header: {
    width: '100%',
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#4FC3F7", // 水色系のボーダー色
    backgroundColor: "#4FC3F7", // 水色系
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 35,
    height: 35,
    resizeMode: "contain",
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    width: 24,
    height: 24,
    tintColor: "#FFFFFF", // ホワイト
    marginRight: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25, // 丸型アバター
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#0288D1', // 青色（少し濃い水色）
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginRight: 20,
    width: 250,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  eventImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0288D1', // 青色
  },
  eventDate: {
    fontSize: 14,
    color: '#0288D1', // 青色
    marginVertical: 5,
  },
  detailButton: {
    color: '#4FC3F7', // 水色系
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  postInfo: {
    padding: 15,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0288D1', // 青色
  },
  postTime: {
    fontSize: 12,
    color: '#0288D1', // 青色
    marginBottom: 10,
  },
  postComment: {
    fontSize: 14,
    color: '#0288D1', // 青色
    lineHeight: 20,
  },
  starContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  filledStar: {
    color: '#FFD700', // ゴールド
    fontSize: 20,
  },
  emptyStar: {
    color: '#BDC3C7', // グレー
    fontSize: 20,
  },

  communityCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginRight: 20,
    width: 250,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  communityImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  communityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0288D1', // 青色
  },
  communityDescription: {
    fontSize: 14,
    color: '#0288D1', // 青色
    marginVertical: 5,
  },
  communityButton: {
    color: '#4FC3F7', // 水色系
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
});


export default HomeScreen;
