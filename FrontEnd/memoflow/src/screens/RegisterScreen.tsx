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
  const [isResending, setIsResending] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [countdown, setCountdown] = useState(120);

  const inputsRef = useRef<(TextInput | null)[]>([]);

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
              <View style={styles.logoCircle}>
                <MaterialCommunityIcons name="account-plus-outline" size={50} color="#FFF" />
              </View>
              <Text style={styles.title}>Tạo tài khoản</Text>
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
                style={[styles.registerButton, isLoading && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={isLoading}
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
  headerContainer: { alignItems: 'center', marginBottom: 30, paddingTop: 20 },
  logoCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#5D7CFF', justifyContent: 'center', alignItems: 'center', elevation: 8, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#1E3A8A' },
  subtitle: { fontSize: 15, color: '#64748B', marginTop: 15, textAlign: 'center', paddingHorizontal: 40 },

  formCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 35,
    paddingBottom: 40,
    width: '100%',
    minHeight: height * 0.6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FBFBFB', borderRadius: 20, paddingHorizontal: 15, marginBottom: 20, borderWidth: 1, borderColor: '#DEE2E6' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#212529' },

  registerButton: { backgroundColor: '#1E75E6', borderRadius: 25, paddingVertical: 16, alignItems: 'center', marginTop: 10, elevation: 2 },
  buttonInner: { flexDirection: 'row', alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16, marginRight: 8 },

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
  otpInput: {
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    height: 55,
    backgroundColor: '#FBFBFB',
    color: '#212529',
  },
  countdownText: { color: '#64748B', fontSize: 13, marginBottom: 10 },
  expiredLabel: { color: '#EF4444', fontSize: 13, marginBottom: 10, fontWeight: '600' },
  resendWrapper: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 5 },
  resendLabel: { color: '#64748B', fontSize: 13 },
  resendText: { color: '#3B82F6', fontWeight: 'bold', fontSize: 13 },
});

export default RegisterScreen;