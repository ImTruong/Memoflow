import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Platform } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { ScreenHeader } from '../components/shared/ScreenHeader';
import { settingApi } from '../api/settingApi';
import DateTimePicker from '@react-native-community/datetimepicker';

type NotificationSettingsScreenProps = {
  onBack: () => void;
};

export const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    studyReminderEnabled: true,
    streakReminderEnabled: true,
    timeWindow: true,
    morningReminderTime: '08:00',
    eveningReminderTime: '20:30',
  });

  // Local settings (not on BE)
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  // Picker states
  const [showPicker, setShowPicker] = useState<'morning' | 'evening' | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await settingApi.getSettings();
      if (res.success) {
        setSettings({
          studyReminderEnabled: res.data.studyReminderEnabled,
          streakReminderEnabled: res.data.streakReminderEnabled,
          timeWindow: res.data.timeWindow,
          morningReminderTime: res.data.morningReminderTime.slice(0, 5),
          eveningReminderTime: res.data.eveningReminderTime.slice(0, 5),
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    // For time values, ensure HH:mm:ss format
    const backendValue = (key.endsWith('Time')) ? `${value}:00` : value;

    // Optimistic update
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await settingApi.updateSettings({ [key]: backendValue });
    } catch (error) {
      console.error('Error updating setting:', error);
      // Rollback on error
      fetchSettings();
    }
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed' || !selectedDate) {
      setShowPicker(null);
      return;
    }

    const hours = selectedDate.getHours().toString().padStart(2, '0');
    const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    if (showPicker === 'morning') {
      updateSetting('morningReminderTime', timeString);
    } else if (showPicker === 'evening') {
      updateSetting('eveningReminderTime', timeString);
    }

    if (Platform.OS === 'android') {
      setShowPicker(null);
    }
  };

  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Cài đặt thông báo"
        onBack={onBack}
        withTopMargin
        backIconName="chevron-back"
        backIconSize={28}
        filledBackButton
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* THÔNG BÁO CHUNG */}
        <Text style={styles.sectionHeader}>THÔNG BÁO CHUNG</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconContainer, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="notifications" size={22} color="#4F46E5" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Nhắc nhở học tập</Text>
              <Text style={styles.itemSubtitle}>Nhận thông báo bài học mới</Text>
            </View>
            <Switch
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E2E8F0"
              onValueChange={(val) => updateSetting('studyReminderEnabled', val)}
              value={settings.studyReminderEnabled}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={[styles.iconContainer, { backgroundColor: '#FFF7ED' }]}>
              <FontAwesome5 name="fire" size={20} color="#F97316" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Thông báo Streak</Text>
              <Text style={styles.itemSubtitle}>Đừng để mất chuỗi ngày học!</Text>
            </View>
            <Switch
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E2E8F0"
              onValueChange={(val) => updateSetting('streakReminderEnabled', val)}
              value={settings.streakReminderEnabled}
            />
          </View>
        </View>

        {/* LỊCH NHẮC HỌC TẬP */}
        <Text style={styles.sectionHeader}>LỊCH NHẮC HỌC TẬP</Text>
        <View style={[styles.card, { backgroundColor: '#F5F7FF' }]}>
          <View style={styles.row}>
            <View style={[styles.iconContainer, { backgroundColor: '#FFFFFF' }]}>
              <Ionicons name="time" size={22} color="#4F46E5" />
            </View>
            <Text style={[styles.itemTitle, { flex: 1, marginLeft: 16 }]}>Thời gian nhắc nhở</Text>
            <Switch
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E2E8F0"
              onValueChange={(val) => updateSetting('timeWindow', val)}
              value={settings.timeWindow}
            />
          </View>

          <View style={styles.timeSlotsRow}>
            <TouchableOpacity 
              style={styles.timeBox} 
              onPress={() => setShowPicker('morning')}
              activeOpacity={0.7}
            >
              <Text style={styles.timeLabel}>Buổi sáng</Text>
              <View style={styles.timeValueRow}>
                <Text style={styles.timeText}>{settings.morningReminderTime}</Text>
                <View style={styles.timeTag}>
                  <Text style={styles.timeTagText}>{parseInt(settings.morningReminderTime) >= 12 ? 'PM' : 'AM'}</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.timeBox}
              onPress={() => setShowPicker('evening')}
              activeOpacity={0.7}
            >
              <Text style={styles.timeLabel}>Buổi tối</Text>
              <View style={styles.timeValueRow}>
                <Text style={styles.timeText}>{settings.eveningReminderTime}</Text>
                <View style={styles.timeTag}>
                  <Text style={styles.timeTagText}>{parseInt(settings.eveningReminderTime) >= 12 ? 'PM' : 'AM'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {(showPicker !== null && Platform.OS !== 'web') && (
            <DateTimePicker
              value={parseTime(showPicker === 'morning' ? settings.morningReminderTime : settings.eveningReminderTime)}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          )}

          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={18} color="#6366F1" />
            <Text style={styles.infoText}>
              Chạm vào khung giờ bên trên để thay đổi thời gian nhắc nhở phù hợp với lịch trình của bạn.
            </Text>
          </View>
        </View>

        {/* KHÁC */}
        <Text style={styles.sectionHeader}>KHÁC</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconContainer, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="volume-high" size={22} color="#10B981" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Âm thanh</Text>
              <Text style={styles.itemSubtitle}>Phát chuông thông báo</Text>
            </View>
            <Switch
              trackColor={{ false: '#E2E8F0', true: '#10B981' }}
              thumbColor="#FFFFFF"
              onValueChange={setSoundEnabled}
              value={soundEnabled}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={[styles.iconContainer, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="pulse" size={22} color="#8B5CF6" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Rung</Text>
              <Text style={styles.itemSubtitle}>Rung khi có thông báo</Text>
            </View>
            <Switch
              trackColor={{ false: '#E2E8F0', true: '#8B5CF6' }}
              thumbColor="#FFFFFF"
              onValueChange={setVibrationEnabled}
              value={vibrationEnabled}
            />
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  sectionHeader: { fontSize: 13, fontWeight: '800', color: '#64748B', marginBottom: 16, marginLeft: 4, letterSpacing: 1 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 30, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 16 },
  itemTitle: { fontSize: 17, fontWeight: 'bold', color: '#1E293B' },
  itemSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  timeSlotsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12 },
  timeBox: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#3B82F6' },
  timeLabel: { fontSize: 11, fontWeight: 'bold', color: '#94A3B8', marginBottom: 8 },
  timeValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeText: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  timeTag: { backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  timeTagText: { fontSize: 11, fontWeight: 'bold', color: '#64748B' },
  infoRow: { flexDirection: 'row', marginTop: 20, alignItems: 'flex-start', paddingHorizontal: 4 },
  infoText: { flex: 1, fontSize: 12, color: '#6366F1', lineHeight: 18, marginLeft: 8, fontWeight: '500' },
});
