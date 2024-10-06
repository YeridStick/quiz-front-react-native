import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { fetchQuizzes } from '@/app/services/quiz-services';
import { Quiz } from '@/app/types/quiz';
import { Ionicons } from '@expo/vector-icons';

export default function ExploreScreen() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const fetchedQuizzes = await fetchQuizzes();
      setQuizzes(fetchedQuizzes);
    } catch (error) {
      console.error("Error loading quizzes:", error);
    }
  };

  const renderQuizCard = ({ item }: { item: Quiz }) => (
    <TouchableOpacity onPress={() => router.push(`/explore/${item.id}`)}>
      <ThemedView style={styles.quizCard}>
        <ThemedText type="subtitle" style={styles.quizTitle} numberOfLines={2}>
          {item.titulo}
        </ThemedText>
        <ThemedText style={styles.quizDescription} numberOfLines={3}>
          {item.descripcion}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="code-slash" style={styles.headerImage} />}
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title">Explore Quizzes</ThemedText>
        <FlatList
          data={quizzes}
          renderItem={renderQuizCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.quizList}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  quizList: {
    paddingTop: 20,
  },
  quizCard: {
    backgroundColor: 'rgb(29, 61, 71)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  quizTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quizDescription: {
    color: 'white',
    fontSize: 14,
  },
});