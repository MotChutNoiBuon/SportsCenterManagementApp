import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons } from 'react-native-vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../api/apiConfig';
import { theme } from '../../styles';

const UserManagementScreen = ({ navigation }) => {
  // State
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    role: 'member',
    password: '',
    confirm_password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Danh sách role
  const roles = [
    { id: 'all', name: 'Tất cả' },
    { id: 'member', name: 'Hội viên' },
    { id: 'trainer', name: 'Huấn luyện viên' },
    { id: 'receptionist', name: 'Lễ tân' },
    { id: 'admin', name: 'Quản trị viên' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      filterUsers();
    }
  }, [searchQuery, selectedRole, users]);

  useEffect(() => {
    // Reset form khi mở modal với user mới
    if (isModalVisible) {
      if (selectedUser) {
        // Điền thông tin của user được chọn
        setFormData({
          username: selectedUser.username || '',
          full_name: selectedUser.full_name || '',
          email: selectedUser.email || '',
          phone: selectedUser.phone || '',
          role: selectedUser.role || 'member',
          password: '',
          confirm_password: '',
        });
      } else {
        // Reset form khi thêm mới
        setFormData({
          username: '',
          full_name: '',
          email: '',
          phone: '',
          role: 'member',
          password: '',
          confirm_password: '',
        });
      }
      setFormErrors({});
    }
  }, [isModalVisible, selectedUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.users}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Mã thực tế sẽ xử lý dữ liệu từ API
      if (response.data) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      } else {
        // Dữ liệu mẫu
        const mockUsers = generateMockUsers();
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      // Dữ liệu mẫu khi có lỗi
      const mockUsers = generateMockUsers();
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateMockUsers = () => {
    return [
      {
        id: 1,
        username: 'nguyenvana',
        full_name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phone: '0901234567',
        role: 'member',
        active: true,
        avatar: 'https://i.pravatar.cc/150?img=1',
        created_date: '2023-01-15T08:30:00Z',
      },
      {
        id: 2,
        username: 'tranthib',
        full_name: 'Trần Thị B',
        email: 'tranthib@example.com',
        phone: '0912345678',
        role: 'trainer',
        active: true,
        avatar: 'https://i.pravatar.cc/150?img=2',
        created_date: '2023-02-20T10:15:00Z',
      },
      {
        id: 3,
        username: 'levanc',
        full_name: 'Lê Văn C',
        email: 'levanc@example.com',
        phone: '0923456789',
        role: 'receptionist',
        active: true,
        avatar: 'https://i.pravatar.cc/150?img=3',
        created_date: '2023-03-10T14:45:00Z',
      },
      {
        id: 4,
        username: 'phamthid',
        full_name: 'Phạm Thị D',
        email: 'phamthid@example.com',
        phone: '0934567890',
        role: 'admin',
        active: true,
        avatar: 'https://i.pravatar.cc/150?img=4',
        created_date: '2023-01-05T09:20:00Z',
      },
      {
        id: 5,
        username: 'hoangvane',
        full_name: 'Hoàng Văn E',
        email: 'hoangvane@example.com',
        phone: '0945678901',
        role: 'member',
        active: false,
        avatar: 'https://i.pravatar.cc/150?img=5',
        created_date: '2023-04-25T11:30:00Z',
      }
    ];
  };

  const filterUsers = () => {
    let filtered = [...users];
    
    // Lọc theo vai trò
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    
    // Lọc theo từ khoá tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(query) ||
        user.full_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.includes(query)
      );
    }
    
    setFilteredUsers(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalVisible(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const handleDeleteUser = (user) => {
    Alert.alert(
      'Xác nhận xoá',
      `Bạn có chắc chắn muốn xoá người dùng "${user.full_name}" không?`,
      [
        {
          text: 'Huỷ',
          style: 'cancel'
        },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: () => confirmDeleteUser(user)
        }
      ]
    );
  };

  const confirmDeleteUser = async (user) => {
    try {
      // API call sẽ được thực hiện ở đây
      // Trong ví dụ này, chúng ta chỉ cập nhật state local
      const updatedUsers = users.filter(item => item.id !== user.id);
      setUsers(updatedUsers);
      
      Alert.alert('Thành công', `Đã xoá người dùng "${user.full_name}"`);
    } catch (error) {
      console.error('Lỗi khi xoá người dùng:', error);
      Alert.alert('Lỗi', 'Không thể xoá người dùng. Vui lòng thử lại sau.');
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      // API call sẽ được thực hiện ở đây
      // Trong ví dụ này, chúng ta chỉ cập nhật state local
      const updatedUsers = users.map(item => {
        if (item.id === user.id) {
          return { ...item, active: !item.active };
        }
        return item;
      });
      
      setUsers(updatedUsers);
      
      Alert.alert(
        'Thành công', 
        `Đã ${!user.active ? 'kích hoạt' : 'vô hiệu hoá'} tài khoản "${user.full_name}"`
      );
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái người dùng:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái người dùng. Vui lòng thử lại sau.');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username) {
      errors.username = 'Tên đăng nhập không được để trống';
    } else if (formData.username.length < 3) {
      errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }
    
    if (!formData.full_name) {
      errors.full_name = 'Họ tên không được để trống';
    }
    
    if (!formData.email) {
      errors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (!formData.phone) {
      errors.phone = 'Số điện thoại không được để trống';
    } else if (!/^0\d{9}$/.test(formData.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có 10 chữ số)';
    }
    
    if (!selectedUser) {
      // Chỉ kiểm tra mật khẩu khi thêm mới
      if (!formData.password) {
        errors.password = 'Mật khẩu không được để trống';
      } else if (formData.password.length < 6) {
        errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
      
      if (formData.password !== formData.confirm_password) {
        errors.confirm_password = 'Xác nhận mật khẩu không khớp';
      }
    } else if (formData.password && formData.password.length < 6) {
      // Khi sửa, nếu có nhập mật khẩu thì phải hợp lệ
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (formData.password && formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Xác nhận mật khẩu không khớp';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setFormSubmitting(true);
      
      // API call sẽ được thực hiện ở đây
      // Trong demo này, chúng ta chỉ cập nhật state local
      
      let updatedUsers;
      if (selectedUser) {
        // Cập nhật người dùng
        const updatedData = {
          username: formData.username,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        };
        
        if (formData.password) {
          updatedData.password = formData.password;
        }
        
        updatedUsers = users.map(user => {
          if (user.id === selectedUser.id) {
            return { ...user, ...updatedData };
          }
          return user;
        });
        
        Alert.alert('Thành công', `Đã cập nhật thông tin người dùng "${formData.full_name}"`);
      } else {
        // Thêm người dùng mới
        const newUser = {
          id: Math.max(...users.map(u => u.id), 0) + 1,
          username: formData.username,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          created_date: new Date().toISOString(),
          active: true,
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
        };
        
        updatedUsers = [...users, newUser];
        Alert.alert('Thành công', `Đã thêm người dùng "${formData.full_name}"`);
      }
      
      setUsers(updatedUsers);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Lỗi khi lưu thông tin người dùng:', error);
      Alert.alert('Lỗi', 'Không thể lưu thông tin người dùng. Vui lòng thử lại sau.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const renderUserItem = ({ item }) => {
    const getRoleIcon = (role) => {
      switch (role) {
        case 'admin':
          return <FontAwesome5 name="user-shield" size={16} color="#E53935" />;
        case 'trainer':
          return <FontAwesome5 name="user-tie" size={16} color="#1976D2" />;
        case 'receptionist':
          return <FontAwesome5 name="user-check" size={16} color="#7B1FA2" />;
        case 'member':
          return <FontAwesome5 name="user" size={16} color="#388E3C" />;
        default:
          return <FontAwesome5 name="user" size={16} color="#757575" />;
      }
    };
    
    const getRoleName = (role) => {
      switch (role) {
        case 'admin':
          return 'Quản trị viên';
        case 'trainer':
          return 'Huấn luyện viên';
        case 'receptionist':
          return 'Lễ tân';
        case 'member':
          return 'Hội viên';
        default:
          return 'Người dùng';
      }
    };
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    };

    return (
      <View style={[styles.userCard, !item.active && styles.inactiveCard]}>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }} 
              style={styles.avatar}
            />
            
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{item.full_name}</Text>
              <View style={styles.usernameContainer}>
                <Text style={styles.userUsername}>@{item.username}</Text>
                {!item.active && (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Vô hiệu hoá</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.roleContainer}>
            {getRoleIcon(item.role)}
            <Text style={styles.roleText}>{getRoleName(item.role)}</Text>
          </View>
        </View>
        
        <View style={styles.userDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.email}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.phone}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>Tham gia: {formatDate(item.created_date)}</Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditUser(item)}
          >
            <Ionicons name="pencil" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Sửa</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, item.active ? styles.disableButton : styles.enableButton]}
            onPress={() => toggleUserStatus(item)}
          >
            <Ionicons name={item.active ? "close-circle" : "checkmark-circle"} size={16} color="#fff" />
            <Text style={styles.actionButtonText}>{item.active ? 'Vô hiệu' : 'Kích hoạt'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteUser(item)}
          >
            <Ionicons name="trash" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Xoá</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderUserForm = () => {
    return (
      <ScrollView style={styles.formContainer}>
        <Text style={styles.formTitle}>
          {selectedUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        </Text>
        
        {/* Trường tên đăng nhập */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Tên đăng nhập</Text>
          <TextInput
            style={[styles.formInput, formErrors.username && styles.formInputError]}
            value={formData.username}
            onChangeText={(text) => setFormData({...formData, username: text})}
            placeholder="VD: nguyenvana"
            autoCapitalize="none"
            editable={!selectedUser} // Không cho phép sửa tên đăng nhập khi cập nhật
          />
          {formErrors.username && (
            <Text style={styles.errorText}>{formErrors.username}</Text>
          )}
        </View>
        
        {/* Trường họ tên */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Họ và tên</Text>
          <TextInput
            style={[styles.formInput, formErrors.full_name && styles.formInputError]}
            value={formData.full_name}
            onChangeText={(text) => setFormData({...formData, full_name: text})}
            placeholder="VD: Nguyễn Văn A"
          />
          {formErrors.full_name && (
            <Text style={styles.errorText}>{formErrors.full_name}</Text>
          )}
        </View>
        
        {/* Trường email */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Email</Text>
          <TextInput
            style={[styles.formInput, formErrors.email && styles.formInputError]}
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            placeholder="VD: nguyenvana@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {formErrors.email && (
            <Text style={styles.errorText}>{formErrors.email}</Text>
          )}
        </View>
        
        {/* Trường số điện thoại */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Số điện thoại</Text>
          <TextInput
            style={[styles.formInput, formErrors.phone && styles.formInputError]}
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            placeholder="VD: 0901234567"
            keyboardType="phone-pad"
          />
          {formErrors.phone && (
            <Text style={styles.errorText}>{formErrors.phone}</Text>
          )}
        </View>
        
        {/* Trường vai trò */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Vai trò</Text>
          <View style={styles.roleButtons}>
            {roles.filter(r => r.id !== 'all').map(role => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleButton,
                  formData.role === role.id && styles.roleButtonSelected
                ]}
                onPress={() => setFormData({...formData, role: role.id})}
              >
                <Text 
                  style={[
                    styles.roleButtonText,
                    formData.role === role.id && styles.roleButtonTextSelected
                  ]}
                >
                  {role.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Trường mật khẩu */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>
            {selectedUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
          </Text>
          <TextInput
            style={[styles.formInput, formErrors.password && styles.formInputError]}
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
            placeholder={selectedUser ? "••••••" : "Nhập mật khẩu"}
            secureTextEntry
          />
          {formErrors.password && (
            <Text style={styles.errorText}>{formErrors.password}</Text>
          )}
        </View>
        
        {/* Trường xác nhận mật khẩu */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Xác nhận mật khẩu</Text>
          <TextInput
            style={[styles.formInput, formErrors.confirm_password && styles.formInputError]}
            value={formData.confirm_password}
            onChangeText={(text) => setFormData({...formData, confirm_password: text})}
            placeholder="Nhập lại mật khẩu"
            secureTextEntry
          />
          {formErrors.confirm_password && (
            <Text style={styles.errorText}>{formErrors.confirm_password}</Text>
          )}
        </View>
        
        <View style={styles.formButtons}>
          <TouchableOpacity 
            style={[styles.formButton, styles.cancelFormButton]}
            onPress={() => setIsModalVisible(false)}
            disabled={formSubmitting}
          >
            <Text style={styles.cancelFormButtonText}>Huỷ bỏ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.formButton, 
              styles.saveFormButton,
              formSubmitting && styles.disabledButton
            ]}
            onPress={handleFormSubmit}
            disabled={formSubmitting}
          >
            {formSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveFormButtonText}>Lưu</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý người dùng</Text>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm người dùng..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.roleFilterContainer}
        >
          {roles.map(role => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleFilterButton,
                selectedRole === role.id && styles.selectedRoleButton
              ]}
              onPress={() => setSelectedRole(role.id)}
            >
              <Text 
                style={[
                  styles.roleFilterText,
                  selectedRole === role.id && styles.selectedRoleText
                ]}
              >
                {role.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.content}>
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="users-slash" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Không tìm thấy người dùng nào</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRefresh}
            >
              <Text style={styles.refreshButtonText}>Làm mới</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddUser}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
      
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            
            {renderUserForm()}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  roleFilterContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  roleFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
  },
  selectedRoleButton: {
    backgroundColor: theme.colors.primary,
  },
  roleFilterText: {
    fontSize: 14,
    color: '#555',
  },
  selectedRoleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Để tạo khoảng cách cho nút thêm
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inactiveCard: {
    opacity: 0.7,
    backgroundColor: '#f8f8f8',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userUsername: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleText: {
    fontSize: 12,
    color: '#555',
    marginLeft: 4,
  },
  userDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  disableButton: {
    backgroundColor: '#FF9800',
  },
  enableButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  refreshButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  formContainer: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  formInputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  roleButtonSelected: {
    backgroundColor: theme.colors.primary,
  },
  roleButtonText: {
    fontSize: 14,
    color: '#555',
  },
  roleButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelFormButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  saveFormButton: {
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  cancelFormButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveFormButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserManagementScreen; 