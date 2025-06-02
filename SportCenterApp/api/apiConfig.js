import { Platform } from 'react-native';
import axios from "axios"
import AsyncStorage from '@react-native-async-storage/async-storage';
export const DEV_MODE = false;

let BASE_URL = 'http://192.168.152.183:8000/'


export const OAUTH2_CONFIG = {
  client_id: 'n6NdlScF6H84xLjzMv6zp8PiF0mXP4SHNZq7ZqOD',
  client_secret: 'Owoy66c0GfDFFh6qyMIcpb5HgIk2gQ0eZoK8QvN56G6NyuwJa6jMCIAnMizm6mojrGWpPfAKiRRRD9HwP1MzZWXU4DpU8jZWXib89f158ZOe2Sy8ZwirNcxqG7yUa20u'
};

export const API_ENDPOINTS = {
  'register': '/users/',
  'login': '/o/token/',
  'profile': '/user/profile/', 
  'current-user': '/users/current-user/',
  'users': '/users/',
  'classes': '/classes/',
  'enrollments': '/enrollments/',
  'enrolledClasses':'/enrollments/',
  'progress': '/progress/',
  'appointments': '/appointments/',
  'internalnews': '/internalnews/',
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