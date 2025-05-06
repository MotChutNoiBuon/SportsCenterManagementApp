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
      // return 'http://192.168.157.52:8000';
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:8000'; // iOS simulator
    }
  }
  // Nếu đang chạy trên thiết bị thật
  // Đảm bảo thay '192.168.x.x' bằng địa chỉ IP thực của máy tính bạn trong cùng mạng Wi-Fi
  // return 'http://192.168.2.16:8000'; // Localhost - Thay 'x.x' bằng IP máy tính của bạn
  // return 'http://192.168.2.7:8000';
  return 'http://192.168.2.7:8000';
};

// OAuth2 credentials
export const OAUTH2_CONFIG = {
  client_id: '7RphfNKj71H9i3uaIN9ps6GKtMCxDHWtjWiEPWPI',
  client_secret: 'BTK3xttEJH15ynjVKTC5CRQZsqoZIRUkQHt62rkfGlWoYWDogJfbe5WAJkH4PIIK8wlDqw0tENo2b6zMgwodBjITTEyVpgYnduteXcvHNvJVqpbpOLlsHktDkkXjzowP',
};

// API base URL cho toàn bộ ứng dụng
export const API_BASE_URL = getBaseUrl();

// Các endpoint API
export const API_ENDPOINTS = {
  'login': '/o/token/',  // Endpoint OAuth2 chuẩn, không phải '/login/'
  'oauth_token': '/o/token/', // Thêm một alias cho endpoint token OAuth2 nếu cần
  'register': '/users/', // RESTful endpoint, không phải '/register/'
  'current-user': '/users/current-user/',
  users: '/users/',
  classes: '/classes/',
  enrollments: '/enrollments/',
  progress: '/progress/',
  appointments: '/appointments/',
  payments: '/payments/',
  notifications: '/notifications/',
};

// Thêm OAuth2 credentials - giống Vaccination-Web-App
export const CLIENT_ID = '7RphfNKj71H9i3uaIN9ps6GKtMCxDHWtjWiEPWPI';
export const CLIENT_SECRET = 'BTK3xttEJH15ynjVKTC5CRQZsqoZIRUkQHt62rkfGlWoYWDogJfbe5WAJkH4PIIK8wlDqw0tENo2b6zMgwodBjITTEyVpgYnduteXcvHNvJVqpbpOLlsHktDkkXjzowP';