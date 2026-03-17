import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { colors, typography } from '../theme/colors';

type Tab = {
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap | keyof typeof FontAwesome5.glyphMap;
  iconType: 'material' | 'fontAwesome';
};

const tabs: Tab[] = [
  { id: 'Home', label: 'Trang chủ', icon: 'home', iconType: 'material' },
  { id: 'VocabularyLearning', label: 'Học tập', icon: 'graduation-cap', iconType: 'fontAwesome' },
  { id: 'Stats', label: 'Thống kê', icon: 'bar-chart', iconType: 'material' },
  { id: 'Profile', label: 'Cá nhân', icon: 'person-outline', iconType: 'material' },
];

type FooterProps = {
  activeTab: string;
  onTabPress: (tabId: string) => void;
};

export const Footer: React.FC<FooterProps> = ({ activeTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const color = isActive ? colors.primary : colors.textSecondary;
        
        return (
          <TouchableOpacity 
            key={tab.id} 
            style={styles.tab}
            onPress={() => onTabPress(tab.id)}
          >
            {tab.iconType === 'material' ? (
              <MaterialIcons name={tab.icon as any} size={28} color={color} />
            ) : (
              <FontAwesome5 name={tab.icon as any} size={24} color={color} />
            )}
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 24, // Optional extra padding for iOS home indicator
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  label: {
    ...typography.caption,
    marginTop: 4,
    fontWeight: '600',
  },
});
