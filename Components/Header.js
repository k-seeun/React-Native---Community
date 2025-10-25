import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Header({ title, iconName, onRightPress, showLogout }) {
  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
      {iconName && <Ionicons name={iconName} size={24} color="#fff" />}
      <Text style={styles.headerTitle}> {title}</Text>
      </View>
      {showLogout && onRightPress && (
        <TouchableOpacity onPress={onRightPress}>
          <Text style={styles.logoutButton}>로그아웃</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'black',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  logoutButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
