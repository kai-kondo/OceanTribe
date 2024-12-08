import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  SafeAreaView,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { signup, auth, onAuthStateChanged } from "../services/firebase";


export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Main: {
    screen: "Home" | "Event" | "News" | "Notification" | "Messages";
  };
  ProfileCreate: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "SignUp">;
};

const SignUpScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert("パスワードが一致しません");
      return;
    }

    try {
      const user = await signup(email, password);

      if (user) {
        alert("登録が完了しました！");
        // 認証状態の確認処理
        onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
            console.log("ユーザー認証完了:", currentUser.uid);
            navigation.navigate("ProfileCreate");
          } else {
            console.log("ユーザー認証エラー");
          }
        });
      }
    } catch (error: any) {
      alert(`登録に失敗しました！${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../assets/images/login.jpg")}
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.7 }}
      >
        <View style={styles.gradientOverlay}>
          {/* ヘッダー */}
          <View style={styles.headerContainer}>
            <Image
              source={require("../assets/icons/iconmain3.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>OceanTribe</Text>
            <Text style={styles.subtitle}>Join the Tribe, Ride the Waves</Text>
          </View>

          {/* フォームコンテナ */}
          <View style={styles.formContainer}>
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
            <TextInput
              style={styles.input}
              placeholder="パスワード確認"
              placeholderTextColor="#ddd"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
              <Text style={styles.buttonText}>新規登録</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.loginText}>
                既にアカウントをお持ちですか？ログイン
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
  },
  gradientOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#ddd",
    textAlign: "center",
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  input: {
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: "white",
  },
  button: {
    backgroundColor: "#ffd700",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  loginLink: {
    alignItems: "center",
  },
  loginText: {
    color: "#ddd",
    fontSize: 14,
  },
});

export default SignUpScreen;
