import { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, Image, StyleSheet, View, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { doc, getDoc, query, collection, onSnapshot, orderBy, addDoc, serverTimestamp} from 'firebase/firestore';
import { auth, db } from '../Firebase';
import Header from '../Components/Header';

export default function Detail() {

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState([]);
  const [commentInput, setCommentInput] = useState('');

  const user = auth.currentUser;

  // 불러올 해당 게시글 (훅 사용)
  const { postId } = useRoute().params;

  useEffect(() => {
    async function fetchPost() {
      try {
        const docRef = doc(db, 'posts', postId);

        //내장 함수로 게시글 가져오기
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPost(docSnap.data());
        } else {
          console.log('게시글이 존재하지 않습니다.');
        }
      } catch (error) {
        console.error('게시글 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [postId]);

  // 댓글 불러오기
  useEffect(() => {
        const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data()}));
            setComment(list);
        });
        return () => unsubscribe();
    }, []);

  // 댓글 추가 함수
  async function handleAddComment() {
    if (!commentInput.trim()) {
      Alert.alert('댓글을 입력해주세요.');
      return;
    }
    await addDoc(collection(db, 'posts', postId, 'comments'), {
        text: commentInput,
        createdAt: serverTimestamp(),
        author: user.displayName,
    });
    setCommentInput('');
    }

    // 사용자에게 댓글 등록 여부를 확인하는 함수
    function handleAddCommentWithAlert() {
        Alert.alert('댓글 등록', '댓글을 등록하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            { text: '등록', onPress: handleAddComment },
        ],
        { cancelable: true }
    );
    }

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text>게시글을 불러올 수 없습니다.</Text>
      </View>
    );
  }

  return (
     <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // iOS / Android 대응
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} 
    >
         <Header title="게시글 상세" iconName="document-text-outline" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.postContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>제목: {post.title}</Text>
            <Text style={styles.author}>작성자: {post.author}</Text>
          </View>
          <View>
            <Text style={styles.content}>{post.content}</Text>
            <Text style={styles.date}>
              작성일: {post.createdAt
                ? post.createdAt.toDate().toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '날짜 없음'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 15 }}>
            {post.images?.map((uri, index) =>
              uri ? (
                <Image key={index} source={{ uri }} style={styles.image} resizeMode="cover" />
              ) : null
            )}
          </View>
        </View>

        {comment.map((commentItem) => (
          <View key={commentItem.id} style={styles.commentBox}>
            <Text style={styles.commentAuthor}>{commentItem.author}</Text>
            <Text style={styles.commentText}>{commentItem.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.commentInputContainer}>
        <TextInput placeholder='댓글 작성란' style={styles.input} value={commentInput} onChangeText={setCommentInput}/>
        <TouchableOpacity style={styles.submitButton} onPress={handleAddCommentWithAlert}>
          <Text style={styles.submitButtonText}>등록</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContainer: {
  padding: 20,
  backgroundColor: '#fff',
  borderBottomWidth: 1,
  borderBottomColor: '#e0e0e0',
},
header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',

  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  titleContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginVertical: 16,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  commentBox: {
    backgroundColor: '#f7f7f7ff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    alignSelf: 'flex-start', // 너비가 텍스트 길이에 맞게 됨
    maxWidth: '80%',
    marginLeft: 20,
  },
  commentAuthor: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#555',
  },
 commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#F9F9F9',
    marginRight: 10,
    marginBottom: 5,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
