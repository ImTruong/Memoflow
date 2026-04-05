import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { grammarApi } from '../api/grammarApi';
import { GrammarPracticeOverviewResponse, GrammarTopicResponse } from '../types/grammar';

export const GrammarScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'theory' | 'practice'>('theory');
  const [topics, setTopics] = useState<GrammarTopicResponse[]>([]);
  const [practices, setPractices] = useState<GrammarPracticeOverviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [topicRes, practiceRes] = await Promise.all([
          grammarApi.getTopics(),
          grammarApi.getPracticeOverview(),
        ]);
        setTopics(topicRes.data || []);
        setPractices(practiceRes.data || []);
      } catch (err: any) {
        setError(err?.message || 'Không thể tải dữ liệu ngữ pháp.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const renderTheoryItem = ({ item }: { item: GrammarTopicResponse }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('GrammarTopicDetail', { topicId: item.id })}
    >
      <View style={[styles.iconContainer, { backgroundColor: '#FFF5E6' }]}>
        <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#F59E0B" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubTitle}>{item.description}</Text>
        <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${item.progressPercent}%`, backgroundColor: '#F59E0B' }]} />
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
    </TouchableOpacity>
  );

  const renderPracticeItem = ({ item }: { item: GrammarPracticeOverviewResponse }) => (
    <View style={styles.practiceCard}>
        <View style={styles.practiceHeader}>
          <View>
            <Text style={styles.practiceTitle}>{item.title}</Text>
            <Text style={styles.practiceSubTitle}>{item.description}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.overallProgress}%</Text>
          </View>
        </View>

        {item.tasks.map((task: any, index: number) => (
            <TouchableOpacity 
              key={task.id} 
              style={[styles.taskItem, index < item.tasks.length - 1 && styles.borderBottom]}
                onPress={() => task.type !== 'LOCKED' && navigation.navigate('PracticeDetail', { taskId: task.id })}
            >
                <View style={styles.taskLeft}>
                    {task.type === 'COMPLETED' ? (
                        <View style={styles.checkIcon}>
                            <MaterialCommunityIcons name="check" size={16} color="#10B981" />
                        </View>
                    ) : (
                        <View style={styles.numberCircle}>
                            <Text style={styles.numberText}>{index + 1 < 10 ? `0${index + 1}` : index + 1}</Text>
                        </View>
                    )}
                    <View style={styles.taskInfo}>
                        <Text style={styles.taskTitle}>{task.title}</Text>
                        <View style={styles.taskMeta}>
                            <Text style={[styles.statusTag, task.type === 'COMPLETED' ? styles.statusDone : styles.statusPending]}>
                                {task.status}
                            </Text>
                            <Text style={styles.metaDivider}>•</Text>
                        <Text style={styles.metaText}>{task.score || task.count}</Text>
                        </View>
                    </View>
                </View>
                {task.type === 'ACTIVE' && (
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('PracticeDetail', { taskId: task.id })}
                    >
                        <Text style={styles.actionButtonText}>Làm ngay</Text>
                    </TouchableOpacity>
                )}
                {task.type === 'COMPLETED' && (
                     <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
                )}
            </TouchableOpacity>
        ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
            <Text style={styles.title}>Ngữ pháp</Text>
            <Text style={styles.subTitle}>Làm chủ cấu trúc câu</Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
            <MaterialCommunityIcons name="magnify" size={24} color="#F59E0B" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'theory' && styles.activeTab]} 
          onPress={() => setActiveTab('theory')}
        >
          <Text style={[styles.tabText, activeTab === 'theory' && styles.activeTabText]}>Lý thuyết</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'practice' && styles.activeTab]} 
          onPress={() => setActiveTab('practice')}
        >
          <Text style={[styles.tabText, activeTab === 'practice' && styles.activeTabText]}>Ôn tập</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      ) : error ? (
        <View style={styles.centerLoader}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : activeTab === 'theory' ? (
        <FlatList
          data={topics}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTheoryItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={() => (
            <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="book-open-variant" size={20} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Chủ điểm lý thuyết</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>Lộ trình học</Text>
                </View>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={practices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPracticeItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#000' },
  subTitle: { fontSize: 16, color: '#64748B', marginTop: 4 },
  searchButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#E2E8F0', marginHorizontal: 20, borderRadius: 12, padding: 4, marginTop: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#FFF' },
  tabText: { fontSize: 16, fontWeight: '600', color: '#64748B' },
  activeTabText: { color: '#0F172A' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginLeft: 8, flex: 1 },
  badge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, color: '#D97706', fontWeight: '600' },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  iconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardContent: { flex: 1, marginLeft: 16, marginRight: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  cardSubTitle: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  progressBarContainer: { height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  progressBar: { height: '100%' },
  practiceCard: { backgroundColor: '#FFF', borderRadius: 16, marginTop: 24, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  practiceHeader: { padding: 16, paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  practiceTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  practiceSubTitle: { fontSize: 13, color: '#94A3B8', marginTop: 2, maxWidth: '85%' },
  taskItem: { flexDirection: 'row', alignItems: 'center', padding: 16, justifyContent: 'space-between' },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  taskLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center' },
  numberCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  numberText: { fontSize: 14, fontWeight: 'bold', color: '#64748B' },
  taskInfo: { marginLeft: 12 },
  taskTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  taskMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusTag: { fontSize: 12, fontWeight: '600' },
  statusDone: { color: '#10B981' },
  statusPending: { color: '#F97316' },
  metaDivider: { marginHorizontal: 6, color: '#CBD5E1' },
  metaText: { fontSize: 12, color: '#64748B' },
  actionButton: { backgroundColor: '#E67E22', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  actionButtonText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  centerLoader: { paddingVertical: 48, alignItems: 'center' },
  errorText: { color: '#EF4444', fontSize: 14, textAlign: 'center' },
});
