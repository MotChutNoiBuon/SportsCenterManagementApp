import { Platform } from 'react-native';

// Cờ để kiểm tra chế độ phát triển
export const DEV_MODE = false;

// Xác định URL dựa trên môi trường
const getBaseUrl = () => {
  if (__DEV__) {
    // Nếu đang chạy trên emulator
    if (Platform.OS === 'android') {
      return 'http://192.168.20.162:8000'; // Android emulator
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:8000'; // iOS simulator
    }
  }
  // Nếu đang chạy trên thiết bị thật
  // Đảm bảo thay '192.168.x.x' bằng địa chỉ IP thực của máy tính bạn trong cùng mạng Wi-Fi
  return 'http://192.168.20.162:8000'; // cLocalhost - Thay 'x.x' bằng IP máy tính của bạn
};

export const OAUTH2_CONFIG = {
  client_id: '7RphfNKj71H9i3uaIN9ps6GKtMCxDHWtjWiEPWPI',
  client_secret: 'BTK3xttEJH15ynjVKTC5CRQZsqoZIRUkQHt62rkfGlWoYWDogJfbe5WAJkH4PIIK8wlDqw0tENo2b6zMgwodBjITTEyVpgYnduteXcvHNvJVqpbpOLlsHktDkkXjzowP',
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
