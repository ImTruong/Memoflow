import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/shared/ScreenHeader';
import { apiFetch } from '../api/apiClient';

type Props = {
  onBack: () => void;
  categoryName: string | number;
  onNavigateToSetDetail: (setId: number) => void;
  onNavigateToResult: (practiceId: number) => void;
};

interface CompletedSet {
  id: number;
  title: string;
  completedAt: string;
  wordCount: number;
  isOwner: boolean;
}

export const VocabularyTopicSetsScreen: React.FC<Props> = ({ 
  onBack, 
  categoryName,
  onNavigateToSetDetail,
  onNavigateToResult
}) => {
  const [loading, setLoading] = useState(true);
  const [sets, setSets] = useState<CompletedSet[]>([]);

  const displayTitle = typeof categoryName === 'number' 
    ? (categoryName === -1 ? 'Bộ từ vựng của tôi' : 'Bộ từ vựng cộng đồng')
    : categoryName;

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await apiFetch<any>(`/stats/vocabulary/sets?category=${categoryName}`);
        setSets(response.data);
      } catch (err) {
        console.error('Error fetching topic sets', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSets();
  }, [categoryName]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={displayTitle} onBack={onBack} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Bạn đã hoàn thành <Text style={styles.highlight}>{sets.length}</Text> bộ từ vựng trong mục này.
          </Text>
        </View>

        {sets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={64} color="#E2E8F0" />
            <Text style={styles.emptyText}>Chưa có bộ từ nào hoàn thành.</Text>
          </View>
        ) : (
          sets.map((set) => (
            <TouchableOpacity 
              key={set.id} 
              style={styles.setCard}
              onPress={() => onNavigateToResult(set.id)}
            >
              <View style={styles.setInfo}>
                <Text style={styles.setTitle}>{set.title}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color="#94A3B8" />
                    <Text style={styles.metaText}>
                      {set.completedAt ? new Date(set.completedAt).toLocaleDateString('vi-VN') : 'Vừa xong'}
                    </Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Ionicons name="book-outline" size={14} color="#94A3B8" />
                    <Text style={styles.metaText}>{set.wordCount || 0} từ</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16 },
  infoBox: { 
    backgroundColor: '#EEF2FF', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E7FF'
  },
  infoText: { fontSize: 14, color: '#4338CA', textAlign: 'center' },
  highlight: { fontWeight: 'bold', fontSize: 16 },
  setCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  setInfo: { flex: 1 },
  setTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#94A3B8' },
  metaDivider: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', marginHorizontal: 10 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#94A3B8', marginTop: 16, fontSize: 16 }
});
