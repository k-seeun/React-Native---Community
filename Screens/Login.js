import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView, Platform, ScrollView, View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Firebase';

export default function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();

  async function handleLogin() {
    try {
      // Firebase에서 제공하는 내장 로그인 함수 사용
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const name = user.displayName;

      Alert.alert('로그인 성공', `${name} 님, 환영합니다!`);
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('로그인 실패', error.message);
    }
  }

  return (
    <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
   <TextInput
    placeholder="이메일"
    value={email}
    onChangeText={setEmail}
    style={styles.input}
    keyboardType="email-address"
  />
  <TextInput
    placeholder="비밀번호"
    value={password}
    onChangeText={setPassword}
    secureTextEntry
    style={styles.input}
  />
  <View style={styles.buttonContainer}>
    <Button title="로그인" onPress={handleLogin} />
  </View>
  <View style={styles.signupButton}>
  <Text style={styles.buttonText}>아직 계정이 없으신가요?</Text>
  <Button title="회원가입" onPress={() => navigation.navigate('Signup')} color="#007AFF" />
  </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f9f9f9', // 전체 배경
  },
  contentContainer: {
    padding: 20,
    justifyContent: 'center', // 세로 가운데 정렬
    flexGrow: 1, // ScrollView가 충분히 차도록
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginVertical: 8,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    gap: 10,
  },
  buttonText: {
    fontSize: 14,
    color: '#555',
  }
});
