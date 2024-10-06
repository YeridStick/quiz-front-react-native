import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { startQuiz, answerQuestion } from "@/app/services/quiz-services";

interface Question {
  id: string;
  quizId: string;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
}

interface AnsweredQuestion extends Question {
  userAnswer: number;
  isCorrect: boolean;
}

export default function QuizQuestionsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<
    AnsweredQuestion[]
  >([]);

  const startQuizSession = useCallback(async () => {
    try {
      const userName = await AsyncStorage.getItem("userName");
      if (!userName) {
        Alert.alert("Error", "User name not found");
        return;
      }
      const question = await startQuiz(id as string, userName);
      setCurrentQuestion(question);
      setTimeLeft(30);
    } catch (error) {
      console.error("Error starting quiz:", error);
      Alert.alert("Error", "Failed to start the quiz");
    }
  }, [id]);

  useEffect(() => {
    startQuizSession();
  }, [startQuizSession]);

  useEffect(() => {
    if (isQuizFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleAnswer(-1); // Se maneja si el tiempo se agota
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, isQuizFinished]);

  const handleAnswer = async (answerIndex: number) => {
    try {
      const userName = await AsyncStorage.getItem("userName");
      if (!userName) {
        Alert.alert("Error", "User name not found");
        return;
      }

      const response = await answerQuestion(
        id as string,
        userName,
        answerIndex
      );

      if (currentQuestion) {
        const answeredQuestion: AnsweredQuestion = {
          ...currentQuestion,
          userAnswer: answerIndex,
          isCorrect: response.esCorrecta,
        };
        setAnsweredQuestions((prev) => [...prev, answeredQuestion]);
        if (response.esCorrecta) {
          setScore((prevScore) => prevScore + 1);
        }
      }

      if (response.siguientePregunta) {
        // Si hay una siguiente pregunta, actualizamos el estado con la nueva pregunta
        setCurrentQuestion(response.siguientePregunta);
        setTimeLeft(30);
      } else {
        // Si no hay más preguntas, terminamos el quiz
        setIsQuizFinished(true);
        setCurrentQuestion(null); // No más preguntas
        Alert.alert("Quiz Completed", "You have answered all questions!");
      }
    } catch (error: unknown) {
      console.error("Error answering question:", error);

      // Manejo del error tipado como 'unknown'
      if (error instanceof Error) {
        const typedError = error as { response?: { data?: { message?: string } } };

        if (typedError.response && typedError.response.data?.message?.includes("No hay un quiz activo")) {
          setIsQuizFinished(true);
          setCurrentQuestion(null);
          Alert.alert("Quiz Completed", "Quiz has already been finished!");
        } else {
          Alert.alert("Error", "Failed to submit answer");
        }
      } else {
        Alert.alert("Error", "An unknown error occurred.");
      }
    }
  };

  if (!currentQuestion && !isQuizFinished) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (isQuizFinished) {
    return (
      <ScrollView style={styles.container}>
        <ThemedText style={styles.finishedText}>Quiz Finished!</ThemedText>
        <ThemedText style={styles.scoreText}>
          Your Score: {score} / {answeredQuestions.length}
        </ThemedText>
        <ThemedText style={styles.reviewTitle}>Review your answers:</ThemedText>
        {answeredQuestions.map((question, index) => (
          <ThemedView key={index} style={styles.reviewQuestion}>
            <ThemedText style={styles.reviewQuestionText}>
              {question.pregunta}
            </ThemedText>
            <ThemedText style={styles.reviewAnswerText}>
              Your Answer: {question.opciones[question.userAnswer]}
            </ThemedText>
            <ThemedText
              style={[
                styles.reviewAnswerText,
                question.isCorrect ? styles.correctAnswer : styles.incorrectAnswer,
              ]}
            >
              Correct Answer: {question.opciones[question.respuestaCorrecta]}
            </ThemedText>
          </ThemedView>
        ))}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>Back to Quizzes</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    );
  }
  

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.timer}>
        Time left: {timeLeft} seconds
      </ThemedText>
      <ThemedText style={styles.question}>
        {currentQuestion?.pregunta}
      </ThemedText>
      {currentQuestion?.opciones.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.option}
          onPress={() => handleAnswer(index)}
        >
          <ThemedText style={styles.optionText}>{option}</ThemedText>
        </TouchableOpacity>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  timer: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  question: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
    fontWeight: "bold",
  },
  option: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  finishedText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#4CAF50",
  },
  scoreText: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  reviewQuestion: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
  },
  reviewQuestionText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  reviewAnswerText: {
    fontSize: 14,
    marginBottom: 3,
  },
  correctAnswer: {
    color: "#4CAF50",
  },
  incorrectAnswer: {
    color: "#F44336",
  },
  backButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
