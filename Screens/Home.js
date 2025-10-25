import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { query, collection, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../Firebase';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from '../Components/Header';

export default function Home() {

  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const navigation = useNavigation();

  function goToWrite() {
    navigation.navigate('Write');
  }

  // Fifebase 로그인 상태 구독 관리
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    // 구독 해제 (로그인 상태 감시X)
    return () => unsubscribe();
    }, []);

  // 게시글 불러오기
  useEffect(() => {
    const q= query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

    // 실시간 업데이트 구독 onSnapshot
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsArray = querySnapshot.docs.map(doc => ({
         id: doc.id, ...doc.data() 
        }));
        setPosts(postsArray);
      });
    // 구독 해제 (게시글 업데이트X)
    return () => unsubscribe();
  }, []);

  // 로그아웃 함수
  async function handleLogout() {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '로그아웃', onPress: async () => {
          try {
            // 내장 로그아웃 함수 사용
            await signOut(auth);
            navigation.replace('Login');
          } catch (error) {
            Alert.alert('로그아웃 실패', error.message);
            console.log('로그아웃 실패', error.message);
          }
        },
      },
      ],
      { cancelable: true }
    )
  }

    // Firestore에서 게시글을 삭제하는 함수
    async function deletePost(postId) {
        try {
            // 문서 삭제하는 내장 함수 사용 (onSnapshot이 실시간으로 변경을 감지 -> setPosts 필요X)
            await deleteDoc(doc(db, 'posts', postId));
        } catch (error) {
            console.error("게시글 삭제 오류: ", error);
            Alert.alert('오류', '게시글을 삭제하는 중 문제가 발생했습니다.');
        }
    }

    // 사용자에게 삭제 여부를 확인하는 함수
    function confirmDelete(postId) {
      Alert.alert('게시글 삭제', '해당 게시글을 삭제하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        { text: '삭제', onPress: () => deletePost(postId), style: 'destructive' },
      ]);
    }


  return (
   <View style={styles.container}>
    <Header title="게시글" iconName="document-text-outline" showLogout={true} onRightPress={handleLogout}/>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {posts.map((post) => (
          <TouchableOpacity
            key={post.id}
            style={styles.postCard}
            onPress={() => navigation.navigate('Detail', { postId: post.id })}
          >
            <Text style={styles.postTitle} numberOfLines={1}>
              {post.title}
            </Text>
            {currentUser && post.uid === currentUser.uid && (
            <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(post.id)}>
             <Text style={styles.deleteButtonText}>삭제</Text>
            </TouchableOpacity>
            )}
            <Text style={styles.postAuthor}>{post.author}</Text>
            <Text style={styles.postDate}>
              {post.createdAt
                ? post.createdAt.toDate().toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '등록일 없음'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.floatingButton} onPress={goToWrite}>
      <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  postCard: {
     position: 'relative',
    backgroundColor: '#f5f5f5ff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  deleteButton: {
  position: 'absolute',
  top: 15,
  right: 15,
  borderColor: '#FF3B30', 
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 5,
  zIndex: 10,
},

deleteButtonText: {
  color: '#FF3B30',
  fontWeight: 'bold',
  fontSize: 14,
},

  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  postAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  postDate: {
    fontSize: 12,
    color: '#999',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButtonImage: {
    width: 28,
    height: 28,
    tintColor: '#fff',
  },
});
