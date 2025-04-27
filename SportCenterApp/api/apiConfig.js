// api/apiConfig.js

// Thay đổi URL theo máy chủ backend của bạn
// Nếu chạy trên thiết bị thật, sử dụng IP máy chủ thật
// Nếu chạy trên emulator, sử dụng 10.0.2.2 (Android) hoặc localhost (iOS)
export const API_BASE_URL = 'http://10.0.2.2:8000';  // Mặc định cho Android Emulator

// Sử dụng DEV_API để kiểm tra nếu backend không có sẵn
export const DEV_MODE = true;

// Các thiết lập thay thế cho môi trường khác nhau
export const API_CONFIG = {
  // Emulator Android 
  androidEmulator: 'http://10.0.2.2:8000',
  // Thiết bị iOS/iOS Simulator
  iOSDevice: 'http://localhost:8000',
  // Thiết bị thật kết nối cùng mạng LAN
  localNetwork: 'http://192.168.1.100:8000', // Thay đổi thành IP thực của máy chủ
  // Máy chủ sản phẩm
  production: 'https://api.sportscenter.com',
};

// Đường dẫn API endpoints
export const API_ENDPOINTS = {
  // Auth
  register: '/api/register/',
  login: '/api/login/',
  users: '/api/users/',
  // User
  profile: '/api/users/me/',
  // Classes
  classes: '/api/classes/',
  enrollments: '/api/enrollments/',
  // Progress
  progress: '/api/progress/',
  // Appointments
  appointments: '/api/appointments/',
  // Payments
  payments: '/api/payments/',
  // Notifications
  notifications: '/api/notifications/',
};

// Cấu hình OAuth2 (client credentials)
export const OAUTH2_CONFIG = {
  client_id: 'HxQDtnxYJjTkdRcsicafPK9QqclTYaU8l1CxOQLQ',
  client_secret: 'sportscenter2024',
  grant_type: 'password',
}; 