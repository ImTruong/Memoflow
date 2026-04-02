import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TextInput,
  Platform,
  Modal,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { authApi } from '../api/authApi';
import Svg, { Path } from 'react-native-svg';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken, Settings } from 'react-native-fbsdk-next';

Settings.initializeSDK();

const { height } = Dimensions.get('window');

type RegisterScreenProps = {
  onNavigateToHome: () => void;
  onNavigateToLogin?: () => void;
};

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToHome,
  onNavigateToLogin,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [countdown, setCountdown] = useState(120);

  const inputsRef = useRef<(TextInput | null)[]>([]);
  const isAnyLoading = isLoading || isGoogleLoading || isFacebookLoading;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isModalVisible && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isModalVisible, countdown]);

  const resetModalState = () => {
    setOtp(Array(6).fill(''));
    setCountdown(120);
    setIsResending(false);
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      await authApi.register({ name, email, password });
      return true;
    } catch (err: any) {
      Alert.alert('Đăng ký thất bại', err.message, [{ text: 'OK' }]);
      return false;
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Thông tin không hợp lệ', 'Vui lòng nhập đầy đủ thông tin.', [{ text: 'OK' }]);
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mật khẩu không khớp', 'Vui lòng thử lại.', [{ text: 'OK' }]);
      return;
    }
    setIsLoading(true);
    const success = await register(name, email, password);
    setIsLoading(false);
    if (success) {
      resetModalState();
      setIsModalVisible(true);
      setTimeout(() => inputsRef.current[0]?.focus(), 400);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const token = response.data.idToken;
        if (!token) {
          Alert.alert('Thất bại', 'Có lỗi xảy ra. Vui lòng thử lại sau.', [{ text: 'OK' }]);
          return;
        }
        const backendRes = await authApi.loginGoogle({ token });
        await AsyncStorage.setItem('authToken', backendRes.data.token);
        onNavigateToHome();
      }
    } catch (err: any) {
      Alert.alert('Thất bại', 'Có lỗi xảy ra. Vui lòng thử lại sau.', [{ text: 'OK' }]);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsFacebookLoading(true);
    try {
      LoginManager.logOut();
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      if (result.isCancelled) return;
      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        Alert.alert('Thất bại', 'Không lấy được token Facebook.', [{ text: 'OK' }]);
        return;
      }
      const token = data.accessToken.toString();
      const backendRes = await authApi.loginFacebook({ token });
      await AsyncStorage.setItem('authToken', backendRes.data.token);
      onNavigateToHome();
    } catch (err: any) {
      Alert.alert('Thất bại', 'Có lỗi xảy ra. Vui lòng thử lại sau.', [{ text: 'OK' }]);
    } finally {
      setIsFacebookLoading(false);
    }
  };

  const verifyAccount = async ({ email, password, code }: { email: string; password: string; code: string }) => {
    try {
      const response = await authApi.verifyAccount({ email, password, code });
      await AsyncStorage.setItem('authToken', response.data.token);
      return true;
    } catch (err: any) {
      Alert.alert('Xác thực thất bại', err.message, [{ text: 'OK' }]);
      return false;
    }
  };

  const handleVerify = async (code: string) => {
    if (countdown === 0) {
      Alert.alert('Mã hết hạn', 'Vui lòng gửi lại mã.', [{ text: 'OK' }]);
      return;
    }
    const success = await verifyAccount({ email, password, code });
    if (success) {
      setIsModalVisible(false);
      onNavigateToHome();
    } else {
      setOtp(Array(6).fill(''));
      inputsRef.current[0]?.focus();
    }
  };

  const handleChangeOtp = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) inputsRef.current[index + 1]?.focus();
    const code = newOtp.join('');
    if (code.length === 6 && newOtp.every((d) => d !== '')) handleVerify(code);
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newOtp = [...otp];
      if (!otp[index] && index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputsRef.current[index - 1]?.focus();
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleResend = async () => {
    if (isResending) return;
    setIsResending(true);
    const success = await register(name, email, password);
    setIsResending(false);
    if (success) {
      resetModalState();
      inputsRef.current[0]?.focus();
    }
  };

  const handleCloseModal = () => {
    resetModalState();
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#E0F2FF', '#FFFFFF']} style={StyleSheet.absoluteFillObject} />

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
              <Text style={styles.title}>Đăng ký</Text>
              <Text style={styles.subtitle}>Bắt đầu hành trình học Tiếng Anh ngay!</Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="account-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Họ và tên"
                  placeholderTextColor="#ADB5BD"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="email-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Địa chỉ email"
                  placeholderTextColor="#ADB5BD"
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
                  placeholderTextColor="#ADB5BD"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons name={showPassword ? 'eye' : 'eye-off'} size={20} color="#868E96" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-check-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Xác nhận mật khẩu"
                  placeholderTextColor="#ADB5BD"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <MaterialCommunityIcons name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#868E96" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.registerButton, isAnyLoading && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={isAnyLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <View style={styles.buttonInner}>
                    <Text style={styles.buttonText}>Đăng ký ngay</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Hoặc</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleLogin}
                disabled={isAnyLoading}
                activeOpacity={0.85}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator style={styles.socialIconBox} color="#4285F4" />
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

              <TouchableOpacity
                style={styles.facebookButton}
                onPress={handleFacebookLogin}
                disabled={isAnyLoading}
                activeOpacity={0.85}
              >
                {isFacebookLoading ? (
                  <ActivityIndicator style={styles.socialIconBox} color="#1877F2" />
                ) : (
                  <>
                    <View style={styles.facebookIconBox}>
                      <Svg width={20} height={20} viewBox="0 0 24 24">
                        <Path
                          fill="#1877F2"
                          d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
                        />
                      </Svg>
                    </View>
                    <Text style={styles.facebookButtonText}>Tiếp tục với Facebook</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Đã có tài khoản? </Text>
                <TouchableOpacity onPress={onNavigateToLogin}>
                  <Text style={styles.linkText}>Đăng nhập</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal transparent visible={isModalVisible} animationType="fade" statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.closeIconButton} onPress={handleCloseModal}>
              <MaterialCommunityIcons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="shield-check-outline" size={30} color="#3B82F6" />
            </View>
            <Text style={styles.modalTitle}>Xác thực tài khoản</Text>
            <Text style={styles.modalDesc}>
              Mã xác thực đã được gửi đến{'\n'}
              <Text style={{ fontWeight: 'bold', color: '#1E293B' }}>{email}</Text>
            </Text>
            <View style={styles.otpRow}>
              {otp.map((d, i) => (
                <TextInput
                  key={i}
                  ref={(el) => { inputsRef.current[i] = el; }}
                  style={styles.otpInput}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={d}
                  onChangeText={(t) => handleChangeOtp(t, i)}
                  onKeyPress={(e) => handleKeyPress(e, i)}
                />
              ))}
            </View>
            <Text style={countdown > 0 ? styles.countdownText : styles.expiredLabel}>
              {countdown > 0 ? `Hết hạn sau ${countdown}s` : 'Mã xác thực đã hết hạn.'}
            </Text>
            <View style={styles.resendWrapper}>
              <Text style={styles.resendLabel}>Chưa nhận được mã? </Text>
              {isResending ? (
                <ActivityIndicator size="small" color="#3B82F6" style={{ marginLeft: 5 }} />
              ) : (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendText}>Gửi lại</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'flex-end' },
  headerContainer: { alignItems: 'center', marginBottom: 30, paddingTop: 10 },
  logoCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#5D7CFF', justifyContent: 'center', alignItems: 'center', elevation: 8, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#1E3A8A' },
  subtitle: { fontSize: 15, color: '#64748B', marginTop: 15, textAlign: 'center', paddingHorizontal: 40 },

  formCard: {
    backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40,
    paddingHorizontal: 30, paddingTop: 35, paddingBottom: 50,
    width: '100%', minHeight: height * 0.6,
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05, shadowRadius: 20, elevation: 10,
  },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FBFBFB', borderRadius: 20, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: '#DEE2E6' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#212529' },

  registerButton: { backgroundColor: '#1E75E6', borderRadius: 25, paddingVertical: 16, alignItems: 'center', marginTop: 10, elevation: 2 },
  buttonInner: { flexDirection: 'row', alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16, marginRight: 8 },

  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { marginHorizontal: 10, color: '#94A3B8', fontSize: 14 },

  socialIconBox: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },

  googleButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#dadce0',
    borderRadius: 4, height: 50, width: '100%', overflow: 'hidden', marginBottom: 12,
  },
  googleIconBox: {
    width: 45, height: 45, alignItems: 'center', justifyContent: 'center',
    borderRightWidth: 1, borderRightColor: '#dadce0', backgroundColor: '#fff',
  },
  googleButtonText: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '500'},

  facebookButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#dadce0',
    borderRadius: 4, height: 45, width: '100%', overflow: 'hidden',
  },
  facebookIconBox: {
    width: 45, height: 45, alignItems: 'center', justifyContent: 'center',
    borderRightWidth: 1, borderRightColor: '#dadce0', backgroundColor: '#fff',
  },
  facebookButtonText: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '500' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { color: '#495057', fontSize: 14 },
  linkText: { color: '#1E75E6', fontWeight: 'bold', fontSize: 14 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 380, backgroundColor: '#FFF', borderRadius: 32, padding: 28, alignItems: 'center', elevation: 15, position: 'relative' },
  closeIconButton: { position: 'absolute', top: 20, right: 20, zIndex: 10, padding: 5 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 15, marginTop: 10 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1E3A8A', marginBottom: 10 },
  modalDesc: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  otpInput: { flex: 1, marginHorizontal: 4, borderWidth: 1.5, borderColor: '#E9ECEF', borderRadius: 12, textAlign: 'center', fontSize: 20, fontWeight: 'bold', height: 55, backgroundColor: '#FBFBFB', color: '#212529' },
  countdownText: { color: '#64748B', fontSize: 13, marginBottom: 10 },
  expiredLabel: { color: '#EF4444', fontSize: 13, marginBottom: 10, fontWeight: '600' },
  resendWrapper: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 5 },
  resendLabel: { color: '#64748B', fontSize: 13 },
  resendText: { color: '#3B82F6', fontWeight: 'bold', fontSize: 13 },
});

export default RegisterScreen;