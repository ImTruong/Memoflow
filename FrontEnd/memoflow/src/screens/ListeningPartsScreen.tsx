import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/shared/ScreenHeader';

type ListeningPartsScreenProps = {
  onBack: () => void;
  onNavigateToListeningLessons: (part: number) => void;
};

export const ListeningPartsScreen: React.FC<ListeningPartsScreenProps> = ({
  onBack,
  onNavigateToListeningLessons,
}) => {
  const topics = [
    {
      id: 'p1',
      title: 'Part 1: Mô tả hình ảnh',
      subtitle: 'Photographs',
      iconColor: '#818CF8',
      iconName: 'image-outline',
    },
    {
      id: 'p2',
      title: 'Part 2: Hỏi & Đáp',
      subtitle: 'Question & Response',
      iconColor: '#34D399',
      iconName: 'chatbubble-outline',
    },
    {
      id: 'p3',
      title: 'Part 3: Đoạn hội thoại',
      subtitle: 'Short Conversations',
      iconColor: '#FBBF24',
      iconName: 'chatbubbles-outline',
    },
    {
      id: 'p4',
      title: 'Part 4: Bài nói ngắn',
      subtitle: 'Short Talk',
      iconColor: '#F472B6',
      iconName: 'mic-outline',
    },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Luyện nghe"
        onBack={onBack}
        titleStyle={styles.headerTitle}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chọn phần thi</Text>
          <Text style={styles.sectionSubtitle}>Luyện tập kỹ năng nghe theo từng phần</Text>
        </View>

        {topics.map((topic, index) => (
          <TouchableOpacity
            key={topic.id}
            style={styles.topicCard}
            onPress={() => onNavigateToListeningLessons(index + 1)}
            activeOpacity={0.7}
          >
            <View style={styles.topicTop}>
              <View style={[styles.iconWrapper, { backgroundColor: topic.iconColor + '15' }]}>
                <Ionicons name={topic.iconName as any} size={28} color={topic.iconColor} />
              </View>

              <View style={styles.topicInfo}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicSubtitle}>{topic.subtitle}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F2937'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40
  },
  sectionHeader: {
    marginBottom: 24,
    paddingLeft: 4
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B'
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500'
  },
  topicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  topicTop: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  topicInfo: {
    flex: 1
  },
  topicTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B'
  },
  topicSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4
  }
});