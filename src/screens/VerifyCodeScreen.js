import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import BackArrow from '../components/BackArrow';
import Logo from '../components/Logo';

const RESEND_TIMEOUT = 30; // 30 seconds
const CODE_LENGTH = 6;

const VerifyCodeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(RESEND_TIMEOUT);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timer, isTimerRunning]);

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text.length === 1 && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResendCode = () => {
    // TODO: Implement resend code logic
    setTimer(RESEND_TIMEOUT);
    setIsTimerRunning(true);
    console.log('Resending code to:', email);
  };

  const handleVerifyCode = () => {
    const verificationCode = code.join('');
    // TODO: Implement verification logic
    console.log('Verifying code:', verificationCode);
    // For now, just navigate to home
    navigation.replace('Main');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <BackArrow />
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Logo width={200} height={80} />
      </View>

      <Text style={styles.title}>Create Your Account</Text>

      <View style={styles.emailContainer}>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.codeInput}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      <View style={styles.resendContainer}>
        <TouchableOpacity
          onPress={handleResendCode}
          disabled={isTimerRunning}
          style={styles.resendButton}>
          <Text
            style={[
              styles.resendText,
              isTimerRunning && styles.resendTextDisabled,
            ]}>
            Resend Code{' '}
            {isTimerRunning && (
              <Text style={styles.timerText}>{timer.toString().padStart(2, '0')} sec</Text>
            )}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.verifyButton,
          code.every((digit) => digit) && styles.verifyButtonActive,
        ]}
        onPress={handleVerifyCode}
        disabled={!code.every((digit) => digit)}>
        <Text style={styles.verifyButtonText}>Verify Welcome Code</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  emailContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  email: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  codeInput: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    fontSize: 20,
    textAlign: 'center',
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resendButton: {
    padding: 8,
  },
  resendText: {
    fontSize: 14,
    color: '#F4821F',
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: '#666666',
  },
  timerText: {
    color: '#666666',
    fontWeight: 'normal',
  },
  verifyButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 15,
    borderRadius: 8,
  },
  verifyButtonActive: {
    backgroundColor: '#F4821F',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default VerifyCodeScreen; 