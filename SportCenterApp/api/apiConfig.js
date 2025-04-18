// api/apiConfig.js

// Thay đổi URL theo máy chủ backend của bạn
// Nếu chạy trên thiết bị thật, sử dụng IP máy chủ thật
// Nếu chạy trên emulator, sử dụng 10.0.2.2 (Android) hoặc localhost (iOS)
export const API_BASE_URL = 'http://10.0.2.2:8000';  // Mặc định cho Android Emulator

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
  register: '/sportscenters/members/',
  login: '/o/token/',
  users: '/sportscenters/users/',
  // User
  profile: '/sportscenters/users/me/',
  // Classes
  classes: '/sportscenters/classes/',
  enrollments: '/sportscenters/enrollments/',
  // Progress
  progress: '/sportscenters/progress/',
  // Appointments
  appointments: '/sportscenters/appointments/',
  // Payments
  payments: '/sportscenters/payments/',
  // Notifications
  notifications: '/sportscenters/notifications/',
};

// Cấu hình client_id và client_secret cho OAuth2
export const OAUTH2_CONFIG = {
  client_id: 'LMInXkXTRpviiIyZ2hQWhIs8hsb26ohoycbcCUPF',  // Lấy từ settings.py
  client_secret: 'pbkdf2_sha256$870000$Ua5mLPx4x5WvfXxsvqapXc$wEg/nSahdzjgt5HcEHT6KjFP9VcZIRZzkGB5uYCSsO4=', // Lấy từ settings.py
  grant_type: 'password',
}; 