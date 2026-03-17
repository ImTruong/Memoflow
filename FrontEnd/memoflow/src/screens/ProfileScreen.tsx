import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography } from '../theme/colors';
import { NotificationOverlay } from '../components/NotificationOverlay';

import { useUser } from '../hooks/useUser';

type ProfileScreenProps = {
  onNavigateToNotifications: () => void;
  onNavigateToEditProfile: () => void;
  onNavigateToNotificationSettings: () => void;
  onNavigateToChangePassword: () => void;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  onNavigateToNotifications,
  onNavigateToEditProfile,
  onNavigateToNotificationSettings,
  onNavigateToChangePassword
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { profile } = useUser();

  const userName = profile?.name || "Người dùng";
  const streakDays = profile?.streakDays || 0;
  const avatarUrl = profile?.avatar || 'https://i.pravatar.cc/300?img=11';



  return (
    <View style={styles.container}>
      {/* Header with Underline - Exactly like Home */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Trang cá nhân</Text>
        <TouchableOpacity 
          style={[styles.notificationBtn, showNotifications && styles.activeNotificationBtn]}
          onPress={() => setShowNotifications(!showNotifications)}
        >
          <Ionicons 
            name="notifications" 
            size={24} 
            color={showNotifications ? colors.primary : colors.textPrimary} 
          />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.contentWrapper}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
          scrollEnabled={!showNotifications}
        >
          {/* Profile Info Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarGlow} />
              <View style={styles.avatarWrapper}>
                <Image 
                  source={{ uri: avatarUrl }} 
                  style={styles.avatar} 
                />

                <TouchableOpacity style={styles.editBadge} onPress={onNavigateToEditProfile}>
                  <MaterialCommunityIcons name="pencil" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.userNameText}>{userName}</Text>
            
            <View style={styles.streakBadgeContainer}>
              <View style={styles.streakBadge}>
                <FontAwesome5 name="fire" size={16} color={colors.warning} />
                <Text style={styles.streakValue}>{streakDays} Ngày</Text>
              </View>
            </View>
          </View>

          {/* Settings Menu - 3 items only */}
          <View style={styles.menuWrapper}>
            <TouchableOpacity 
              style={styles.menuCard} 
              activeOpacity={0.7}
              onPress={onNavigateToEditProfile}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="person" size={22} color="#0EA5E9" />
              </View>
              <Text style={styles.menuTitle}>Sửa thông tin cá nhân</Text>
              <MaterialIcons name="chevron-right" size={24} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuCard} 
              activeOpacity={0.7}
              onPress={onNavigateToNotificationSettings}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="notifications" size={22} color="#F97316" />
              </View>
              <Text style={styles.menuTitle}>Cài đặt thông báo</Text>
              <MaterialIcons name="chevron-right" size={24} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuCard} 
              activeOpacity={0.7}
              onPress={onNavigateToChangePassword}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="lock-closed" size={22} color="#6366F1" />
              </View>
              <Text style={styles.menuTitle}>Bảo mật & Mật khẩu</Text>
              <MaterialIcons name="chevron-right" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Logout Section */}
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8}>
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </ScrollView>

        {showNotifications && (
          <NotificationOverlay 
            onClose={() => setShowNotifications(false)} 
            onSeeAll={onNavigateToNotifications}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Same as Home
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  notificationBtn: {
    position: 'relative',
    padding: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeNotificationBtn: {
    backgroundColor: colors.cardBackgrounds.purpleLight,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: colors.danger,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: 30,
    paddingBottom: 60,
    backgroundColor: '#FFFFFF',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    position: 'relative',
    padding: 6,
    marginBottom: 16,
  },
  avatarGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 70,
    backgroundColor: colors.primary,
    opacity: 0.1,
  },
  avatarWrapper: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFFFFF',
    padding: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  editBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  userNameText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  streakBadgeContainer: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: colors.cardBackgrounds.orangeLight,
  },
  streakValue: {
    color: '#D97706',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  menuWrapper: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 30,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9', // More subtle border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  menuIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 17,
    color: '#1E293B',
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: '#FFF1F2', // Matches red theme more precisely
    marginHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 32,
    alignItems: 'center',
    marginBottom: 40, // More bottom space
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '800',
  },
});
