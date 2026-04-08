import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { grammarApi } from '../api/grammarApi';
import { GrammarLessonDetailResponse } from '../types/grammar';

export const LessonContentViewScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { lessonId } = route.params;
  const [content, setContent] = useState<GrammarLessonDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await grammarApi.getLessonDetail(lessonId);
        setContent(res.data);
      } catch (err: any) {
        setError(err?.message || 'Không thể tải chi tiết bài học.');
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) load();
  }, [lessonId]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#E67E22" />
      </SafeAreaView>
    );
  }

  if (error || !content) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error || 'Không có dữ liệu.'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{content.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
            <Text style={styles.engTitle}>{content.engTitle}</Text>
            <Text style={styles.lessonDescription}>{content.description}</Text>
        </View>

        {content.sections.map((section: any) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            
            {section.type === 'formula' && (
              <View style={styles.formulaBox}>
                <Text style={styles.formulaText}>{section.formula}</Text>
              </View>
            )}

            {section.type === 'usage' && (
              <View style={styles.usageList}>
                {section.items.map((item: any, idx: number) => (
                  <View key={idx} style={styles.usageItem}>
                    <View style={styles.usageHeader}>
                        <View style={styles.usageIconBg}>
                            <MaterialCommunityIcons name={item.icon || "star"} size={20} color="#3B82F6" />
                        </View>
                        <View style={styles.usageTextContainer}>
                            <Text style={styles.usageTitle}>{item.title}</Text>
                            <Text style={styles.usageDesc}>{item.description}</Text>
                        </View>
                    </View>
                    <View style={styles.exampleQuote}>
                        <Text style={styles.exampleText}>{item.example}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {section.examples && (
              <View style={styles.examplesList}>
                {section.examples.map((ex: any, idx: number) => (
                  <View key={idx} style={styles.exampleItem}>
                      <MaterialCommunityIcons name="check-circle" size={18} color="#10B981" />
                      <View style={styles.exampleContent}>
                        <Text style={styles.exampleEngText}>
                            {ex.text.split(' ').map((word: string, i: number) => (
                                <Text key={i} style={word.replace(/[.,]/g, '') === ex.highlight ? styles.highlightText : styles.normalText}>
                                    {word}{' '}
                                </Text>
                            ))}
                        </Text>
                        <Text style={styles.exampleTranslatedText}>{ex.translated}</Text>
                      </View>
                  </View>
                ))}
              </View>
            )}

            {section.type === 'markers' && (
              <View style={styles.markersContainer}>
                {section.groups.map((group: any, idx: number) => (
                  <View key={idx} style={styles.markerGroup}>
                    <Text style={styles.markerGroupTitle}>{group.title}</Text>
                    <View style={styles.markerChips}>
                      {group.items.map((item: string, i: number) => (
                        <View key={i} style={styles.markerChip}>
                          <Text style={styles.markerChipText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity 
          style={styles.practiceBtn}
          onPress={() => content.suggestedPracticeId && navigation.navigate('PracticeDetail', { taskId: content.suggestedPracticeId })}
        >
          <Text style={styles.practiceBtnText}>Luyện tập ngay</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', marginLeft: 10 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  heroSection: { alignItems: 'center', marginVertical: 32 },
  engTitle: { fontSize: 28, fontWeight: 'bold', color: '#0F172A' },
  lessonDescription: { fontSize: 16, color: '#64748B', textAlign: 'center', marginTop: 12, lineHeight: 24, paddingHorizontal: 20 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 20 },
  formulaBox: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  formulaText: { fontSize: 24, fontWeight: 'bold', color: '#E67E22', letterSpacing: 2 },
  examplesList: { marginTop: 16 },
  usageList: { marginTop: 16 },
  exampleItem: { flexDirection: 'row', marginBottom: 20 },
  exampleContent: { marginLeft: 12, flex: 1 },
  exampleEngText: { fontSize: 17, color: '#0F172A', lineHeight: 24 },
  highlightText: { color: '#E67E22', fontWeight: 'bold' },
  normalText: { color: '#0F172A' },
  exampleTranslatedText: { fontSize: 15, color: '#64748B', marginTop: 4 },
  usageItem: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  usageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  usageIconBg: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center' },
  usageTextContainer: { marginLeft: 12, flex: 1 },
  usageTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  usageDesc: { fontSize: 14, color: '#64748B', marginTop: 2 },
  exampleQuote: { backgroundColor: '#F0F9FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: '#3B82F6' },
  exampleText: { fontSize: 14, color: '#0F172A' },
  markersContainer: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 20 },
  markerGroup: { marginBottom: 20 },
  markerGroupTitle: { fontSize: 13, fontWeight: 'bold', color: '#64748B', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' },
  markerChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  markerChip: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  markerChipText: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  practiceBtn: { backgroundColor: '#E67E22', height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 24, elevation: 4, shadowColor: '#E67E22', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  practiceBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#EF4444', fontSize: 14, textAlign: 'center' },
});
