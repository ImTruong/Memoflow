import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { grammarApi } from '../api/grammarApi';
import { GrammarPracticeOverviewResponse, GrammarPracticeTaskResponse } from '../types/grammar';
import { colors } from '../theme/colors';

type GrammarTopicExamsScreenProps = {
  onBack: () => void;
  onNavigateToResult: (practiceId: number) => void;
  topicId: number;
};

export const GrammarTopicExamsScreen: React.FC<GrammarTopicExamsScreenProps> = ({ 
  onBack, 
  onNavigateToResult,
  topicId
}) => {
  const [topicExams, setTopicExams] = useState<GrammarPracticeTaskResponse[]>([]);
  const [topicTitle, setTopicTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopicExams();
  }, []);

  const loadTopicExams = async () => {
    try {
      setLoading(true);
      const response = await grammarApi.getPracticeOverview();
      const topicData = response.data?.find(t => t.id === topicId);
      if (topicData) {
        setTopicTitle(topicData.title);
        // Only show completed ones for this "History" view
        setTopicExams(topicData.tasks.filter(task => task.type === 'COMPLETED'));
      }
    } catch (error) {
      console.error("Failed to load topic exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: GrammarPracticeTaskResponse }) => (
    <TouchableOpacity 
      style={styles.examCard}
      onPress={() => onNavigateToResult(item.id)}
    >
      <View style={styles.examIcon}>
        <MaterialCommunityIcons name="pencil-box-outline" size={24} color="#F59E0B" />
      </View>
      <View style={styles.examInfo}>
        <Text style={styles.examTitle}>{item.title}</Text>
        <Text style={styles.examScore}>Kết quả: {item.score}</Text>
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
        <Text style={styles.headerTitle} numberOfLines={1}>{topicTitle || 'Bài đã luyện tập'}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      ) : (
        <FlatList
          data={topicExams}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>Bạn chưa hoàn thành bài luyện tập nào trong chủ điểm này.</Text>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
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
    backgroundColor: '#FFF7ED',
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
