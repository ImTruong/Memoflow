import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../theme/colors';

type IoniconName = keyof typeof Ionicons.glyphMap;

type ScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  backIconName?: IoniconName;
  backIconSize?: number;
  backIconColor?: string;
  rightContent?: React.ReactNode;
  rightPlaceholderWidth?: number;
  withTopMargin?: boolean;
  withBorder?: boolean;
  filledBackButton?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  backButtonStyle?: ViewStyle;
};

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  showBack = true,
  backIconName = 'chevron-back',
  backIconSize = 24,
  backIconColor = colors.textPrimary,
  rightContent,
  rightPlaceholderWidth = 40,
  withTopMargin = false,
  withBorder = true,
  filledBackButton = false,
  style,
  titleStyle,
  backButtonStyle,
}) => {
  return (
    <View
      style={[
        styles.header,
        withTopMargin && styles.topMargin,
        withBorder && styles.headerBorder,
        style,
      ]}
    >
      {showBack ? (
        <TouchableOpacity
          style={[
            styles.backBtn,
            filledBackButton && styles.filledBackBtn,
            backButtonStyle,
          ]}
          onPress={onBack}
        >
          <Ionicons name={backIconName} size={backIconSize} color={backIconColor} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: rightPlaceholderWidth }} />
      )}

      <Text style={[styles.headerTitle, titleStyle]} numberOfLines={1}>
        {title}
      </Text>

      {rightContent ?? <View style={{ width: rightPlaceholderWidth }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topMargin: {
    marginTop: 10,
  },
  headerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filledBackBtn: {
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: '70%',
  },
});
