import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { ForgotPasswordModal } from '../components/ForgotPassword';
import { authApi } from '../api/authApi';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width, height } = Dimensions.get('window');

type LoginScreenProps = {
  onNavigateToHome: () => void;
  onNavigateToRegister?: () => void;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToHome,
  onNavigateToRegister,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotModalVisible, setForgotModalVisible] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('authToken');
      const response = await authApi.login({ email: email.trim().toLowerCase(), password });
      await AsyncStorage.setItem('authToken', response.data.token);
      onNavigateToHome();
    } catch (err: any) {
      console.log(err);
      const errorMessage = String(err?.message || '');
      let msg = 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.';
      if (/401|403|forbidden|unauthorized|bad credentials/i.test(errorMessage)) {
        msg = 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.';
      } else if (/network request failed|failed to fetch|load failed/i.test(errorMessage)) {
        msg = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại backend hoặc mạng.';
      } else if (__DEV__ && errorMessage) {
        msg = errorMessage;
      }
      Alert.alert('Đăng nhập thất bại', msg, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E0F2FF', '#FFFFFF']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >

          <KeyboardAwareScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headerContainer}>
              <View style={styles.logoCircle}>
                <MaterialCommunityIcons name="earth" size={50} color="#FFF" />
              </View>
              <View style={[styles.badge, styles.badgeHello]}>
                <Text style={styles.badgeText}>Hello!</Text>
              </View>
              <View style={[styles.badge, styles.badgeGoal]}>
                <Text style={styles.badgeText}>Goal</Text>
              </View>

              <View style={styles.welcomeContainer}>
                <View style={styles.aPlusBadge}>
                  <Text style={styles.aPlusText}>A+</Text>
                </View>
                <Text style={styles.title}>Welcome Back</Text>
              </View>
              <Text style={styles.subtitle}>Học tiếng Anh mỗi ngày!</Text>
            </View>
            <View style={styles.formCard}>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="email-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email của bạn"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mật khẩu"
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => setForgotModalVisible(true)}
                style={styles.forgotBtn}
              >
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <View style={styles.buttonInner}>
                    <Text style={styles.buttonText}>Đăng nhập</Text>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Chưa có tài khoản? </Text>
                <TouchableOpacity onPress={onNavigateToRegister}>
                  <Text style={styles.linkText}>Đăng ký</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ForgotPasswordModal
        visible={forgotModalVisible}
        onClose={() => setForgotModalVisible(false)}
        onTypeSuccess={() => setForgotModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'flex-end' },

  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#5D7CFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#5D7CFF',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  badge: {
    position: 'absolute',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeHello: { backgroundColor: '#FFF', top: 30, left: 40, transform: [{ rotate: '-10deg' }] },
  badgeGoal: { backgroundColor: '#FF6B9D', top: 50, right: 40, transform: [{ rotate: '10deg' }] },
  badgeText: { fontWeight: 'bold', fontSize: 12, color: '#4A90E2' },
  welcomeContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 30 },
  aPlusBadge: { backgroundColor: '#FFD700', padding: 4, borderRadius: 8, marginRight: 10 },
  aPlusText: { fontWeight: '900', color: '#FFF', fontSize: 14 },
  title: { fontSize: 28, fontWeight: '800', color: '#1E3A8A' },
  subtitle: { fontSize: 16, color: '#64748B', marginTop: 5 },

  formCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 50,
    width: '100%',
    minHeight: height * 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 16, color: '#1E293B' },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotText: { color: '#3B82F6', fontWeight: '600', fontSize: 14 },

  loginButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonInner: { flexDirection: 'row', alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 18, marginRight: 5 },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#64748B', fontSize: 14 },
  linkText: { color: '#3B82F6', fontWeight: 'bold', fontSize: 14 },
});

export default LoginScreen;