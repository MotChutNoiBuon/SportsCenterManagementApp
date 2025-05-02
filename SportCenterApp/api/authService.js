import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from './apiConfig';

// Tạo một instance axios cho API
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào mỗi request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const register = async (userData) => {
  try {
    console.log('Bắt đầu đăng ký với dữ liệu:', userData);

    const userDataForApi = {
      username: userData.username,
      password: userData.password,
      password2: userData.password, // Backend yêu cầu xác nhận mật khẩu
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone || '',
      role: 'member', // Đảm bảo luôn tạo tài khoản member
    };

    console.log('Gửi yêu cầu đăng ký đến endpoint:', API_ENDPOINTS.register);
    const response = await apiClient.post(API_ENDPOINTS.register, userDataForApi);

    console.log('Đăng ký thành công, phản hồi:', response.data);
    return response.data;
  } catch (error) {
    console.error('Đăng ký thất bại:', error);

    if (error.response) {
      // Kiểm tra nếu lỗi là do trùng tên đăng nhập
      if (error.response.status === 400 && error.response.data.username) {
        console.error('Tên đăng nhập đã tồn tại:', error.response.data.username);
        throw new Error('Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.');
      }

      console.error('Dữ liệu lỗi:', error.response.data);
      console.error('Mã trạng thái:', error.response.status);
    } else if (error.request) {
      console.error('Không nhận được phản hồi từ server:', error.request);
    } else {
      console.error('Lỗi thiết lập request:', error.message);
    }

    throw error;
  }
};

// Đăng nhập và lấy token
export const login = async (credentials) => {
  try {
    console.log('Thực hiện đăng nhập với:', { username: credentials.username });
    
    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.login}`, {
      username: credentials.username,
      password: credentials.password,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('Phản hồi từ server:', response.data);

    if (response.data && response.data.access) {
      // Lưu token vào AsyncStorage
      await AsyncStorage.setItem('access_token', response.data.access);
      if (response.data.refresh) {
        await AsyncStorage.setItem('refresh_token', response.data.refresh);
      }

      // Giải mã token để lấy user_id
      const tokenParts = response.data.access.split('.');
      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      const userId = tokenPayload.user_id;

      console.log('User ID từ token:', userId);

      // Lấy thông tin người dùng từ endpoint /users/{id}
      const userResponse = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.users}${userId}/`, {
        headers: {
          'Authorization': `Bearer ${response.data.access}`,
          'Accept': 'application/json',
        },
      });

      console.log('Thông tin người dùng:', userResponse.data);

      // Lưu thông tin người dùng
      await AsyncStorage.setItem('user', JSON.stringify(userResponse.data));

      return {
        user: userResponse.data,
        tokens: {
          access: response.data.access,
          refresh: response.data.refresh,
        },
      };
    } else {
      throw new Error('Phản hồi từ server không hợp lệ');
    }
  } catch (error) {
    console.error('Chi tiết lỗi đăng nhập:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
  }
};

// Lấy thông tin người dùng đã đăng nhập
export const getUserProfile = async (token = null) => {
  try {
    let api = apiClient;
    if (token) {
      api = authApis(token);
    }

    const response = await api.get(API_ENDPOINTS.profile);
    return response.data;
  } catch (error) {
    console.error('Lấy thông tin người dùng thất bại:', error.response?.data || error.message);
    throw error;
  }
};

// Đăng xuất - Xóa token khỏi AsyncStorage
export const logout = async () => {
  try {
    await AsyncStorage.removeItem('access_token');
    return true;
  } catch (error) {
    console.error('Đăng xuất thất bại:', error.message);
    throw error;
  }
};