import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data - In a real app, this would come from an API or Firebase
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotifications([
        {
          id: '1',
          title: 'Lớp học sắp bắt đầu',
          message: 'Lớp Yoga của bạn sẽ bắt đầu trong 30 phút nữa.',
          time: '10:30 AM',
          date: '15/10/2023',
          read: false,
          type: 'class',
        },
        {
          id: '2',
          title: 'Thanh toán thành công',
          message: 'Gói tập 3 tháng của bạn đã được thanh toán thành công.',
          time: '2:45 PM',
          date: '14/10/2023',
          read: true,
          type: 'payment',
        },
        {
          id: '3',
          title: 'Đánh giá huấn luyện viên',
          message: 'Hãy đánh giá buổi tập với HLV Nguyễn Văn A',
          time: '6:20 PM',
          date: '13/10/2023',
          read: false,
          type: 'feedback',
        },
        {
          id: '4',
          title: 'Khuyến mãi mới',
          message: 'Giảm 20% cho gói tập 6 tháng khi đăng ký trong tuần này.',
          time: '9:00 AM',
          date: '12/10/2023',
          read: true,
          type: 'promotion',
        },
        {
          id: '5',
          title: 'Thay đổi lịch tập',
          message: 'Lớp Zumba vào thứ 5 đã được dời sang 18:00',
          time: '3:15 PM',
          date: '11/10/2023',
          read: false,
          type: 'schedule',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'class':
        return 'fitness-center';
      case 'payment':
        return 'payment';
      case 'feedback':
        return 'rate-review';
      case 'promotion':
        return 'local-offer';
      case 'schedule':
        return 'event';
      default:
        return 'notifications';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, item.read ? styles.readItem : styles.unreadItem]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.iconContainer}>
        <Icon name={getIconForType(item.type)} size={24} color="#4A90E2" />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}
      >
        <Icon name="delete-outline" size={20} color="#999" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải thông báo...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        {notifications.some((n) => !n.read) && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Đánh dấu tất cả đã đọc</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="notifications-off" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Không có thông báo nào</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    color: '#4A90E2',
    fontWeight: '500',
  },
  listContainer: {
    padding: 12,
  },
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  readItem: {
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    opacity: 0.8,
  },
  iconContainer: {
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 5,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
});

export default NotificationScreen;
