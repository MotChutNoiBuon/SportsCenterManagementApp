import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { logout } from '../../api/authService';
import { getUserProfile, updateUserProfile } from '../../api/userService';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await getUserProfile();
      setUser(userData);
      setEditedUser(userData);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      setLoadingSubmit(true);
      const updatedUser = await updateUserProfile(editedUser);
      setUser(updatedUser);
      setEditing(false);
      Alert.alert('Thành công', 'Thông tin đã được cập nhật');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin. Vui lòng thử lại sau.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại sau.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: user.photo }} style={styles.profileImage} />
            {!editing && (
              <TouchableOpacity style={styles.editPhotoButton}>
                <Icon name="photo-camera" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.membershipBadge}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.membershipText}>{user.membershipTier}</Text>
          </View>
          <Text style={styles.memberSince}>Thành viên từ: {user.memberSince}</Text>

          {!editing && (
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Icon name="edit" size={16} color="white" />
              <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
            </TouchableOpacity>
          )}
        </View>

        {!editing && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.stats.totalClasses}</Text>
              <Text style={styles.statLabel}>Tổng lớp học</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.stats.attendedClasses}</Text>
              <Text style={styles.statLabel}>Lớp đã tham gia</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.stats.upcomingClasses}</Text>
              <Text style={styles.statLabel}>Lớp sắp tới</Text>
            </View>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>
            {editing ? 'Chỉnh sửa thông tin cá nhân' : 'Thông tin cá nhân'}
          </Text>

          <View style={styles.infoItem}>
            <Icon name="person" size={20} color="#4A90E2" style={styles.infoIcon} />
            {editing ? (
              <TextInput
                style={styles.input}
                value={editedUser.name}
                onChangeText={(text) => setEditedUser({ ...editedUser, name: text })}
                placeholder="Họ và tên"
              />
            ) : (
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Họ và tên</Text>
                <Text style={styles.infoText}>{user.name}</Text>
              </View>
            )}
          </View>

          <View style={styles.infoItem}>
            <Icon name="email" size={20} color="#4A90E2" style={styles.infoIcon} />
            {editing ? (
              <TextInput
                style={styles.input}
                value={editedUser.email}
                onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
                placeholder="Email"
                keyboardType="email-address"
              />
            ) : (
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoText}>{user.email}</Text>
              </View>
            )}
          </View>

          <View style={styles.infoItem}>
            <Icon name="phone" size={20} color="#4A90E2" style={styles.infoIcon} />
            {editing ? (
              <TextInput
                style={styles.input}
                value={editedUser.phone}
                onChangeText={(text) => setEditedUser({ ...editedUser, phone: text })}
                placeholder="Số điện thoại"
                keyboardType="phone-pad"
              />
            ) : (
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoText}>{user.phone}</Text>
              </View>
            )}
          </View>

          <View style={styles.infoItem}>
            <Icon name="location-on" size={20} color="#4A90E2" style={styles.infoIcon} />
            {editing ? (
              <TextInput
                style={styles.input}
                value={editedUser.address}
                onChangeText={(text) => setEditedUser({ ...editedUser, address: text })}
                placeholder="Địa chỉ"
                multiline
              />
            ) : (
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Địa chỉ</Text>
                <Text style={styles.infoText}>{user.address}</Text>
              </View>
            )}
          </View>

          {editing && (
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={[styles.saveButton, loadingSubmit && styles.disabledButton]}
                onPress={handleSave}
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>

          <View style={styles.settingItem}>
            <Icon name="notifications" size={20} color="#4A90E2" style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>Thông báo</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: '#4A90E2' }}
              thumbColor={notifications ? '#fff' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <Icon name="lock" size={20} color="#4A90E2" style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>Đổi mật khẩu</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Icon name="help" size={20} color="#4A90E2" style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>Trợ giúp & Hỗ trợ</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Icon name="info" size={20} color="#4A90E2" style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>Về chúng tôi</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" size={20} color="#FF6B6B" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#4A90E2',
  },
  editPhotoButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#4A90E2',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  membershipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 5,
  },
  memberSince: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginLeft: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  separator: {
    width: 1,
    backgroundColor: '#eee',
    height: '100%',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  settingsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  infoIcon: {
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 3,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    padding: 0,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  disabledButton: {
    backgroundColor: '#a0c8f0',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  settingIcon: {
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingText: {
    fontSize: 15,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: '#fff5f5',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
});

export default ProfileScreen;
