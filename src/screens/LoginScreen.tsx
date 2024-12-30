import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  Image,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { login } from "../services/firebase"; // firebaseConfigから正しいパスに修正

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Main: {
    screen: "Home" | "Event" | "News" | "Notification" | "Messages";
  };
  Admin: undefined;
  AddSpot: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fadeAnim] = useState(new Animated.Value(0)); // アニメーションのための変数

  const handleLogin = () => {
    login(email, password)
      .then(() => {
        alert("ログイン成功");
        navigation.navigate("Main", { screen: "Home" });
      })
      .catch((error: any) => {
        alert(`ログインに失敗しました: ${error.message}`);
      });
  };

  // アニメーションの開始
  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  // ログイン画面がレンダリングされるときにアニメーションを開始
  React.useEffect(() => {
    fadeIn();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          <Image
            source={require("../assets/icons/OceanTribeLogo.png")} // ロゴを残す
            style={styles.logo}
          />
          <Text style={styles.title}>OceanTribe</Text>
          <Text style={styles.subtitle}>ログイン</Text>

          <TextInput
            style={styles.input}
            placeholder="メールアドレス"
            placeholderTextColor="#ddd"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="パスワード"
            placeholderTextColor="#ddd"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>ログイン</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupLink}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={styles.signupText}>新規登録はこちら</Text>
          </TouchableOpacity>

        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F9FF", // 明るく爽やかな青（新しい背景色）
  },
  backgroundContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#B3E5FC", // 優しい空色
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 30,
    borderRadius: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 20,
    alignSelf: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#0288D1", // 鮮やかな青でタイトルを目立たせる
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#01579B", // 深い海の青で落ち着いた印象
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#0288D1",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingLeft: 15,
    fontSize: 16,
    backgroundColor: "#ffffff", // 入力欄は白でシンプルに
  },
  button: {
    backgroundColor: "#0288D1", // 鮮やかな青でボタンを際立たせる
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff", // ボタンの文字は白で視認性を高める
  },
  signupLink: {
    alignItems: "center",
    marginBottom: 10,
  },
  signupText: {
    color: "#01579B", // 落ち着いた青でリンクを目立たせすぎない
    fontSize: 16,
    textDecorationLine: "underline",
  },
  adminLink: {
    alignItems: "center",
  },
  adminText: {
    color: "#0288D1", // 管理者リンクは鮮やかな青で強調
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LoginScreen;
