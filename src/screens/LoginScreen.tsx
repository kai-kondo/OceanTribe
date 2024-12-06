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
import { login } from "../services/firebase"; // firebaseConfigから正しいパスに修正


export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Main: {
    screen: "Home" | "Event" | "News" | "Notification" | "Messages";
  };
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    login(email, password)
      .then(() => {
        alert("ログイン成功");
        navigation.navigate("Main", { screen: "Home" });
      })
      .catch((error:any) => {
        alert(`ログインに失敗しました: ${error.message}`);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../assets/images/login.jpg")}
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.7 }}
      >
        <View style={styles.gradientOverlay}>
          <View style={styles.headerContainer}>
            <Image
              source={require("../assets/icons/OceanTribe2.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>OceanTribe</Text>
            <Text style={styles.subtitle}>Join the Tribe, Ride the Waves</Text>
          </View>

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
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>ログイン</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signupLink}
              onPress={() => navigation.navigate("SignUp")}
            >
              <Text style={styles.signupText}>新規登録はこちら</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // グラデーション風の半透明オーバーレイ
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
  signupLink: {
    alignItems: "center",
  },
  signupText: {
    color: "#ddd",
    fontSize: 14,
  },
});

export default LoginScreen;
