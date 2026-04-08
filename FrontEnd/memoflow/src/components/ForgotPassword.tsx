import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authApi } from '../api/authApi';

export const ForgotPasswordModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onTypeSuccess: () => void;
}> = ({ visible, onClose, onTypeSuccess }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [countdown, setCountdown] = useState(120);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false); 

  const inputsRef = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (visible && step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [visible, step, countdown]);

  useEffect(() => {
    if (!visible) {
      setStep(1);
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setOtp(Array(6).fill(''));
      setCountdown(120);
      setIsResending(false);
    }
  }, [visible]);

  const requestReset = async (email: string, newPassword: string) => {
    try {
      await authApi.forgotPassword({ email, newPassword });
      return true;
    } catch (err: any) {
      Alert.alert("Thông tin không hợp lệ", err.message, [{ text: "OK" }]);
      return false;
    }
  };

  const verifyReset = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.verifyResetPassword({ email, code });
      return res.success;
    } catch (err: any) {
      Alert.alert("Xác thực thất bại", err.message, [{ text: "OK" }]);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!email || !newPassword || !confirmPassword) {
      Alert.alert("Thông tin không hợp lệ", "Vui lòng nhập đầy đủ thông tin.", [{ text: "OK" }]);
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mật khẩu không khớp", "Vui lòng thử lại.", [{ text: "OK" }]);
      return;
    }
    setIsLoading(true);
    const success = await requestReset(email, newPassword);
    setIsLoading(false);
    
    if (success) {
      setStep(2);
      setCountdown(120);
      setTimeout(() => inputsRef.current[0]?.focus(), 400);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) inputsRef.current[index + 1]?.focus();
    if (newOtp.every((d) => d !== '') && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
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

  const handleVerifyOtp = async (code: string) => {
    if (countdown === 0) return;
    const success = await verifyReset(email, code);
    if (success) {
      Alert.alert('Đổi mật khẩu thành công', 'Vui lòng đăng nhập lại.');
      onTypeSuccess();
      onClose();
    } else {
      setOtp(Array(6).fill(''));
      inputsRef.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (isResending) return;
    
    setIsResending(true);
    const success = await requestReset(email, newPassword);
    setIsResending(false);
    
    if (success) {
      setOtp(Array(6).fill(''));
      setCountdown(120);
      inputsRef.current[0]?.focus();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          
          <TouchableOpacity style={styles.closeIconButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <MaterialCommunityIcons 
              name={step === 1 ? "lock-reset" : "shield-check-outline"} 
              size={30} 
              color="#3B82F6" 
            />
          </View>

          <Text style={styles.title}>{step === 1 ? 'Quên mật khẩu' : 'Nhập mã xác thực'}</Text>

          {step === 1 ? (
            <View style={{ width: '100%' }}>
              <Text style={styles.desc}>Nhập email và mật khẩu mới để khôi phục tài khoản.</Text>
              
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
                  placeholder="Mật khẩu mới"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-check-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập lại mật khẩu mới"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <MaterialCommunityIcons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.btnPrimary} onPress={handleSendRequest} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : (
                  <View style={styles.buttonInner}>
                    <Text style={styles.btnText}>Tiếp tục</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ width: '100%', alignItems: 'center' }}>
              <Text style={styles.desc}>
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
                    onChangeText={(t) => handleOtpChange(t, i)}
                    onKeyPress={(e) => handleKeyPress(e, i)}
                  />
                ))}
              </View>

              <Text style={countdown > 0 ? styles.countdown : styles.expiredLabel}>
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
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 28,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
    position: 'relative',
  },
  closeIconButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 5,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 10,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1E293B',
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonInner: { flexDirection: 'row', alignItems: 'center' },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 5,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 15,
  },
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
  countdown: { color: '#64748B', fontSize: 13, marginBottom: 10 },
  expiredLabel: { color: '#EF4444', fontSize: 13, marginBottom: 10, fontWeight: '600' },
  resendWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  resendLabel: { color: '#64748B', fontSize: 13 },
  resendText: { color: '#3B82F6', fontWeight: 'bold', fontSize: 13 },
});