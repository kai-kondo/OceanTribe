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
} from "react-native";
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

  const [comments, setComments] = useState<Comment[]>([]); // 初期値を空の配列に設定
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [newComment, setNewComment] = useState("");

  const db = getDatabase();
  const commentsRef = ref(db, `communities/${community.id}/comments`);
  const usersRef = ref(db, "users");

  // コメントデータを取得
  useEffect(() => {
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      const data = snapshot.val() || {}; // dataがnullの場合は空オブジェクトを使用
      const commentList: Comment[] = Object.values(data);
      setComments(commentList);
    });

    return () => unsubscribe();
  }, []);

  // ユーザー情報を取得
  useEffect(() => {
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {}; // dataがnullの場合は空のオブジェクトを使用
      setUsers(data);
    });

    return () => unsubscribe();
  }, []);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const auth = getAuth();
      const userId = auth.currentUser ? auth.currentUser.uid : null; // ログインユーザーのIDを取得
      if (userId) {
        push(commentsRef, {
          content: newComment,
          userId,
          likes: 0,
          replies: [],
        });
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

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.communityInfoContainer}>
        {/* コミュニティアイコン */}
        <Image
          source={{
            uri: community.imageUrl || "https://via.placeholder.com/80",
          }}
          style={styles.communityIcon}
        />
        <View style={styles.communityInfo}>
          <Text style={styles.communityTitle}>{community.title}</Text>
          <View style={styles.communityStats}>
            <Text style={styles.statsText}>メンバー 125人</Text>
            <Text style={styles.statsText}>・</Text>
            <Text style={styles.statsText}>投稿 89件</Text>
          </View>
        </View>
      </View>

      {/* コミュニティの説明 */}
      <Text style={styles.description}>{community.description}</Text>

      {/* アクションボタン */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>参加する</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inviteButton}>
          <Text style={styles.inviteButtonText}>友達を招待</Text>
        </TouchableOpacity>
      </View>

      {/* トピック一覧ヘッダー */}
      <View style={styles.topicsHeader}>
        <Text style={styles.topicsTitle}>トピック一覧</Text>
        <TouchableOpacity style={styles.newTopicButton}>
          <Text style={styles.newTopicText}>新規作成</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderComment = ({ item, index }: { item: Comment; index: number }) => {
    const user = users[item.userId] || {};
    const username = user.username || "不明";
    const mediaUrl = user.mediaUrl || "https://via.placeholder.com/40";
    const homePoint = user.homePoint || "不明";

    return (
      <View style={styles.commentContainer}>
        <View style={styles.userInfo}>
          <Image source={{ uri: mediaUrl }} style={styles.userAvatar} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{username}</Text>
            <Text style={styles.timestamp}>2時間前</Text>
          </View>
        </View>
        <Text style={styles.commentContent}>{item.content}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Image
              source={require("../assets/icons/like.png")}
              style={styles.actionIcon}
            />
            <Text style={styles.actionCount}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Image
              source={require("../assets/icons/comment.png")}
              style={styles.actionIcon}
            />
            <Text style={styles.actionCount}>{item.replies?.length || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return(
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item, index) => index.toString()}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.contentContainer}
        />

        {/* コメント入力エリア */}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
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
});

export default CommunityDetailScreen;
