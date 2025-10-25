import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../Firebase';

export default function Signup() {

  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [Name, setName] = useState('');

  const navigation = useNavigation();

  const handleSignup = async () => {
    try {
      // Firebase에서 제공하는 내장 회원가입 함수 사용
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 사용자의 displayName 업데이트
      await updateProfile(user, {
        displayName: id,
      });

      // Firebase에 사용자 정보 저장
      await setDoc(doc(db, 'users', user.uid), {
        Name: Name,
        createdAt: serverTimestamp(),
      });

      Alert.alert('Signup Successful', '회원가입 성공!');
      navigation.navigate('Login');
    } catch (error) {
      if (error.code === 'auth/weak-password') {
        Alert.alert('Error', '비밀번호는 최소 6자 이상이어야 합니다.');
      } else if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', '이미 사용 중인 이메일입니다. 로그인해 주세요.');
      } else {
        Alert.alert('Signup Failed', error.message);
      }
    }
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <TextInput
        placeholder="이름"
        value={Name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="닉네임"
        value={id}
        onChangeText={setId}
        style={styles.input}
      />
      <TextInput
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <View style={styles.buttonContainer}>
        <Button title="회원가입" onPress={handleSignup} />
      </View>
      <View style={styles.loginPrompt}>
        <Text style={styles.promptText}>이미 계정이 있으신가요?</Text>
        <Button title="로그인" onPress={() => navigation.navigate('Login')} color="#007AFF" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  contentContainer: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1,
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
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  promptText: {
    fontSize: 14,
    color: '#555',
    marginRight: 8,
  },
});
