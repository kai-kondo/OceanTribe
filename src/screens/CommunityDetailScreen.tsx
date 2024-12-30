import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { getDatabase, ref, push, onValue, set, get } from "firebase/database";
import { getAuth } from "firebase/auth";

// 既存の型定義に加えて、メンバー情報の型を追加
type Member = {
  userId: string;
  joinedAt: number;
};

type User = {
  username: string;
  mediaUrl?: string;
  boardType?: string;
  homePoint?: string;
};

type Comment = {
  id: string;
  content: string;
  userId: string;
  likesCount: number;
  likedBy: { [key: string]: boolean };
  replies: Reply[];
  createdAt: number;
};

type Reply = {
  id: string;
  content: string;
  userId: string;
  createdAt: number;
};

const CommunityDetailScreen = ({ route }: any) => {
  const { community } = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [newComment, setNewComment] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [replyInputVisible, setReplyInputVisible] = useState<{
    [key: string]: boolean;
  }>({});
  const [replyText, setReplyText] = useState("");

  const db = getDatabase();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  const commentsRef = ref(db, `communities/${community.id}/comments`);
  const usersRef = ref(db, "users");
  const membersRef = ref(db, `communities/${community.id}/members`);

  /// コメントデータを取得
  useEffect(() => {
    const unsubscribeComments = onValue(commentsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const commentsList = data
          ? Object.entries(data)
              .map(([id, comment]: [string, any]) => ({
                id,
                ...(comment as Omit<Comment, "id">),
              }))
              .sort((a, b) => b.createdAt - a.createdAt)
          : [];
        setComments(commentsList);
      } catch (error) {
        console.error("コメントの取得でエラーが発生しました:", error);
      }
    });

    return () => unsubscribeComments();
  }, []);

  // ユーザー情報を取得
  useEffect(() => {
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          setUsers(data);
        }
      } catch (error) {
        console.error("ユーザー情報の取得でエラーが発生しました:", error);
      }
    });

    return () => unsubscribeUsers();
  }, []);

  // 投稿時刻を「〇分前」の形式に変換する関数
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    // 1分未満
    if (diff < 60 * 1000) {
      return "たった今";
    }
    // 1時間未満
    if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))}分前`;
    }
    // 24時間未満
    if (diff < 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 60 * 1000))}時間前`;
    }
    // 7日未満
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (24 * 60 * 60 * 1000))}日前`;
    }
    // それ以外は日付を表示
    return new Date(timestamp).toLocaleDateString();
  };

  // メンバー情報を取得
  useEffect(() => {
    if (!userId) return;

    const checkMembership = async () => {
      try {
        const memberSnapshot = await get(
          ref(db, `communities/${community.id}/members/${userId}`)
        );
        setIsJoined(memberSnapshot.exists());
      } catch (error) {
        console.error("メンバー情報の取得でエラー:", error);
      }
    };

    const memberCountRef = ref(db, `communities/${community.id}/members`);
    const unsubscribeMemberCount = onValue(memberCountRef, (snapshot) => {
      try {
        const count = snapshot.exists()
          ? Object.keys(snapshot.val()).length
          : 0;
        setMemberCount(count);
      } catch (error) {
        console.error("メンバー数の取得でエラー:", error);
      }
    });

    checkMembership();

    return () => unsubscribeMemberCount();
  }, [userId, db, community.id]);

  // コミュニティへの参加処理
  const handleJoinCommunity = async () => {
    if (!userId) {
      Alert.alert("エラー", "ログインが必要です");
      return;
    }

    try {
      await set(ref(db, `communities/${community.id}/members/${userId}`), {
        userId,
        joinedAt: Date.now(),
      });
      setIsJoined(true);
      Alert.alert("成功", "コミュニティに参加しました！");
    } catch (error) {
      Alert.alert("エラー", "コミュニティへの参加に失敗しました");
    }
  };

  // コミュニティからの退出処理
  const handleLeaveCommunity = async () => {
    if (!userId) return;

    try {
      await set(ref(db, `communities/${community.id}/members/${userId}`), null);
      setIsJoined(false);
      Alert.alert("成功", "コミュニティから退出しました");
    } catch (error) {
      Alert.alert("エラー", "コミュニティからの退出に失敗しました");
    }
  };

  // コメント投稿処理を修正
  const handleAddComment = async () => {
    if (!userId) {
      Alert.alert("エラー", "ログインが必要です");
      return;
    }

    if (!isJoined) {
      Alert.alert("エラー", "コミュニティに参加してからコメントしてください");
      return;
    }

    if (newComment.trim()) {
      try {
        await push(commentsRef, {
          content: newComment,
          userId,
          likes: 0,
          replies: [],
          createdAt: Date.now(),
        });
        setNewComment("");
      } catch (error) {
        Alert.alert("エラー", "コメントの投稿に失敗しました");
      }
    }
  };

  const handleLike = async (commentId: string) => {
    if (!userId) {
      Alert.alert("エラー", "ログインが必要です");
      return;
    }

    try {
      const commentRef = ref(
        db,
        `communities/${community.id}/comments/${commentId}`
      );
      const snapshot = await get(commentRef);
      if (snapshot.exists()) {
        const comment = snapshot.val();
        const likedBy = comment.likedBy || {};

        if (likedBy[userId]) {
          // 既に「いいね」済みの場合は解除
          delete likedBy[userId];
        } else {
          // 「いいね」追加
          likedBy[userId] = true;
        }

        const likesCount = Object.keys(likedBy).length;
        await set(commentRef, { ...comment, likedBy, likesCount });
      }
    } catch (error) {
      console.error("いいねの処理でエラー:", error);
    }
  };

  const handleReply = async (commentId: string, replyText: string) => {
    if (!userId) {
      Alert.alert("エラー", "ログインが必要です");
      return;
    }

    if (replyText.trim()) {
      try {
        const repliesRef = ref(
          db,
          `communities/${community.id}/comments/${commentId}/replies`
        );
        await push(repliesRef, {
          content: replyText,
          userId,
          createdAt: Date.now(),
        });
        setReplyText(""); // 返信が成功した後、入力欄をクリア
      } catch (error) {
        Alert.alert("エラー", "返信の投稿に失敗しました");
      }
    }
  };

  const toggleReplyInput = (commentId: string) => {
    setReplyInputVisible((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
    setReplyText("");
  };

  // ヘッダーコンポーネントを修正
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.communityInfoContainer}>
        <Image
          source={{
            uri: community.imageUrl || "https://via.placeholder.com/80",
          }}
          style={styles.communityIcon}
        />
        <View style={styles.communityInfo}>
          <Text style={styles.communityTitle}>{community.title}</Text>
          <View style={styles.communityStats}>
            <Text style={styles.statsText}>メンバー {memberCount}人</Text>
            <Text style={styles.statsText}>・</Text>
            <Text style={styles.statsText}>投稿 {comments.length}件</Text>
          </View>
        </View>
      </View>

      <Text style={styles.description}>{community.description}</Text>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.joinButton, isJoined && styles.joinedButton]}
          onPress={isJoined ? handleLeaveCommunity : handleJoinCommunity}
        >
          <Text style={styles.joinButtonText}>
            {isJoined ? "退出する" : "参加する"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // renderCommentの型を修正
  const renderComment = ({ item }: { item: Comment }) => {
    const user = users[item.userId] || {};

    return (
      <View style={styles.commentContainer}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: user.mediaUrl || "https://via.placeholder.com/40" }}
            style={styles.userAvatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {user.username || "不明なユーザー"}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimestamp(item.createdAt)}
            </Text>
          </View>
        </View>
        <Text style={styles.commentContent}>{item.content}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
          >
            <Text style={styles.actionCount}>
              {item.likesCount || 0} いいね
            </Text>
          </TouchableOpacity>

          <View style={styles.userBoardInfo}>
            {user.boardType && (
              <Text style={styles.boardTypeText}>{user.boardType}</Text>
            )}
            {user.homePoint && (
              <Text style={styles.homePointText}>{user.homePoint}</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id || Math.random().toString()} // idがない場合のフォールバック
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.contentContainer}
        />

        {isJoined && (
          <View style={styles.inputContainer}>
            <Image
              source={{ uri: "https://via.placeholder.com/32" }}
              style={styles.inputAvatar}
            />
            <TextInput
              style={styles.input}
              placeholder="コメントを入力..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !newComment.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleAddComment}
              disabled={!newComment.trim()}
            >
              <Text style={styles.sendButtonText}>送信</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// スタイルに追加
const additionalStyles = StyleSheet.create({
  userBoardInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  boardTypeText: {
    fontSize: 12,
    color: "#666666",
    marginRight: 8,
  },
  homePointText: {
    fontSize: 12,
    color: "#666666",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F9FF",
  },
  contentContainer: {
    paddingBottom: 80,
  },
  headerContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 8,
  },
  communityInfoContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  communityIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  communityInfo: {
    flex: 1,
    justifyContent: "center",
  },
  communityTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
  },
  communityStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsText: {
    fontSize: 14,
    color: "#666666",
    marginRight: 4,
  },
  description: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    marginBottom: 16,
  },
  joinButton: {
    flex: 2,
    backgroundColor: "#FF6B6B",
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  joinedButton: {
    backgroundColor: "#666666",
  },
  joinButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
  },
  inviteButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  inviteButtonText: {
    color: "#FF6B6B",
    textAlign: "center",
    fontWeight: "600",
  },
  topicsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  topicsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  newTopicButton: {
    padding: 8,
  },
  newTopicText: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "600",
  },
  commentContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: "#999999",
  },
  commentContent: {
    fontSize: 15,
    color: "#333333",
    lineHeight: 22,
    marginBottom: 12,
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  actionIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
    tintColor: "#666666",
  },
  actionCount: {
    fontSize: 14,
    color: "#666666",
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#FF6B6B",
    padding: 8,
    borderRadius: 16,
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  sendButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
  replyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  ...additionalStyles,
});

export default CommunityDetailScreen;
