import { Platform } from 'react-native';

// Cờ để kiểm tra chế độ phát triển
export const DEV_MODE = false;

// Xác định URL dựa trên môi trường
const getBaseUrl = () => {
  if (__DEV__) {
    // Nếu đang chạy trên emulator
    if (Platform.OS === 'android') {
      // return 'http://192.168.2.16:8000'; // Android emulator
      return 'http://192.168.2.7:8000';
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:8000'; // iOS simulator
    }
  }
  // Nếu đang chạy trên thiết bị thật
  // Đảm bảo thay '192.168.x.x' bằng địa chỉ IP thực của máy tính bạn trong cùng mạng Wi-Fi
  // return 'http://192.168.2.16:8000'; // Localhost - Thay 'x.x' bằng IP máy tính của bạn
  return 'http://192.168.2.7:8000';
};

// API base URL cho toàn bộ ứng dụng
export const API_BASE_URL = getBaseUrl();

// Các endpoint API
export const API_ENDPOINTS = {
  register: '/register/',
  login: '/login/',
  users: '/users/',
  profile: '/users/me/',
  classes: '/classes/',
  enrollments: '/enrollments/',
  progress: '/progress/',
  appointments: '/appointments/',
  payments: '/payments/',
  notifications: '/notifications/',
};