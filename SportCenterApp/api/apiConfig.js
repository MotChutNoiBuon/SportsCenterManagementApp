import { Platform } from 'react-native';
import axios from "axios"
import AsyncStorage from '@react-native-async-storage/async-storage';
export const DEV_MODE = false;

let BASE_URL = 'http://192.168.151.185:8000/'


export const OAUTH2_CONFIG = {
  client_id: '20g2f9qSr91eEYq0wAppUETTIhMuNdKaHZxVD2rM',
  client_secret: 'y9Bn8Xq3KGETM7DEYFnCdCM9y34k0ieOOHTpLvJNtUNPReYgpguCd0rQYRl2vLWaymL6Eit1af3Kjw0ETHB9KCA9oTcPmEGHczHgNboQHqBv7HOwd3Lf4HETmuALXQYS'
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
  'trainerClasses':'/trainer/enrollments/',
  'progress': '/progress/',
  'appointments': '/appointments/',
  'internalnews': '/internalnews/',
  'payments': '/payments/',
  'notifications': '/notifications/',
  'trainers': '/trainers/',
  'members': '/members/',
  'receptionists': '/receptionists/',

  'stats': '/stats/',
  'stats-members': '/stats/members/',
  'stats-revenue': '/stats/revenue/', 
  'stats-classes': '/stats/classes/',
  'stats-class-members': '/stats/class-members/',
  'stats-class-summary': '/stats/class-summary/',

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

export const getStatistics = {
  // Lấy thống kê hội viên
  getMembers: async (period = 'monthly', startDate, endDate) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const api = authApis(token);
      const params = { period };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api.get(API_ENDPOINTS['stats-members'], { params });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thống kê hội viên:', error);
      throw error;
    }
  },

  // Lấy thống kê doanh thu
  getRevenue: async (period = 'monthly', startDate, endDate) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const api = authApis(token);
      const params = { period };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api.get(API_ENDPOINTS['stats-revenue'], { params });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thống kê doanh thu:', error);
      throw error;
    }
  },

  // Lấy thống kê lớp học
  getClasses: async (period = 'monthly', startDate, endDate) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const api = authApis(token);
      const params = { period };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api.get(API_ENDPOINTS['stats-classes'], { params });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thống kê lớp học:', error);
      throw error;
    }
  },

  // Lấy thống kê hội viên theo lớp học
  getClassMembers: async (period = 'monthly', startDate, endDate, classId, trainerId) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const api = authApis(token);
      const params = { period };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (classId) params.class_id = classId;
      if (trainerId) params.trainer_id = trainerId;
      
      const response = await api.get(API_ENDPOINTS['stats-class-members'], { params });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thống kê lớp học chi tiết:', error);
      throw error;
    }
  },

  // Lấy tổng quan thống kê
  getSummary: async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const api = authApis(token);
      
      const response = await api.get(API_ENDPOINTS['stats-class-summary']);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy tổng quan thống kê:', error);
      throw error;
    }
  }
};