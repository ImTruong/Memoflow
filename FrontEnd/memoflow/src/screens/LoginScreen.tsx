import React, { useState, useEffect } from 'react';
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
import Svg, { Path } from 'react-native-svg';
import { GoogleSignin, statusCodes, isErrorWithCode, isSuccessResponse } from '@react-native-google-signin/google-signin';

const { width, height } = Dimensions.get('window');
GoogleSignin.configure({
  webClientId: '742848434445-lo5epsqjkqd887c43rkbdvvuns5rd826.apps.googleusercontent.com',
  iosClientId: '742848434445-l6gbkf7q2sq4ai27n6s6srmt4le34j1r.apps.googleusercontent.com',
  offlineAccess: true,
});

type LoginScreenProps = {
  onNavigateToHome: () => void;
  onNavigateToRegister?: () => void;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToHome,
  onNavigateToRegister,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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
      const response = await authApi.login({ email, password });
      await AsyncStorage.setItem('authToken', response.data.token);
      onNavigateToHome();
    } catch (err: any) {
      const msg =
        err.message === 'Forbidden'
          ? 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.'
          : 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.';
      Alert.alert('Đăng nhập thất bại', msg, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const idToken = response.data.idToken;
        if (!idToken) {
          const msg = 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.';
          Alert.alert('Đăng nhập thất bại', msg, [{ text: 'OK' }]);
          return;
        }
        const backendRes = await authApi.loginGoogle({ idToken });
        const jwtToken = backendRes.data.token;
        await AsyncStorage.setItem('authToken', jwtToken);
        onNavigateToHome();
      }
    } catch (err: any) {
      const msg = 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.';
      Alert.alert('Đăng nhập thất bại', msg, [{ text: 'OK' }]);
    } finally {
      setIsGoogleLoading(false);
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
                disabled={isLoading || isGoogleLoading}
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

              {/* 4. Thêm dải phân cách "Hoặc" */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Hoặc</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleLogin}
                disabled={isLoading || isGoogleLoading}
                activeOpacity={0.85}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator style={styles.googleIconBox} color="#4285F4" />
                ) : (
                  <>
                    <View style={styles.googleIconBox}>
                      <Svg width={20} height={20} viewBox="0 0 18 18">
                        <Path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                        <Path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                        <Path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" />
                        <Path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
                      </Svg>
                    </View>
                    <Text style={styles.googleButtonText}>Tiếp tục với Google</Text>
                  </>
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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 16, color: '#1E293B' },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
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
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 4,
    height: 50,
    width: '100%',
    overflow: 'hidden',
  },
  googleIconBox: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#dadce0',
    backgroundColor: '#fff',
  },
  googleButtonText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#94A3B8',
    fontSize: 14,
  },
  buttonInner: { flexDirection: 'row', alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 18, marginRight: 5 },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#64748B', fontSize: 14 },
  linkText: { color: '#3B82F6', fontWeight: 'bold', fontSize: 14 },
});

export default LoginScreen;