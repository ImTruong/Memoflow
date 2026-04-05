import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, StatusBar, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
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
import { GrammarScreen } from './src/screens/GrammarScreen';
import { GrammarTopicDetailScreen } from './src/screens/GrammarTopicDetailScreen';
import { LessonContentViewScreen } from './src/screens/LessonContentViewScreen';
import { PracticeDetailScreen } from './src/screens/PracticeDetailScreen';
import { QuizSolvingScreen } from './src/screens/QuizSolvingScreen';
import { QuizResultScreen } from './src/screens/QuizResultScreen';
import { Footer } from './src/components/Footer';
import { ScreenTransition } from './src/components/ScreenTransition';
import { StoryListScreen } from './src/screens/StoryListScreen';
import { StoryDetailScreen } from './src/screens/StoryDetailScreen';
import { WordRaceListScreen } from './src/screens/WordRaceListScreen';
import { WordRaceGameScreen } from './src/screens/WordRaceGameScreen';
import { LearningLesson, UserLessonProgress } from './src/types/story';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ListeningPartsScreen } from './src/screens/ListeningPartsScreen';
import { ListeningLessonsScreen } from './src/screens/ListeningLessonsScreen';
import { ListeningLessonDetailScreen } from './src/screens/ListeningLessonDetailScreen';
import { ListeningLessonResultScreen } from './src/screens/ListeningLessonResultScreen';
import { BilingualScreen } from './src/screens/BilingualScreen';
import { BilingualDetailScreen } from './src/screens/BilingualDetailScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WordHuntListScreen } from './src/screens/WordHuntListScreen';
import { WordHuntGameScreen } from './src/screens/WordHuntGameScreen';
import { WordHuntProgress } from './src/types/wordHunt';
import { AiAssistantScreen } from './src/screens/AiAssistantScreen';
import { storyApi } from './src/api/storyApi';
import { prefetchVietnameseMeanings, wordHuntApi } from './src/api/wordHuntApi';
import { BotDifficulty } from './src/types/wordRace';
import { requestNotificationPermissions } from './src/services/pushNotification';
import { AppliedExerciseScreen } from './src/screens/AppliedExerciseScreen';

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
  | 'Grammar'
  | 'GrammarTopicDetail'
  | 'LessonContentView'
  | 'PracticeDetail'
  | 'QuizSolving'
  | 'QuizResult'
  | 'StoryList'
  | 'StoryDetail'
  | 'WordRaceList'
  | 'WordRaceGame'
  | 'WordHuntList'
  | 'WordHuntGame'
  | 'Bilingual'
  | 'BilingualDetail'
  | 'AiChat'
  | 'AppliedExercise';

type FeatureEntryScreen = 'Home' | 'VocabularyLearning';

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
  const [selectedWordRaceLesson, setSelectedWordRaceLesson] = useState<LearningLesson | null>(null);
  const [selectedWordRaceDifficulty, setSelectedWordRaceDifficulty] = useState<BotDifficulty>('MEDIUM');
  const [selectedWordHuntProgress, setSelectedWordHuntProgress] = useState<WordHuntProgress | null>(null);
  const [wordHuntProgressList, setWordHuntProgressList] = useState<WordHuntProgress[]>([]);
  const [selectedListeningPart, setSelectedListeningPart] = useState<number | null>(null);
  const [isResumeListening, setResumeListening] = useState<boolean>(true);
  const [isOwner, setIsOwner] = useState(true);
  const [prevScreen, setPrevScreen] = useState<Screen>('Home');
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);
  const [featureEntryScreen, setFeatureEntryScreen] = useState<FeatureEntryScreen>('VocabularyLearning');

    // Grammar & Quiz state
    const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
    const [selectedGrammarLessonId, setSelectedGrammarLessonId] = useState<number | null>(null);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [quizAnswers, setQuizAnswers] = useState<any>(null);

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

  // Setup notification listeners
  useEffect(() => {
    // Request permissions on app start
    requestNotificationPermissions().then((granted) => {
      console.log('Notification permission granted:', granted);
    }).catch(console.error);

    // Listener for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification);
      Alert.alert(
        notification.request.content.title || 'Thông báo',
        notification.request.content.body || '',
        [{ text: 'OK' }]
      );
    });

    // Listener for when user taps on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      // You can navigate to specific screen based on notification data
      const data = response.notification.request.content.data;
      if (data?.screen) {
        setCurrentScreen(data.screen as Screen);
      }
    });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
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

  const loadWordHuntLessons = async () => {
    try {
      const response = await wordHuntApi.getWordHuntLessons(0, 50);
      setWordHuntProgressList(response.data.content);
    } catch (error) {
      console.error('Failed to load Word Hunt lessons', error);
    }
  };

  const warmWordHuntMeanings = (wordHuntProgress: WordHuntProgress) => {
    const { words, targetWordCount } = wordHuntProgress.learningLesson.content;
    prefetchVietnameseMeanings(words.slice(0, targetWordCount));
  };

  const refreshWordHuntDetail = async (lessonId: number) => {
    try {
      const response = await wordHuntApi.getWordHuntLessonDetail(lessonId);
      const detail = response.data;

      warmWordHuntMeanings(detail);

      setSelectedWordHuntProgress(detail);
      setWordHuntProgressList(prev => prev.map(item =>
        item.learningLesson.id === lessonId ? detail : item
      ));
    } catch (error) {
      console.error('Failed to load Word Hunt lesson detail', error);
    }
  };

  useEffect(() => {
    if (currentScreen === 'StoryList') {
      void loadStoryLessons();
    }
  }, [currentScreen]);

  useEffect(() => {
    if (currentScreen === 'WordHuntList') {
      void loadWordHuntLessons();
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
        case 'AiChat':
            return (
                <AiAssistantScreen
                    onBack={() => setCurrentScreen('Home')}
                />
            );
        case 'AppliedExercise':
            return (
                <AppliedExerciseScreen
                    onBack={() => setCurrentScreen('Home')}
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
                    onNavigateToGrammar={() => setCurrentScreen('Grammar')}
                    onNavigateToAiChat={() => setCurrentScreen('AiChat')}
                    onNavigateToAppliedExercise={() => setCurrentScreen('AppliedExercise')}
                />
            );
        case 'Grammar':
            return (
                <GrammarScreen
                    navigation={{
                        navigate: (screen: string, params: any) => {
                            if (screen === 'GrammarTopicDetail') {
                                setSelectedTopicId(params.topicId);
                                setCurrentScreen('GrammarTopicDetail');
                            } else if (screen === 'PracticeDetail') {
                                setSelectedTaskId(params.taskId);
                                setCurrentScreen('PracticeDetail');
                            }
                        }
                    }}
                />
            );
        case 'GrammarTopicDetail':
            return (
                <GrammarTopicDetailScreen
                    route={{ params: { topicId: selectedTopicId } }}
                    navigation={{
                        goBack: () => setCurrentScreen('Grammar'),
                        navigate: (screen: string, params: any) => {
                            if (screen === 'LessonContentView') {
                                setSelectedGrammarLessonId(params.lessonId);
                                setCurrentScreen('LessonContentView');
                            }
                        }
                    }}
                />
            );
        case 'LessonContentView':
            return (
                <LessonContentViewScreen
                    route={{ params: { lessonId: selectedGrammarLessonId } }}
                    navigation={{
                        goBack: () => setCurrentScreen('GrammarTopicDetail'),
                        navigate: (screen: string, params: any) => {
                            if (screen === 'PracticeDetail') {
                                setSelectedTaskId(params.taskId);
                                setCurrentScreen('PracticeDetail');
                            }
                        }
                    }}
                />
            );
        case 'PracticeDetail':
            return (
                <PracticeDetailScreen
                    route={{ params: { taskId: selectedTaskId } }}
                    navigation={{
                        goBack: () => setCurrentScreen('Grammar'),
                        navigate: (screen: string, params: any) => {
                            if (screen === 'QuizSolving') {
                                setCurrentScreen('QuizSolving');
                            }
                        }
                    }}
                />
            );
        case 'QuizSolving':
            return (
                <QuizSolvingScreen
                    route={{ params: { taskId: selectedTaskId } }}
                    navigation={{
                        goBack: () => setCurrentScreen('PracticeDetail'),
                        navigate: (screen: string, params: any) => {
                            if (screen === 'QuizResult') {
                                setQuizAnswers(params.answers);
                                setCurrentScreen('QuizResult');
                            }
                        }
                    }}
                />
            );
        case 'QuizResult':
            return (
                <QuizResultScreen
                    route={{ params: { answers: quizAnswers } }}
                    navigation={{
                        navigate: (screen: string) => {
                            if (screen === 'Grammar') setCurrentScreen('Grammar');
                            if (screen === 'Home') setCurrentScreen('Home');
                            if (screen === 'PracticeDetail') setCurrentScreen('PracticeDetail');
                        }
                    }}
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
            onNavigateToStoryList={() => {
              setFeatureEntryScreen('VocabularyLearning');
              setCurrentScreen('StoryList');
            }}
            onNavigateToWordRaceList={() => {
              setFeatureEntryScreen('VocabularyLearning');
              setCurrentScreen('WordRaceList');
            }}
            onNavigateToWordHuntList={() => setCurrentScreen('WordHuntList')}
            onNavigateToBilingual={() => {
              setPrevScreen('VocabularyLearning');
              setCurrentScreen('Bilingual');
            }}
            onNavigateToAppliedExercise={() => setCurrentScreen('AppliedExercise')}
          />
        );
      case 'FlashcardSet':
        return (
          <FlashcardSetScreen 
            onBack={() => setCurrentScreen('VocabularyLearning')} 
            onNavigateToCreate={() => {
              setEditMode(false);
              setSelectedLessonId(null);
              setIsOwner(true);
              setCurrentScreen('CreateFlashcardSet');
            }}
            onNavigateToEdit={(id, isOwnerValue) => {
              setEditMode(true);
              setSelectedLessonId(id);
              setIsOwner(isOwnerValue ?? true);
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
            isOwner={isOwner}
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
            onBack={() => setCurrentScreen(featureEntryScreen)}
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
            onBack={() => setCurrentScreen(featureEntryScreen)}
            onNavigateToGame={(lesson, difficulty) => {
              setSelectedWordRaceLesson(lesson);
              setSelectedWordRaceDifficulty(difficulty);
              setCurrentScreen('WordRaceGame');
            }}
          />
        );
      case 'WordRaceGame':
        return selectedWordRaceLesson ? (
          <WordRaceGameScreen
            lesson={selectedWordRaceLesson}
            difficulty={selectedWordRaceDifficulty}
            onBack={() => {
              setSelectedWordRaceLesson(null);
              setCurrentScreen('WordRaceList');
            }}
            onComplete={() => {}}
          />
        ) : null;
      case 'WordHuntList':
        return (
          <WordHuntListScreen
            progresses={wordHuntProgressList}
            onBack={() => setCurrentScreen('VocabularyLearning')}
            onNavigateToGame={async (progress) => {
              warmWordHuntMeanings(progress);
              setSelectedWordHuntProgress(progress);
              setCurrentScreen('WordHuntGame');

              void refreshWordHuntDetail(progress.learningLesson.id);
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
            onFinish={async (payload) => {
              if (!selectedWordHuntProgress) {
                return;
              }

              try {
                const response = await wordHuntApi.updateWordHuntProgress(
                  selectedWordHuntProgress.learningLesson.id,
                  {
                    isCompleted: payload.isCompleted,
                    progressPercent: payload.progressPercent,
                    score: payload.score,
                    hintsUsedToday: payload.hintsUsedToday,
                    hintsUsedDate: payload.hintsUsedDate,
                  }
                );

                const updated = response.data;
                setSelectedWordHuntProgress(updated);
                setWordHuntProgressList(prev => prev.map(item =>
                  item.learningLesson.id === updated.learningLesson.id ? updated : item
                ));
              } catch (error) {
                console.error('Failed to update Word Hunt progress', error);
              }
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
            onNavigateToGrammar={() => setCurrentScreen('Grammar')}
            onNavigateToListeningParts={() => setCurrentScreen('ListeningParts')}
            onNavigateToBilingual={() => {
              setPrevScreen('Home')
              setCurrentScreen('Bilingual')
            }}
            onNavigateToStoryList={() => {
              setFeatureEntryScreen('Home');
              setCurrentScreen('StoryList');
            }}
            onNavigateToWordRaceList={() => {
              setFeatureEntryScreen('Home');
              setCurrentScreen('WordRaceList');
            }}
            onNavigateToAiChat={() => setCurrentScreen('AiChat')}
            onNavigateToAppliedExercise={() => setCurrentScreen('AppliedExercise')}
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
          'AiChat',
          'AppliedExercise'
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
