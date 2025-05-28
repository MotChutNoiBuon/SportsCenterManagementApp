import { Platform } from 'react-native';
import axios from "axios"
import AsyncStorage from '@react-native-async-storage/async-storage';
export const DEV_MODE = false;

let BASE_URL = 'http://192.168.1.6:8000'


export const OAUTH2_CONFIG = {
  client_id: '7RphfNKj71H9i3uaIN9ps6GKtMCxDHWtjWiEPWPI',
  client_secret: 'BTK3xttEJH15ynjVKTC5CRQZsqoZIRUkQHt62rkfGlWoYWDogJfbe5WAJkH4PIIK8wlDqw0tENo2b6zMgwodBjITTEyVpgYnduteXcvHNvJVqpbpOLlsHktDkkXjzowP'
};

export const API_ENDPOINTS = {
  'register': '/users/',
  'login': '/o/token/',
  'profile': '/user/profile/', 
  'current-user': '/users/current-user/',
  'users': '/users/',
  'classes': '/classes/',
  'enrollments': '/enrollments/',
  'progress': '/progress/',
  'appointments': '/appointments/',
  'payments': '/payments/',
  'notifications': '/notifications/',
  'trainers': '/trainers/',
  'members': '/members/',
  'receptionists': '/receptionists/',
};
export const authApis = (token) => {
    return axios.create({
        baseURL: BASE_URL, 
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export default axios.create({
    baseURL: BASE_URL
});
const getCurrentUser = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const response = await axios.get(API_ENDPOINTS['current-user'], {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Dữ liệu người dùng hiện tại
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error.response?.data || error.message);
    throw error;
  }
};
