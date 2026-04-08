import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { grammarApi } from '../api/grammarApi';
import { GrammarPracticeDetailResponse, GrammarPracticeResultResponse, GrammarPracticeTaskResponse } from '../types/grammar';

const { width } = Dimensions.get('window');

export const PracticeDetailScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { taskId } = route.params;
    const [detail, setDetail] = useState<GrammarPracticeDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [resultLoading, setResultLoading] = useState(false);
    const [resultError, setResultError] = useState<string | null>(null);
    const [practiceResult, setPracticeResult] = useState<GrammarPracticeResultResponse | null>(null);
    const [selectedTask, setSelectedTask] = useState<GrammarPracticeTaskResponse | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await grammarApi.getPracticeDetail(taskId);
            setDetail(res.data);
            setSelectedTask(res.data.tasks.find(task => task.id === taskId) || res.data.tasks[0] || null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (taskId) {
            void load();
        }
    }, [taskId]);

    useEffect(() => {
        const unsubscribe = navigation?.addListener?.('focus', () => {
            if (taskId) {
                void load();
            }
        });
        return unsubscribe;
    }, [navigation, taskId]);

    const activeTask = useMemo(
        () => detail?.tasks.find((task) => task.type === 'ACTIVE') || selectedTask,
        [detail, selectedTask]
    );

    const startTask = selectedTask?.type === 'ACTIVE'
        ? selectedTask
        : detail?.tasks.find((task) => task.type === 'ACTIVE') || activeTask;

    const openCompletedTaskResult = async (practiceTask: GrammarPracticeTaskResponse) => {
        setSelectedTask(practiceTask);
        setResultError(null);
        setPracticeResult(null);
        setResultLoading(true);
        setShowResultModal(true);

        try {
            const res = await grammarApi.getPracticeResult(practiceTask.id);
            setPracticeResult(res.data);
        } catch (error: any) {
            setResultError(error?.message || 'Không thể tải kết quả cũ.');
        } finally {
            setResultLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#E67E22" />
            </SafeAreaView>
        );
    }

    if (!detail || !activeTask) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <Text style={styles.emptyText}>Không tìm thấy bài luyện tập.</Text>
            </SafeAreaView>
        );
    }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
                <Text style={styles.headerTitle}>{detail.lessonTitle}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroSummary}>
            <View style={styles.summaryLeft}>
                <Text style={styles.summaryTitle}>Tiến độ chung</Text>
                                <Text style={styles.summaryPercent}>{detail.overallProgress}%</Text>
                                <Text style={styles.summarySub}>Đã hoàn thành {detail.tasks.filter(task => task.type === 'COMPLETED').length}/{detail.tasks.length} bài tập</Text>
            </View>
            <View style={styles.trophyContainer}>
                <View style={styles.trophyBg}>
                   <MaterialCommunityIcons name="trophy-outline" size={32} color="#FFF" />
                </View>
            </View>
        </View>

                <View style={styles.practiceInfoCard}>
                    <Text style={styles.practiceInfoTitle}>{detail.title}</Text>
                    <Text style={styles.practiceInfoMeta}>{detail.totalQuestions} câu • {detail.difficulty || 'Dễ'} • {detail.durationMinutes || 0} phút</Text>
                </View>

                {detail.tasks.map((t: GrammarPracticeTaskResponse, idx: number) => (
           <TouchableOpacity 
                key={t.id} 
                style={[styles.taskCard, t.type === 'LOCKED' && styles.taskLocked]}
                                onPress={() => {
                                    if (t.type === 'LOCKED') return;
                                    if (t.type === 'COMPLETED') {
                                        void openCompletedTaskResult(t);
                                        return;
                                    }
                                    setSelectedTask(t);
                                    setShowStartModal(true);
                                }}
           >
                <View style={styles.taskIconZone}>
                   {t.type === 'COMPLETED' ? (
                       <View style={styles.statusIconDone}>
                          <MaterialCommunityIcons name="check" size={20} color="#10B981" />
                       </View>
                   ) : (
                       <View style={styles.statusIconPending}>
                          <Text style={styles.statusNumberText}>{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</Text>
                       </View>
                   )}
                </View>
                <View style={styles.taskInfoZone}>
                    <Text style={styles.taskTitle}>{t.title}</Text>
                    <View style={styles.taskMeta}>
                         <Text style={[styles.taskStatusText, t.type === 'COMPLETED' ? styles.textDone : styles.textPending]}>
                            {t.status}
                         </Text>
                         <Text style={styles.metaDivider}>•</Text>
                         <Text style={styles.metaValue}>{t.score || t.count}</Text>
                    </View>
                </View>
                {t.type === 'ACTIVE' ? (
                     <TouchableOpacity
                        style={styles.activeBtn}
                        onPress={() => {
                            setSelectedTask(t);
                            setShowStartModal(true);
                        }}
                     >
                        <Text style={styles.activeBtnText}>Làm ngay</Text>
                    </TouchableOpacity>
                ) : (
                    <MaterialCommunityIcons 
                        name={t.type === 'LOCKED' ? "lock-outline" : "chevron-right"} 
                        size={24} 
                        color={t.type === 'LOCKED' ? "#CBD5E1" : "#94A3B8"} 
                    />
                )}
           </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Start Quiz Modal */}
      <Modal visible={showStartModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setShowStartModal(false)}>
                    <MaterialCommunityIcons name="close" size={24} color="#94A3B8" />
                </TouchableOpacity>

                <View style={styles.modalIconBg}>
                    <MaterialCommunityIcons name="book-edit-outline" size={40} color="#E67E22" />
                </View>

                <Text style={styles.modalTitle}>{startTask?.title || activeTask.title}</Text>
                
                <View style={styles.modalStats}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="format-list-numbered" size={20} color="#94A3B8" />
                        <Text style={styles.statLabel}>Số câu</Text>
                        <Text style={styles.statValue}>{startTask?.totalQuestions || activeTask.totalQuestions} câu</Text>
                    </View>
                    <View style={[styles.statItem, styles.statBorder]}>
                        <MaterialCommunityIcons name="poll" size={20} color="#94A3B8" />
                        <Text style={styles.statLabel}>Mức độ</Text>
                        <Text style={[styles.statValue, { color: '#10B981' }]}>{startTask?.difficulty || activeTask.difficulty || 'Dễ'}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="clock-outline" size={20} color="#94A3B8" />
                        <Text style={styles.statLabel}>Thời gian</Text>
                        <Text style={styles.statValue}>{startTask?.durationMinutes || activeTask.durationMinutes || 0} phút</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.startNowBtn}
                    onPress={() => {
                        setShowStartModal(false);
                        navigation.navigate('QuizSolving', { taskId: startTask?.id || activeTask.id });
                    }}
                >
                    <Text style={styles.btnText}>Bắt đầu ngay</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowStartModal(false)}>
                    <Text style={styles.cancelBtnText}>Hủy</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

            <Modal visible={showResultModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.resultModalContent}>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowResultModal(false)}>
                            <MaterialCommunityIcons name="close" size={24} color="#94A3B8" />
                        </TouchableOpacity>

                        <View style={styles.modalIconBg}>
                            <MaterialCommunityIcons name="check-decagram-outline" size={40} color="#2563EB" />
                        </View>

                        <Text style={styles.modalTitle}>Kết quả bài cũ</Text>

                        {resultLoading ? (
                            <View style={styles.resultLoadingBox}>
                                <ActivityIndicator size="large" color="#2563EB" />
                            </View>
                        ) : resultError ? (
                            <Text style={styles.resultErrorText}>{resultError}</Text>
                        ) : practiceResult ? (
                            <>
                                <View style={styles.resultOverviewBox}>
                                    <View style={styles.resultCircle}>
                                        <Text style={styles.resultScoreText}>{practiceResult.score}</Text>
                                        <Text style={styles.resultTotalText}>/{practiceResult.totalQuestions}</Text>
                                    </View>

                                    <Text style={styles.resultOverviewTitle}>{practiceResult.title}</Text>
                                    <Text style={styles.resultOverviewSub}>
                                        Bạn đã làm đúng {practiceResult.score}/{practiceResult.totalQuestions} câu
                                    </Text>
                                </View>
                            </>
                        ) : null}

                        {(practiceResult || resultError) && (
                            <>
                                {practiceResult && (
                                    <View style={styles.resultStatsRow}>
                                        <View style={styles.resultStatItem}>
                                            <Text style={styles.resultStatLabel}>Đúng</Text>
                                            <Text style={styles.resultStatValue}>{practiceResult.score}</Text>
                                        </View>
                                        <View style={styles.resultStatDivider} />
                                        <View style={styles.resultStatItem}>
                                            <Text style={styles.resultStatLabel}>Sai</Text>
                                            <Text style={styles.resultStatValue}>{Math.max(practiceResult.totalQuestions - practiceResult.score, 0)}</Text>
                                        </View>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={[styles.retakeBtn, { backgroundColor: '#10B981', marginBottom: 12 }]}
                                    onPress={() => {
                                        setShowResultModal(false);
                                        navigation.navigate('QuizResult', { practiceId: selectedTask?.id || taskId });
                                    }}
                                >
                                    <Text style={styles.retakeBtnText}>Xem chi tiết</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.retakeBtn}
                                    onPress={() => {
                                        setShowResultModal(false);
                                        navigation.navigate('QuizSolving', { taskId: selectedTask?.id || taskId });
                                    }}
                                >
                                    <Text style={styles.retakeBtnText}>Làm lại</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowResultModal(false)}>
                            <Text style={styles.cancelBtnText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', marginLeft: 10 },
  content: { padding: 20 },
  heroSummary: { backgroundColor: '#E67E22', borderRadius: 24, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  summaryLeft: { flex: 1 },
  summaryTitle: { fontSize: 14, color: '#FFD8A8', fontWeight: '600' },
  summaryPercent: { fontSize: 36, fontWeight: 'bold', color: '#FFF', marginVertical: 4 },
  summarySub: { fontSize: 13, color: '#FFF', opacity: 0.9 },
  trophyContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  trophyBg: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  taskCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  taskLocked: { opacity: 0.7, backgroundColor: '#FAFAFA' },
  taskIconZone: { marginRight: 16 },
  statusIconDone: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center' },
  statusIconPending: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  statusNumberText: { fontSize: 14, fontWeight: 'bold', color: '#64748B' },
  taskInfoZone: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  taskMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  taskStatusText: { fontSize: 13, fontWeight: '600' },
  textDone: { color: '#10B981' },
  textPending: { color: '#F97316' },
  metaDivider: { marginHorizontal: 6, color: '#CBD5E1' },
  metaValue: { fontSize: 13, color: '#64748B' },
  activeBtn: { backgroundColor: '#E67E22', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  activeBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', width: width * 0.85, borderRadius: 30, padding: 30, alignItems: 'center' },
    resultModalContent: { backgroundColor: '#FFF', width: width * 0.88, borderRadius: 30, padding: 30, alignItems: 'center' },
  closeBtn: { position: 'absolute', top: 20, right: 20 },
  modalIconBg: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', marginBottom: 24, textAlign: 'center' },
  modalStats: { width: '100%', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, marginBottom: 30 },
  statItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  statBorder: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  statLabel: { flex: 1, marginLeft: 12, fontSize: 14, color: '#64748B' },
  statValue: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  startNowBtn: { backgroundColor: '#E67E22', width: '100%', height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#E67E22', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  cancelBtn: { marginTop: 16 },
    cancelBtnText: { color: '#64748B', fontSize: 16, fontWeight: '600' },
        resultLoadingBox: { width: '100%', minHeight: 180, justifyContent: 'center', alignItems: 'center' },
        resultErrorText: { color: '#DC2626', fontSize: 14, textAlign: 'center', marginBottom: 12 },
        resultOverviewBox: { width: '100%', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 20, paddingVertical: 18, paddingHorizontal: 16, marginBottom: 18 },
        resultCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#FFF', borderWidth: 4, borderColor: '#2563EB', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
        resultScoreText: { fontSize: 34, fontWeight: 'bold', color: '#1D4ED8' },
        resultTotalText: { fontSize: 16, fontWeight: '600', color: '#64748B' },
        resultOverviewTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
        resultOverviewSub: { marginTop: 6, fontSize: 14, color: '#64748B', textAlign: 'center' },
        resultStatsRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 18, marginBottom: 18 },
        resultStatItem: { flex: 1, alignItems: 'center' },
        resultStatLabel: { fontSize: 13, color: '#64748B' },
        resultStatValue: { marginTop: 4, fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
        resultStatDivider: { width: 1, height: 34, backgroundColor: '#E2E8F0' },
        retakeBtn: { backgroundColor: '#2563EB', width: '100%', height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
        retakeBtnText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
    practiceInfoCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    practiceInfoTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
    practiceInfoMeta: { marginTop: 4, fontSize: 13, color: '#64748B' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#64748B', fontSize: 14 },
});
