import React, { useState, useCallback } from "react";
import { Image, StyleSheet, FlatList, TouchableOpacity, Platform, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { fetchQuizzes, uploadQuiz } from "../services/quiz-services";
import { Quiz } from "../types/quiz";
import ModalQuizForm from "@/components/ModalQuizForm";

export default function HomeScreen() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isTeacher, setIsTeacher] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const checkUserRole = useCallback(async () => {
    try {
      const userRole = await AsyncStorage.getItem("userRole");
      console.log("Current user role:", userRole); // Debug log
      setIsTeacher(userRole === "teacher");
    } catch (error) {
      console.error("Error checking user role:", error);
    }
  }, []);

  const loadQuizzes = useCallback(async () => {
    try {
      const fetchedQuizzes = await fetchQuizzes();
      setQuizzes(fetchedQuizzes);
    } catch (error) {
      console.error("Error loading quizzes:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkUserRole();
      loadQuizzes();
    }, [checkUserRole, loadQuizzes])
  );

  const renderQuizCard = ({ item }: { item: Quiz }) => (
    <ThemedView style={styles.quizCard}>
      <ThemedText type="subtitle" style={styles.quizTitle} numberOfLines={2}>
        {item.titulo}
      </ThemedText>
      <ThemedText style={styles.quizDescription} numberOfLines={3}>
        {item.descripcion}
      </ThemedText>
      <ThemedText
        type="defaultSemiBold"
        style={styles.quizCreator}
        numberOfLines={1}
      >
        Creator: {item.creadorId ?? "Not specified"}
      </ThemedText>
    </ThemedView>
  );

  const handleUploadQuiz = async (
    title: string,
    description: string,
    fileContent: string,
    fileName: string
  ) => {
    try {
      const creadorId = await AsyncStorage.getItem("userId");
      if (!creadorId) {
        Alert.alert("Error", "User ID not found");
        return;
      }

      await uploadQuiz(creadorId, title, description, fileContent, fileName);

      Alert.alert("Success", "Quiz uploaded successfully");
      loadQuizzes(); // Refresh quiz list
    } catch (error) {
      console.error("Error uploading quiz:", error);
      Alert.alert("Error", "Failed to upload quiz. Please try again.");
    }
  };

  const openModal = () => {
    console.log("Opening modal"); // Debug log
    setModalVisible(true);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to your quiz!</ThemedText>
      </ThemedView>
      <FlatList
        data={quizzes}
        renderItem={renderQuizCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.quizGrid}
        contentContainerStyle={styles.quizListContainer}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={openModal}
        accessibilityRole="button"
      >
        <ThemedText style={styles.addButtonText}>Add Quiz</ThemedText>
      </TouchableOpacity>
      <ModalQuizForm
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onUploadQuiz={handleUploadQuiz}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  quizListContainer: {
    paddingHorizontal: 8,
  },
  quizGrid: {
    display: "flex",
    flexWrap: "wrap",
  },
  quizCard: {
    backgroundColor: "rgb(29, 61, 71)",
    borderRadius: 10,
    padding: 16,
    margin: 8,
    width: 160,
    height: 200,
    justifyContent: "space-between",
  },
  quizTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  quizDescription: {
    color: "white",
    fontSize: 14,
    marginBottom: 8,
    flex: 1,
  },
  quizCreator: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
  },
  authButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "rgb(29, 61, 71)",
    padding: 10,
    borderRadius: 5,
  },
  authButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: "80%",
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "rgb(29, 61, 71)",
    padding: 10,
    borderRadius: 5,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
