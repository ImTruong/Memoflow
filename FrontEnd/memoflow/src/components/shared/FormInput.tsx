import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IoniconName = keyof typeof Ionicons.glyphMap;

type FormInputProps = TextInputProps & {
  label: string;
  /** Optional icon on the right side (e.g. eye toggle, calendar) */
  rightIcon?: IoniconName;
  onRightIconPress?: () => void;
  /** If true, the whole input area acts as a pressable (e.g. date picker) */
  onPress?: () => void;
  containerStyle?: ViewStyle;
};

/**
 * Shared form field used in EditProfileScreen and ChangePasswordScreen.
 * Eliminates the duplicated inputGroup / label / inputWrapper pattern.
 */
export const FormInput: React.FC<FormInputProps> = ({
  label,
  rightIcon,
  onRightIconPress,
  onPress,
  containerStyle,
  ...inputProps
}) => {
  const WrapperComponent = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

  return (
    <View style={[styles.inputGroup, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      {/* @ts-ignore – dynamic component props */}
      <WrapperComponent style={styles.inputWrapper} {...wrapperProps}>
        <TextInput {...inputProps} style={styles.input} />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress}>
            <Ionicons name={rightIcon} size={22} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </WrapperComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 20,
    height: 60,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
});
