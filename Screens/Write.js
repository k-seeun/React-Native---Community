import {useState} from 'react';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, View, Text, StyleSheet, TextInput, Alert, Image, Linking, TouchableOpacity } from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../Firebase';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function WriteScreen() {

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState([]);

  const navigation = useNavigation();

  const user = auth.currentUser;

  // 갤러리 접근 권한 요청 함수
  async function pickImage() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
     if (!permissionResult.granted) {
       Alert.alert(
        '권한 필요',
        '사진 접근 권한이 필요합니다.',
    [
      { text: '취소', style: 'cancel' },
      { text: '설정 열기', onPress: () => Linking.openSettings() },
    ]
  );
  return;
}
    // 갤러리 열기
    const result = await ImagePicker.launchImageLibraryAsync({
     mediaTypes: ImagePicker.MediaTypeOptions.Images, // 이미지 선택만 허용
     quality: 1,
});
    if (!result.canceled) {
      setImageUri(prev => [...prev, result.assets[0].uri]);
    }
  }

  // 이미지 삭제 함수
  function deleteImage(uriToDelete) {
    Alert.alert(
        '이미지 삭제',
        '이미지를 삭제하시겠습니까?',
        [
            { text: '취소', style: 'cancel' },
            { text: '삭제', onPress: () =>setImageUri(prev => prev.filter(uri => uri !== uriToDelete)) },
        ]
    );
  }

  // 이미지 업로드 & URL 반환 함수
  async function uploadImage(uri) {
    try {
      // 이진 데이터로 변환
      const response = await fetch(uri);
      const blob = await response.blob();

      // 파일 이름 추출 후 저장 경로 지정
      const fileName = uri.split('/').pop();
      const storageRef = ref(storage, `posts/${fileName}`);

      // 내장 함수 사용해 이미지 업로드
      const snapshot = await uploadBytes(storageRef, blob);
      // 내장 함수 사용해 URL 반환
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
     Alert.alert('이미지 업로드 실패', error.message);
      return null;
    }
  }

  // 게시글 등록 함수
  async function submitPost() {
    if (!title.trim() || !content.trim()) {
      return Alert.alert('제목과 내용을 모두 입력해주세요.');
    }

    try {
      // 병렬 처리로 이미지 업로드, null 제거
      const validUrls = (await Promise.all(imageUri.map(uploadImage))).filter(Boolean);

      await addDoc(collection(db, 'posts'), {
        uid: user.uid,
        author: user.displayName,
        title,
        content,
        images: validUrls,
        createdAt: serverTimestamp(),
      });

      Alert.alert('게시글이 등록되었습니다.');
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('게시글 등록 실패', error.message);
    }
  }

  return (
     <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Ionicons name="pencil-outline" size={25} color="#fa8805ff" />
        <Text style={styles.text}> 작성 페이지</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput style={[styles.input , styles.titleInput]}
        placeholder="제목을 입력하세요" 
        value={title} 
        onChangeText={setTitle}
        />
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
       <Text style={styles.imageButtonText}>사진 첨부</Text>
       </TouchableOpacity>
        </View>
        <View>
        <TextInput style={[styles.input, styles.contentInput]}
        placeholder="내용을 입력하세요" 
        multiline={true} 
        value={content} 
        onChangeText={setContent}
        />
        </View>

         <View style={styles.imageWrapper}>
        {imageUri.length > 0 ? (
            imageUri.map((uri, index) => (
            <View key={index}>
                <Image source={{ uri: uri }} style={styles.image} />
                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteImage(uri)}>
                    <Text style={styles.deleteButtonText}>X</Text>
                </TouchableOpacity>
            </View>
            ))
        ) : (
            <Text>이미지가 없습니다.</Text>
        )}
    </View>

    <TouchableOpacity style={styles.submitButton} onPress={submitPost}>
        <Text style={styles.submitButtonText}>등록</Text>
    </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
    inputContainer: {
        flexDirection: 'row',
  alignItems: 'center',  // 세로로 가운데 정렬
  justifyContent: 'space-between',
    },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
    titleInput: {
    flex: 1,  // 가능한 공간 다 쓰게 하기 (버튼 뺀 나머지)
  marginRight: 10,
  },
   contentInput: {
    height: 200, // 원하는 큰 크기
  },
    imageWrapper: {
   flexDirection: 'row',  // 가로로 나열
  flexWrap: 'wrap',      // 공간이 부족하면 다음 줄로 넘김 (선택사항)
  gap: 10, 
  },
    image: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
   imageButton: {
  backgroundColor: '#2196F3',
  paddingVertical: 8,
  paddingHorizontal: 15,
  borderRadius: 5,
  alignSelf: 'flex-start', // 버튼 크기 딱 맞게
},
imageButtonText: {
  color: 'white',
  fontSize: 16,
  textAlign: 'center',
},

   deleteButton: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'red',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 18,
  },
  submitButton: {
  backgroundColor: '#2196F3', 
  paddingVertical: 12,
  paddingHorizontal: 20,    
  borderRadius: 8,            
  alignItems: 'center',      
  marginTop: 20,              
  shadowColor: '#000',         // 그림자 (iOS)
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 3,
},

submitButtonText: {
  color: '#fff',               // 흰색 글씨
  fontSize: 18,                // 글자 크기
  fontWeight: 'bold',
},

});
