import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import { getDatabase, ref, push, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";

// コメントとユーザー情報の型を定義
type Comment = {
  content: string;
  userId: string;
  likes: number;
  replies: string[];
};

type User = {
  username: string;
  mediaUrl: string;
  homePoint: string;
};

const CommunityDetailScreen = ({ route }: any) => {
  const { community } = route.params;

  const [comments, setComments] = useState<Comment[]>([]);  // 初期値を空の配列に設定
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [newComment, setNewComment] = useState("");

  const db = getDatabase();
  const commentsRef = ref(db, `communities/${community.id}/comments`);
  const usersRef = ref(db, "users");

  // コメントデータを取得
  useEffect(() => {
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      const data = snapshot.val() || {};  // dataがnullの場合は空オブジェクトを使用
      const commentList: Comment[] = Object.values(data);
      setComments(commentList);
    });

    return () => unsubscribe();
  }, []);

  // ユーザー情報を取得
  useEffect(() => {
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {};  // dataがnullの場合は空オブジェクトを使用
      setUsers(data);
    });

    return () => unsubscribe();
  }, []);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const auth = getAuth();
      const userId = auth.currentUser ? auth.currentUser.uid : null; // ログインユーザーのIDを取得
      if (userId) {
        push(commentsRef, { content: newComment, userId, likes: 0, replies: [] });
        setNewComment("");
      } else {
        console.log("ユーザーがログインしていません");
      }
    }
  };

  const handleLike = (index: number) => {
    const updatedComments = [...comments];
    updatedComments[index].likes += 1;
    setComments(updatedComments);
  };

  const handleReply = (index: number, reply: string) => {
    const updatedComments = [...comments];
    updatedComments[index].replies.push(reply);
    setComments(updatedComments);
  };

  // コメントのレンダリング
  const renderComment = ({ item, index }: { item: Comment; index: number }) => {
    const user = users[item.userId] || {}; // コメントに関連するユーザー情報を取得、存在しない場合は空のオブジェクト

    // ユーザー名、ユーザー画像、ホームポイントが存在しない場合はデフォルトの値を使用
    const username = user.username || "不明";
    const mediaUrl =
      user.mediaUrl || "https://www.example.com/sample-image.jpg"; // サンプル画像URL
    const homePoint = user.homePoint || "不明";

    return (
      <View style={styles.commentContainer}>
        <View style={styles.userInfo}>
          <Image source={{ uri: mediaUrl }} style={styles.userImage} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{username}</Text>
            <Text style={styles.homePoint}>{homePoint}</Text>
          </View>
        </View>
        <Text style={styles.commentContent}>{item.content}</Text>

        {/* いいねと返信ボタン */}
        <View style={styles.commentActions}>
          <TouchableOpacity onPress={() => handleLike(index)} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>👍 {item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleReply(index, "新しい返信内容")}
            style={styles.actionButton}
          >
            <Text style={styles.actionButtonText}>返信</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* コミュニティタイトル */}
      <ScrollView style={styles.scrollViewContainer} contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>{community.title}</Text>

        {/* コミュニティ画像 */}
        {community.imageUrl ? (
          <Image source={{ uri: community.imageUrl }} style={styles.image} />
        ) : null}

        {/* コミュニティ説明 */}
        <Text style={styles.description}>{community.description}</Text>

        {/* コメント一覧 */}
        <FlatList
          data={comments}  // ここでコメントデータを使用
          renderItem={renderComment}
          keyExtractor={(item, index) => index.toString()}
        />
      </ScrollView>

      {/* コメント入力フォーム */}
      <View style={styles.inputContainer}>
        <TextInput
          value={newComment}
          onChangeText={setNewComment}
          placeholder="コメントを入力"
          placeholderTextColor="#999"
          style={styles.input}
        />
        <TouchableOpacity onPress={handleAddComment} style={styles.addButton}>
          <Text style={styles.addButtonText}>送信</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B3E5FC",  // メインカラーをライトブルーに
  },
  scrollViewContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 80, // 下のコメント入力フォームのスペース確保
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",  // ヘッダーの文字色
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 15,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: "#555",  // 説明文の色
    marginBottom: 20,
    lineHeight: 22,
    textAlign: "center",
  },
  commentContainer: {
    backgroundColor: "#FFFFFF",  // コメントカード背景
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userImage: {
    width: 35,
    height: 35,
    borderRadius: 25,
    marginRight: 15,
  },
  userDetails: {
    flexDirection: "column",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",  // ユーザー名の色
  },
  homePoint: {
    fontSize: 14,
    color: "#777",  // ホームポイントの色
    marginTop: 4,
  },
  commentContent: {
    fontSize: 18,
    color: "#444",  // コメント内容の色
    marginTop: 8,
  },
  commentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  actionButtonText: {
    fontSize: 16,
    color: "#007AFF",  // いいね・返信ボタンの色
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  input: {
    flex: 1,
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#ccc",  // 入力ボックスの枠線
    backgroundColor: "#f8f8f8",
    fontSize: 16,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#007AFF",  // 送信ボタンの背景色
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CommunityDetailScreen;
