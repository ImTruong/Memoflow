import React, { useState } from 'react';
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

type Screen = 'Home' | 'Notifications' | 'VocabularyLearning' | 'FlashcardSet' | 'CreateFlashcardSet' | 'AddWord' | 'FlashcardStudy' | 'FillBlankGame' | 'Stats' | 'VocabularyStats' | 'VocabularyDailyStats' | 'WordDetailStats' | 'ListeningStats' | 'ListeningExamDetail' | 'Profile' | 'EditProfile' | 'NotificationSettings' | 'ChangePassword';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Home');
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

  const renderScreen = () => {
    switch (currentScreen) {
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
          />
        );
      case 'EditProfile':
        return <EditProfileScreen onBack={() => setCurrentScreen('Profile')} />;
      case 'NotificationSettings':
        return <NotificationSettingsScreen onBack={() => setCurrentScreen('Profile')} />;
      case 'ChangePassword':
        return <ChangePasswordScreen onBack={() => setCurrentScreen('Profile')} />;
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
          />
        );
    }
  };

  const getActiveTab = (screen: Screen): string => {
    if (screen === 'Notifications') return 'Home';
    if (['FlashcardSet', 'FlashcardStudy', 'CreateFlashcardSet', 'AddWord', 'FillBlankGame'].includes(screen)) return 'VocabularyLearning';
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
          'ChangePassword'
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
