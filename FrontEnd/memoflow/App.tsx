import React, { useEffect, useState } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { NotificationScreen } from './src/screens/NotificationScreen';
import { VocabularyLearningScreen } from './src/screens/VocabularyLearningScreen';
import { FlashcardSetScreen } from './src/screens/FlashcardSetScreen';
import { CreateFlashcardSetScreen } from './src/screens/CreateFlashcardSetScreen';
import { AddWordScreen, type WordFormData } from './src/screens/AddWordScreen';
import { FlashcardStudyScreen } from './src/screens/FlashcardStudyScreen';
import { FillBlankGameScreen } from './src/screens/FillBlankGameScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { VocabularyStatsScreen } from './src/screens/VocabularyStatsScreen';
import { VocabularyDailyStatsScreen } from './src/screens/VocabularyDailyStatsScreen';
import { WordDetailStatsScreen } from './src/screens/WordDetailStatsScreen';
import { ListeningStatsOverviewScreen } from './src/screens/ListeningStatsOverviewScreen';
import { ListeningExamDetailScreen } from './src/screens/ListeningExamDetailScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { EditProfileScreen } from './src/screens/EditProfileScreen';
import { NotificationSettingsScreen } from './src/screens/NotificationSettingsScreen';
import { ChangePasswordScreen } from './src/screens/ChangePasswordScreen';
import { Footer } from './src/components/Footer';
import { ScreenTransition } from './src/components/ScreenTransition';
import { StoryListScreen } from './src/screens/StoryListScreen';
import { StoryDetailScreen } from './src/screens/StoryDetailScreen';
import { WordRaceListScreen } from './src/screens/WordRaceListScreen';
import { WordRaceGameScreen } from './src/screens/WordRaceGameScreen';
import { UserLessonProgress } from './src/types/story';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ListeningPartsScreen } from './src/screens/ListeningPartsScreen';
import { ListeningLessonsScreen } from './src/screens/ListeningLessonsScreen';
import { ListeningLessonDetailScreen } from './src/screens/ListeningLessonDetailScreen';
import { ListeningLessonResultScreen } from './src/screens/ListeningLessonResultScreen';
import { BilingualScreen } from './src/screens/BilingualScreen';
import { BilingualDetailScreen } from './src/screens/BilingualDetailScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockWordRaceProgress } from './src/api/mockWordRaceData';
import { WordHuntListScreen } from './src/screens/WordHuntListScreen';
import { WordHuntGameScreen } from './src/screens/WordHuntGameScreen';
import { mockWordHuntProgress } from './src/api/mockWordHuntData';
import { WordHuntProgress } from './src/types/wordHunt';
import { AiAssistantScreen } from './src/screens/AiAssistantScreen';
import { storyApi } from './src/api/storyApi';

type Screen =
  | 'Register'
  | 'Login'
  | 'Home'
  | 'Notifications'
  | 'VocabularyLearning'
  | 'FlashcardSet'
  | 'CreateFlashcardSet'
  | 'AddWord'
  | 'FlashcardStudy'
  | 'FillBlankGame'
  | 'Stats'
  | 'VocabularyStats'
  | 'VocabularyDailyStats'
  | 'WordDetailStats'
  | 'ListeningStats'
  | 'ListeningExamDetail'
  | 'ListeningParts'
  | 'ListeningLessons'
  | 'ListeningLessonDetail'
  | 'ListeningLessonResult'
  | 'Profile'
  | 'EditProfile'
  | 'NotificationSettings'
  | 'ChangePassword'
  | 'StoryList'
  | 'StoryDetail'
  | 'WordRaceList'
  | 'WordRaceGame'
  | 'WordHuntList'
  | 'WordHuntGame'
  | 'Bilingual'
  | 'BilingualDetail'
  | 'AiChat';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Login');
  const [editMode, setEditMode] = useState(false);
  const [wordEditMode, setWordEditMode] = useState(false);
  const [initialWord, setInitialWord] = useState('');
  const [wordInitialData, setWordInitialData] = useState<WordFormData | undefined>(undefined);
  const [activeSetName, setActiveSetName] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [onlyDue, setOnlyDue] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedWord, setSelectedWord] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [isGlobalStudy, setIsGlobalStudy] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedStoryProgress, setSelectedStoryProgress] = useState<UserLessonProgress | null>(null);
  const [storiesProgress, setStoriesProgress] = useState<UserLessonProgress[]>([]);
  const [isStoryLoading, setIsStoryLoading] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);
  const [selectedWordRaceProgress, setSelectedWordRaceProgress] = useState<UserLessonProgress | null>(null);
  const [wordRaceProgressList, setWordRaceProgressList] = useState<UserLessonProgress[]>(mockWordRaceProgress);
  const [selectedWordHuntProgress, setSelectedWordHuntProgress] = useState<WordHuntProgress | null>(null);
  const [wordHuntProgressList, setWordHuntProgressList] = useState<WordHuntProgress[]>(mockWordHuntProgress);
  const [selectedListeningPart, setSelectedListeningPart] = useState<number | null>(null);
  const [isResumeListening, setResumeListening] = useState<boolean>(true);
  const [prevScreen, setPrevScreen] = useState<Screen>('Home');

  useEffect(() => {
  const initAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setCurrentScreen('Login');
      } else {
        setCurrentScreen('Home');
      }
    } catch (error) {
      setCurrentScreen('Login');
    }
  };
  initAuth();
}, []);

  const loadStoryLessons = async () => {
    try {
      setIsStoryLoading(true);
      setStoryError(null);
      const response = await storyApi.getStoryLessons(0, 50);
      setStoriesProgress(response.data.content);
    } catch (error) {
      console.error('Failed to load story lessons', error);
      setStoryError('Khong the tai danh sach truyen.');
    } finally {
      setIsStoryLoading(false);
    }
  };

  const refreshStoryDetail = async (lessonId: number) => {
    try {
      const response = await storyApi.getStoryLessonDetail(lessonId);
      const detail = response.data;

      setSelectedStoryProgress(prev =>
        prev && prev.learningLesson.id === lessonId ? detail : prev
      );

      setStoriesProgress(prev => prev.map(item =>
        item.learningLesson.id === lessonId ? detail : item
      ));
    } catch (error) {
      console.error('Failed to load story lesson detail', error);
    }
  };

  useEffect(() => {
    if (currentScreen === 'StoryList') {
      void loadStoryLessons();
    }
  }, [currentScreen]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Login':
        return (
          <LoginScreen
            onNavigateToHome={() => setCurrentScreen('Home')}
            onNavigateToRegister={() => setCurrentScreen('Register')}
          />
        );
      case 'Register':
        return (
          <RegisterScreen
            onNavigateToLogin={() => setCurrentScreen('Login')}
            onNavigateToHome={() => setCurrentScreen('Home')}
          />
        );

      case 'ListeningParts':
        return (
          <ListeningPartsScreen
            onBack={() => setCurrentScreen('Home')}
            onNavigateToListeningLessons={(part) => {
              setSelectedListeningPart(part);
              setCurrentScreen('ListeningLessons');
            }}
          />
        );
      case 'ListeningLessons':
        return (
          <ListeningLessonsScreen
            onBack={() => setCurrentScreen('ListeningParts')}
            onNavigateToListeningLessonDetail={(lessonId, isResumeListening) => {
              setSelectedLessonId(lessonId);
              setCurrentScreen('ListeningLessonDetail');
              setResumeListening(isResumeListening)
            }}
            onNavigateToListeningLessonResult={(lessonId) => {
              setSelectedLessonId(lessonId);
              setCurrentScreen('ListeningLessonResult');
            }}
            listeningPart={selectedListeningPart || 1}
          />
        );
      case 'ListeningLessonDetail':
        return (
          <ListeningLessonDetailScreen
            onBack={() => setCurrentScreen('ListeningLessons')}
            onNavigateToListeningLessonResult={() => setCurrentScreen('ListeningLessonResult')}
            listeningLessonId={selectedLessonId || 0}
            isResumeListening={isResumeListening}
          />
        );
      case 'ListeningLessonResult':
        return (
          <ListeningLessonResultScreen
            onBack={() => setCurrentScreen('ListeningLessons')}
            listeningLessonId={selectedLessonId || 0}
          />
        );
      case 'Bilingual':
        return (
          <BilingualScreen
            onBack={() => setCurrentScreen(prevScreen)}
            onNavigateToBilingualDetailScreen={(lessonId) => {
              setSelectedLessonId(lessonId);
              setCurrentScreen('BilingualDetail')
            }}
          />
        );
      case 'BilingualDetail':
        return (
          <BilingualDetailScreen
            onBack={() => setCurrentScreen('Bilingual')}
            lessonId={selectedLessonId || 0}
          />
        );
      case 'Home':
        return (
          <HomeScreen 
            onNavigateToNotifications={() => setCurrentScreen('Notifications')}
            onNavigateToLearning={() => setCurrentScreen('VocabularyLearning')}
            onNavigateToGlobalStudy={() => {
              setActiveSetName('Ôn tập tổng quan');
              setSelectedLessonId(null);
              setOnlyDue(true);
              setIsGlobalStudy(true);
              setCurrentScreen('FlashcardStudy');
            }}
            onNavigateToStoryList={() => setCurrentScreen('StoryList')}
            onNavigateToWordRaceList={() => setCurrentScreen('WordRaceList')}
            onNavigateToListeningParts={() => setCurrentScreen('ListeningParts')}
            onNavigateToBilingual={() => {
              setPrevScreen('Home')
              setCurrentScreen('Bilingual')
            }}
            onNavigateToAiChat={() => setCurrentScreen('AiChat')}
          />
        );
      case 'AiChat':
        return (
          <AiAssistantScreen
            onBack={() => setCurrentScreen('Home')}
          />
        );
      case 'VocabularyLearning':
        return (
          <VocabularyLearningScreen 
            onNavigateToNotifications={() => setCurrentScreen('Notifications')} 
            onNavigateToFlashcards={() => setCurrentScreen('FlashcardSet')}
            onNavigateToGlobalStudy={() => {
              setActiveSetName('Ôn tập tổng quan');
              setSelectedLessonId(null);
              setOnlyDue(true);
              setIsGlobalStudy(true);
              setCurrentScreen('FlashcardStudy');
            }}
            onNavigateToStoryList={() => setCurrentScreen('StoryList')}
            onNavigateToWordRaceList={() => setCurrentScreen('WordRaceList')}
            onNavigateToWordHuntList={() => setCurrentScreen('WordHuntList')}
            onNavigateToBilingual={() => {
              setPrevScreen('VocabularyLearning');
              setCurrentScreen('Bilingual');
            }}
          />
        );
      case 'FlashcardSet':
        return (
          <FlashcardSetScreen 
            onBack={() => setCurrentScreen('VocabularyLearning')} 
            onNavigateToCreate={() => {
              setEditMode(false);
              setSelectedLessonId(null);
              setCurrentScreen('CreateFlashcardSet');
            }}
            onNavigateToEdit={(id) => {
              setEditMode(true);
              setSelectedLessonId(id);
              setCurrentScreen('CreateFlashcardSet');
            }}
            onNavigateToStudy={(setName, id, dueOnly, isGlobal = false) => {
              setActiveSetName(setName);
              setSelectedLessonId(id);
              setOnlyDue(dueOnly);
              setIsGlobalStudy(isGlobal);
              setCurrentScreen('FlashcardStudy');
            }}
            onNavigateToGame={(setName, id) => {
              setActiveSetName(setName);
              setSelectedLessonId(id);
              setCurrentScreen('FillBlankGame');
            }}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'CreateFlashcardSet':
        return (
          <CreateFlashcardSetScreen 
            onBack={() => {
              setSelectedLessonId(null);
              setCurrentScreen('FlashcardSet');
            }}
            lessonId={selectedLessonId || undefined}
            editMode={editMode}
            onSetCreated={(id) => setSelectedLessonId(id)}
            refreshTrigger={refreshTrigger}
            onAddWord={(word) => {
              setWordEditMode(false);
              setInitialWord(word || '');
              setWordInitialData(undefined);
              setCurrentScreen('AddWord');
            }}
            onEditWord={(data) => {
              setWordEditMode(true);
              setInitialWord('');
              setWordInitialData(data);
              setCurrentScreen('AddWord');
            }}
          />
        );
      case 'AddWord':
        return (
          <AddWordScreen 
            onBack={() => {
              setRefreshTrigger(prev => prev + 1);
              setCurrentScreen('CreateFlashcardSet');
            }}
            lessonId={selectedLessonId || 0}
            editMode={wordEditMode}
            initialWord={initialWord}
            initialData={wordInitialData}
          />
        );
      case 'FlashcardStudy':
        return (
          <FlashcardStudyScreen 
            onBack={() => {
              setRefreshTrigger(prev => prev + 1);
              setCurrentScreen('FlashcardSet');
            }} 
            setName={activeSetName || 'Bộ từ vựng'}
            lessonId={selectedLessonId || 0}
            onlyDue={onlyDue}
            isGlobal={isGlobalStudy}
          />
        );
      case 'FillBlankGame':
        return (
          <FillBlankGameScreen 
            onBack={() => {
              setRefreshTrigger(prev => prev + 1);
              setCurrentScreen('FlashcardSet');
            }}
            setName={activeSetName || 'Bộ từ vựng'}
            lessonId={selectedLessonId || 0}
          />
        );
      case 'Stats':
        return (
          <StatsScreen 
            onNavigateToNotifications={() => setCurrentScreen('Notifications')}
            onNavigateToVocabularyStats={() => setCurrentScreen('VocabularyStats')}
            onNavigateToListeningStats={() => setCurrentScreen('ListeningStats')}
          />
        );
      case 'VocabularyStats':
        return (
          <VocabularyStatsScreen 
            onBack={() => setCurrentScreen('Stats')}
            onNavigateToDailyStats={(date) => {
              setSelectedDate(date);
              setCurrentScreen('VocabularyDailyStats');
            }}
            onNavigateToWordStats={(word) => {
              setSelectedWord(word);
              setCurrentScreen('WordDetailStats');
            }}
          />
        );
      case 'VocabularyDailyStats':
        return (
          <VocabularyDailyStatsScreen 
            onBack={() => setCurrentScreen('VocabularyStats')}
            date={selectedDate}
          />
        );
      case 'WordDetailStats':
        return (
          <WordDetailStatsScreen 
            onBack={() => setCurrentScreen('VocabularyStats')}
            word={selectedWord}
          />
        );
      case 'ListeningStats':
        return (
          <ListeningStatsOverviewScreen 
            onBack={() => setCurrentScreen('Stats')}
            onNavigateToExamDetail={(examId) => {
              setSelectedExam(examId);
              setCurrentScreen('ListeningExamDetail');
            }}
          />
        );
      case 'ListeningExamDetail':
        return (
          <ListeningExamDetailScreen 
            onBack={() => setCurrentScreen('ListeningStats')}
            examId={selectedExam}
          />
        );
      case 'Notifications':
        return <NotificationScreen onBack={() => setCurrentScreen('Home')} />;
      case 'Profile':
        return (
          <ProfileScreen 
            onNavigateToNotifications={() => setCurrentScreen('Notifications')} 
            onNavigateToEditProfile={() => setCurrentScreen('EditProfile')}
            onNavigateToNotificationSettings={() => setCurrentScreen('NotificationSettings')}
            onNavigateToChangePassword={() => setCurrentScreen('ChangePassword')}
            onNavigateToLogin={() => setCurrentScreen('Login')}
          />
        );
      case 'EditProfile':
        return <EditProfileScreen onBack={() => setCurrentScreen('Profile')} />;
      case 'NotificationSettings':
        return <NotificationSettingsScreen onBack={() => setCurrentScreen('Profile')} />;
      case 'ChangePassword':
        return <ChangePasswordScreen onBack={() => setCurrentScreen('Profile')} />;
      case 'StoryList':
        return (
          <StoryListScreen
            stories={storiesProgress}
            isLoading={isStoryLoading}
            error={storyError}
            onRefresh={loadStoryLessons}
            onBack={() => setCurrentScreen('Home')}
            onNavigateToStory={(progress) => {
              setSelectedStoryProgress(progress);
              setCurrentScreen('StoryDetail');
              void refreshStoryDetail(progress.learningLesson.id);
            }}
          />
        );
      case 'StoryDetail':
        return selectedStoryProgress ? (
          <StoryDetailScreen
            progress={selectedStoryProgress}
            onBack={() => {
              setSelectedStoryProgress(null);
              setCurrentScreen('StoryList');
            }}
            onComplete={async () => {
              try {
                await storyApi.completeStoryLesson(selectedStoryProgress.learningLesson.id);
              } catch (error) {
                console.error('Failed to complete story lesson', error);
              }

              setStoriesProgress(prev => prev.map(s =>
                s.learningLesson.id === selectedStoryProgress.learningLesson.id
                  ? { ...s, isCompleted: true, progressPercent: 100 }
                  : s
              ));
              setSelectedStoryProgress(prev => prev
                ? { ...prev, isCompleted: true, progressPercent: 100 }
                : null
              );
            }}
          />
        ) : null;
      case 'WordRaceList':
        return (
          <WordRaceListScreen
            onBack={() => setCurrentScreen('VocabularyLearning')}
            onNavigateToGame={(progress) => {
              setSelectedWordRaceProgress(progress);
              setCurrentScreen('WordRaceGame');
            }}
          />
        );
      case 'WordRaceGame':
        return selectedWordRaceProgress ? (
          <WordRaceGameScreen
            progress={selectedWordRaceProgress}
            onBack={() => {
              setSelectedWordRaceProgress(null);
              setCurrentScreen('WordRaceList');
            }}
            onComplete={(score) => {
              setWordRaceProgressList(prev => prev.map(p =>
                p.id === selectedWordRaceProgress.id ? { ...p, isCompleted: true, score } : p
              ));
              setSelectedWordRaceProgress(prev => prev ? { ...prev, isCompleted: true, score } : null);
            }}
          />
        ) : null;
      case 'WordHuntList':
        return (
          <WordHuntListScreen
            progresses={wordHuntProgressList}
            onBack={() => setCurrentScreen('VocabularyLearning')}
            onNavigateToGame={(progress) => {
              setSelectedWordHuntProgress(progress);
              setCurrentScreen('WordHuntGame');
            }}
          />
        );
      case 'WordHuntGame':
        return selectedWordHuntProgress ? (
          <WordHuntGameScreen
            progress={selectedWordHuntProgress}
            onBack={() => {
              setSelectedWordHuntProgress(null);
              setCurrentScreen('WordHuntList');
            }}
            onFinish={(payload) => {
              setWordHuntProgressList(prev => prev.map(item => {
                if (item.id !== payload.progressId) return item;

                const wasCompleted = item.isCompleted;
                const nextCompleted = wasCompleted || payload.isCompleted;
                const nextProgressPercent = nextCompleted
                  ? 100
                  : Math.max(item.progressPercent, payload.progressPercent);

                return {
                  ...item,
                  isCompleted: nextCompleted,
                  progressPercent: nextProgressPercent,
                  score: payload.score,
                  completedAt: nextCompleted ? (item.completedAt || payload.completedAt) : item.completedAt,
                  hintsUsedToday: payload.hintsUsedToday,
                };
              }));

              setSelectedWordHuntProgress(prev => {
                if (!prev || prev.id !== payload.progressId) return prev;

                const wasCompleted = prev.isCompleted;
                const nextCompleted = wasCompleted || payload.isCompleted;
                const nextProgressPercent = nextCompleted
                  ? 100
                  : Math.max(prev.progressPercent, payload.progressPercent);

                return {
                  ...prev,
                  isCompleted: nextCompleted,
                  progressPercent: nextProgressPercent,
                  score: payload.score,
                  completedAt: nextCompleted ? (prev.completedAt || payload.completedAt) : prev.completedAt,
                  hintsUsedToday: payload.hintsUsedToday,
                };
              });
            }}
          />
        ) : null;
      default:
        return (
          <HomeScreen 
            onNavigateToNotifications={() => setCurrentScreen('Notifications')}
            onNavigateToLearning={() => setCurrentScreen('VocabularyLearning')}
            onNavigateToGlobalStudy={() => {
              setActiveSetName('Ôn tập tổng quan');
              setSelectedLessonId(null);
              setOnlyDue(true);
              setIsGlobalStudy(true);
              setCurrentScreen('FlashcardStudy');
            }}
            onNavigateToListeningParts={() => setCurrentScreen('ListeningParts')}
            onNavigateToBilingual={() => setCurrentScreen('Bilingual')}
            onNavigateToStoryList={() => setCurrentScreen('StoryList')}
            onNavigateToWordRaceList={() => setCurrentScreen('WordRaceList')}
            onNavigateToAiChat={() => setCurrentScreen('AiChat')}
          />
        );
    }
  };

  const getActiveTab = (screen: Screen): string => {
    if (screen === 'Notifications') return 'Home';
    if (['FlashcardSet', 'FlashcardStudy', 'CreateFlashcardSet', 'AddWord', 'FillBlankGame', 'StoryList', 'StoryDetail', 'WordRaceList', 'WordRaceGame', 'WordHuntList', 'WordHuntGame'].includes(screen)) return 'VocabularyLearning';
    if (['VocabularyStats', 'VocabularyDailyStats', 'WordDetailStats', 'ListeningStats', 'ListeningExamDetail'].includes(screen)) return 'Stats';
    if (['Profile', 'EditProfile', 'NotificationSettings', 'ChangePassword'].includes(screen)) return 'Profile';
    return screen;
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />
        
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ScreenTransition trigger={currentScreen}>
            {renderScreen()}
          </ScreenTransition>
        </SafeAreaView>
        
        {![
          'Login',
          'Register',
          'ListeningLessonDetail',
          'FlashcardStudy',
          'CreateFlashcardSet', 
          'AddWord',
          'FillBlankGame',
          'VocabularyStats',
          'VocabularyDailyStats',
          'WordDetailStats',
          'ListeningStats',
          'ListeningExamDetail',
          'EditProfile',
          'NotificationSettings',
          'ChangePassword',
          'StoryDetail',
          'WordRaceGame',
          'WordHuntList',
          'WordHuntGame',
          'AiChat'
        ].includes(currentScreen) && (
          <Footer 
            activeTab={getActiveTab(currentScreen)} 
            onTabPress={(tabId) => setCurrentScreen(tabId as Screen)}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
