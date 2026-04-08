import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { listeningApi, ListeningLessonResponse } from '../api/listeningApi';
import { colors } from '../theme/colors';

type ListeningPartExamsScreenProps = {
  onBack: () => void;
  onNavigateToResult: (lessonId: number) => void;
  partNumber: number;
};

export const ListeningPartExamsScreen: React.FC<ListeningPartExamsScreenProps> = ({ 
  onBack, 
  onNavigateToResult,
  partNumber
}) => {
  const [exams, setExams] = useState<ListeningLessonResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const response = await listeningApi.getListeningLessons(partNumber, 'completed');
      setExams(response.data.content);
    } catch (error) {
      console.error("Failed to load part exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: ListeningLessonResponse }) => (
    <TouchableOpacity 
      style={styles.examCard}
      onPress={() => onNavigateToResult(item.id)}
    >
      <View style={styles.examIcon}>
        <Ionicons name="document-text" size={24} color={colors.primary} />
      </View>
      <View style={styles.examInfo}>
        <Text style={styles.examTitle}>{item.title}</Text>
        <Text style={styles.examScore}>Điểm: {item.score}/{item.totalQuestions}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đề đã giải - Part {partNumber}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={exams}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="file-tray-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>Chưa có đề nào hoàn thành trong Part này.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
  },
  backBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  examCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  examIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  examInfo: {
    flex: 1,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  examScore: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
});
