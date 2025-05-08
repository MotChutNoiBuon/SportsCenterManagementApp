import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, OAUTH2_CONFIG } from './apiConfig';

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
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone || '',
      role: 'member', // Đảm bảo luôn tạo tài khoản member
      avatar: userData.avatar // Thêm trường avatar
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
    
    // Gọi OAuth2 token endpoint - đơn giản như Vaccination-Web-App
    const response = await axios.post(`${API_BASE_URL}/o/token/`, {
      username: credentials.username,
      password: credentials.password,
      client_id: OAUTH2_CONFIG.client_id,
      client_secret: OAUTH2_CONFIG.client_secret,
      grant_type: 'password'
    });

    console.log('Đăng nhập thành công:', response.data);

    if (response.data && response.data.access_token) {
      // Lưu token vào AsyncStorage
      await AsyncStorage.setItem('access_token', response.data.access_token);
      
      if (response.data.refresh_token) {
        await AsyncStorage.setItem('refresh_token', response.data.refresh_token);
      }

      // Lấy thông tin người dùng hiện tại
      console.log('Token nhận được:', response.data.access_token);
      console.log('Gửi request đến API current-user:', `${API_BASE_URL}${API_ENDPOINTS['current-user']}`);
      
      try {
        const userResponse = await axios.get(`${API_BASE_URL}${API_ENDPOINTS['current-user']}`, {
          headers: {
            'Authorization': `Bearer ${response.data.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Phản hồi từ API current-user:', userResponse.data);
        const userData = userResponse.data;

        // Lưu thông tin người dùng vào AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        await AsyncStorage.setItem('userRole', userData.role);
        await AsyncStorage.setItem('isLoggedIn', 'true');

        // Trả về dữ liệu
        return {
          user: userData,
          tokens: {
            access: response.data.access_token,
            refresh: response.data.refresh_token || null,
          }
        };
      } catch (userError) {
        console.error('Lỗi khi lấy thông tin người dùng:', userError);
        console.error('Chi tiết lỗi:', userError.response?.status, userError.response?.data);

        // Thử lại với một cách khác để lấy thông tin người dùng
        try {
          console.log('Thử lại với cách khác...');
          const alternativeUserResponse = await axios.get(`${API_BASE_URL}/users/me/`, {
            headers: {
              'Authorization': `Bearer ${response.data.access_token}`,
            },
          });
          
          console.log('Phản hồi từ API thay thế:', alternativeUserResponse.data);
          const userData = alternativeUserResponse.data;
          
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
          await AsyncStorage.setItem('userRole', userData.role);
          await AsyncStorage.setItem('isLoggedIn', 'true');
          
          return {
            user: userData,
            tokens: {
              access: response.data.access_token,
              refresh: response.data.refresh_token || null,
            }
          };
        } catch (altError) {
          console.error('Lỗi khi thử cách thay thế:', altError);
          
          // Nếu cả hai cách đều không thành công, sử dụng thông tin mặc định
          const defaultUserData = {
            username: credentials.username,
            role: 'member'
          };
          
          await AsyncStorage.setItem('userData', JSON.stringify(defaultUserData));
          await AsyncStorage.setItem('userRole', 'member');
          await AsyncStorage.setItem('isLoggedIn', 'true');
          
          return {
            user: defaultUserData,
            tokens: {
              access: response.data.access_token,
              refresh: response.data.refresh_token || null,
            }
          };
        }
      }
    } else {
      throw new Error('Phản hồi từ server không hợp lệ');
    }
  } catch (error) {
    console.error('Chi tiết lỗi đăng nhập:', error);
    throw error;
  }
};

/**
 * Đăng nhập thay thế sử dụng Token Authentication thay vì OAuth2
 */
export const loginWithToken = async (credentials) => {
  try {
    console.log('Thực hiện đăng nhập với Token Authentication:', { username: credentials.username });
    
    // Gọi API đăng nhập thông thường
    const response = await axios.post(`${API_BASE_URL}/api-token-auth/`, {
      username: credentials.username,
      password: credentials.password
    });

    console.log('Phản hồi token auth từ server:', response.data);

    if (response.data && response.data.token) {
      // Lưu token vào AsyncStorage
      await AsyncStorage.setItem('access_token', response.data.token);
      
      // Lấy thông tin người dùng hiện tại
      const userResponse = await axios.get(`${API_BASE_URL}${API_ENDPOINTS['current-user']}`, {
        headers: {
          'Authorization': `Token ${response.data.token}`,
        },
      });

      const userData = userResponse.data;

      // Lưu thông tin người dùng vào AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('userRole', userData.role || 'member');
      await AsyncStorage.setItem('isLoggedIn', 'true');

      // Trả về dữ liệu theo cấu trúc mong đợi
      return {
        user: userData,
        tokens: {
          access: response.data.token,
          refresh: null,
        }
      };
    } else {
      throw new Error('Phản hồi từ server không hợp lệ');
    }
  } catch (error) {
    console.error('Chi tiết lỗi đăng nhập token:', error.message);
    
    if (error.response) {
      console.error('Dữ liệu lỗi:', error.response.data);
      console.error('Mã trạng thái:', error.response.status);
      
      if (error.response.status === 400) {
        throw new Error('Thông tin đăng nhập không chính xác.');
      } else if (error.response.status === 401) {
        throw new Error('Tên đăng nhập hoặc mật khẩu không đúng.');
      }
    }
    
    throw error;
  }
};

/**
 * Làm mới token sử dụng refresh_token
 */
export const refreshToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('Không có refresh token');
    }
    
    // Sử dụng qs.stringify để tạo form data
    const data = qs.stringify({
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });
    
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.oauth_token}`, 
      data,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    const { access_token, refresh_token: new_refresh_token } = response.data;
    
    await AsyncStorage.setItem('access_token', access_token);
    
    if (new_refresh_token) {
      await AsyncStorage.setItem('refresh_token', new_refresh_token);
    }
    
    return {
      access: access_token,
      refresh: new_refresh_token,
    };
  } catch (error) {
    console.error('Lỗi khi refresh token:', error);
    // Nếu refresh token thất bại, đăng xuất người dùng
    await logout();
    throw error;
  }
};

/**
 * Lấy thông tin người dùng đã đăng nhập
 */
export const getUserProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('Chưa đăng nhập');
    }
    
    const response = await axios.get(`${API_BASE_URL}/users/current-user/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Lấy thông tin người dùng thất bại:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Đăng xuất - Xóa token khỏi AsyncStorage
 */
export const logout = async () => {
  try {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('userRole');
    await AsyncStorage.removeItem('isLoggedIn');
    return true;
  } catch (error) {
    console.error('Đăng xuất thất bại:', error.message);
    throw error;
  }
};