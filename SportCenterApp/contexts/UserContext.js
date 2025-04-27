import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tạo context
const UserContext = createContext();

// Trạng thái ban đầu
const initialState = {
  user: null,
  token: null,
  isLoggedIn: false,
  userRole: null,
  isLoading: true,
};

// Action types
const LOGIN = 'LOGIN';
const LOGOUT = 'LOGOUT';
const SET_LOADING = 'SET_LOADING';
const RESTORE_TOKEN = 'RESTORE_TOKEN';
const UPDATE_USER = 'UPDATE_USER';

// Reducer function
const userReducer = (state, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        userRole: action.payload.userRole,
        isLoggedIn: true,
        isLoading: false,
      };
    case LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        userRole: null,
        isLoggedIn: false,
        isLoading: false,
      };
    case SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case RESTORE_TOKEN:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        userRole: action.payload.userRole,
        isLoggedIn: action.payload.isLoggedIn,
        isLoading: false,
      };
    case UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

// Provider component
export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Lấy thông tin đăng nhập từ AsyncStorage khi ứng dụng khởi động
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const userDataString = await AsyncStorage.getItem('userData');
        const userRole = await AsyncStorage.getItem('userRole');
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        
        if (token && userDataString && isLoggedIn === 'true') {
          const userData = JSON.parse(userDataString);
          
          dispatch({
            type: RESTORE_TOKEN,
            payload: {
              token,
              user: userData,
              userRole,
              isLoggedIn: true,
            },
          });
        } else {
          dispatch({ type: SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu đăng nhập:', error);
        dispatch({ type: SET_LOADING, payload: false });
      }
    };

    bootstrapAsync();
  }, []);

  // Login action
  const login = async (userData, token, role) => {
    try {
      // Lưu dữ liệu vào AsyncStorage
      await AsyncStorage.setItem('access_token', token);
      await AsyncStorage.setItem('userRole', role);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('isLoggedIn', 'true');

      // Cập nhật state
      dispatch({
        type: LOGIN,
        payload: {
          user: userData,
          token: token,
          userRole: role,
        },
      });
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu đăng nhập:', error);
      throw error;
    }
  };

  // Logout action
  const logout = async () => {
    try {
      // Xóa dữ liệu khỏi AsyncStorage
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('isLoggedIn');

      // Cập nhật state
      dispatch({ type: LOGOUT });
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      throw error;
    }
  };

  // Cập nhật thông tin người dùng
  const updateUser = (userData) => {
    dispatch({
      type: UPDATE_USER,
      payload: userData,
    });
  };

  return (
    <UserContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook để sử dụng context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser phải được sử dụng trong UserProvider');
  }
  return context;
};

export default UserContext; 