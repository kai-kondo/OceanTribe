import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator"; // 修正済み

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AddSpot">;
};

const AdminScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>管理者画面</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("AddSpot")}
      >
        <Text style={styles.buttonText}>新しいスポットを追加する</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#ffd700",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
});

export default AdminScreen;
