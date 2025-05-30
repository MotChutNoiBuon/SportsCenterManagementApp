import axios from 'axios';
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './apiConfig';

// Lấy danh sách lớp học
<<<<<<< Updated upstream
export const getClasses = async () => {
  try {
    console.log('Gọi API lấy danh sách lớp học:', `${API_ENDPOINTS.classes}`);
    const response = await apiClient.get(API_ENDPOINTS.classes);
=======
export const getClasses = async (page = 1) => {
  try {
    console.log('Đang lấy trang lớp học:', page);
    const response = await apiConfig.get(`${API_ENDPOINTS.classes}?page=${page}`);
>>>>>>> Stashed changes
    console.log('Kết quả API lớp học:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách lớp học:', error);
    console.error('Chi tiết lỗi:', error.response?.status, error.response?.data);
    throw error;
  }
};

// Lấy chi tiết lớp học
export const getClassDetails = async (classId) => {
  try {
    console.log('Gọi API lấy chi tiết lớp học:', `${API_ENDPOINTS.classes}${classId}/`);
    const response = await apiClient.get(`${API_ENDPOINTS.classes}${classId}/`);
    console.log('Kết quả API chi tiết lớp học:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết lớp học:', error);
    console.error('Chi tiết lỗi:', error.response?.status, error.response?.data);
    throw error;
  }
};

// Đăng ký lớp học
export const enrollClass = async (classId) => {
  try {
    const response = await apiClient.post(`${API_ENDPOINTS.classes}${classId}/enroll/`);
    return response.data;
  } catch (error) {
    console.error('Đăng ký lớp học thất bại:', error.message);
    throw error;
  }
};

// Lấy danh sách lớp học đã đăng ký
export const getEnrollments = async () => {
  try {
<<<<<<< Updated upstream
    const response = await apiClient.get(API_ENDPOINTS.enrollments);
    return response.data;
=======
    console.log('Gọi API lấy danh sách đăng ký:', `${API_ENDPOINTS.enrollments}`);
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }

    const response = await axios({
      method: 'get',
      url: `${apiConfig.defaults.baseURL}${API_ENDPOINTS.enrollments}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('Kết quả API danh sách đăng ký:', response.data);

    // Lấy thông tin chi tiết cho từng lớp học
    const enrollments = response.data.results || response.data || [];
    console.log('Số lượng đăng ký:', enrollments.length);

    const enrollmentsWithDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        try {
          if (!enrollment.gym_class) {
            console.warn('Không tìm thấy thông tin lớp học cho đăng ký:', enrollment.id);
            return enrollment;
          }

          const classDetails = await getClassDetails(enrollment.gym_class);
          return {
            ...enrollment,
            gym_class: classDetails
          };
        } catch (error) {
          console.error('Lỗi khi lấy thông tin lớp học:', error);
          console.error('Chi tiết lỗi:', {
            enrollmentId: enrollment.id,
            classId: enrollment.gym_class,
            error: error.message
          });
          return enrollment;
        }
      })
    );

    console.log('Số lượng đăng ký sau khi lấy chi tiết:', enrollmentsWithDetails.length);

    return {
      ...response.data,
      results: enrollmentsWithDetails
    };
>>>>>>> Stashed changes
  } catch (error) {
    console.error('Lấy danh sách đăng ký thất bại:', error.message);
    console.error('Chi tiết lỗi:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

// Hủy đăng ký lớp học
export const cancelEnrollment = async (enrollmentId) => {
  try {
    const response = await apiClient.delete(`${API_ENDPOINTS.enrollments}${enrollmentId}/`);
    return response.data;
  } catch (error) {
    console.error('Hủy đăng ký lớp học thất bại:', error.message);
    throw error;
  }
};

export const getUpcomingClasses = async () => {
  try {
    console.log('Gọi API lấy lớp học sắp tới:', `${API_ENDPOINTS.classes}?status=upcoming`);
    const response = await apiClient.get(`${API_ENDPOINTS.classes}?status=upcoming`);
    console.log('Kết quả API lớp học sắp tới:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy lớp học sắp tới:', error);
    console.error('Chi tiết lỗi:', error.response?.status, error.response?.data);
    throw error;
  }
};

export const getRecommendedClasses = async () => {
  try {
    console.log('Gọi API lấy lớp học đề xuất:', `${API_ENDPOINTS.classes}?recommended=true`);
    const response = await apiClient.get(`${API_ENDPOINTS.classes}?recommended=true`);
    console.log('Kết quả API lớp học đề xuất:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy lớp học đề xuất:', error);
    console.error('Chi tiết lỗi:', error.response?.status, error.response?.data);
    throw error;
  }
}; 