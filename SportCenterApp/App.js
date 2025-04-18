// App.js hoặc AppNavigator.js

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth Screens
import WelcomeScreen from './screens/Auth/WelcomeScreen';
import LoginScreen from './screens/Auth/LoginScreen';
import RegisterScreen from './screens/Auth/RegisterScreen';

// Member Screens (thay vì Customer)
import CustomerDashboard from './screens/Customer/CustomerDashboard';

// Trainer Screens (thay vì Coach)
import CoachDashboard from './screens/Coach/CoachDashboard';

// Admin Screens
import AdminDashboard from './screens/Admin/AdminDashboard';

// Shared Screens
import NotificationScreen from './screens/Shared/NotificationScreen';
import ProfileScreen from './screens/Shared/ProfileScreen';
import ClassDetails from './screens/Shared/ClassDetails';

const Stack = createNativeStackNavigator();

export default function App() {
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in from AsyncStorage
  useEffect(() => {
    const checkLoginState = async () => {
      try {
        const loginStatus = await AsyncStorage.getItem('isLoggedIn');
        const storedUserRole = await AsyncStorage.getItem('userRole');
        
        setIsLoggedIn(loginStatus === 'true');
        setUserRole(storedUserRole);
      } catch (error) {
        console.error('Error checking authentication state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginState();
  }, []);

  if (isLoading) {
    // You could return a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isLoggedIn ? (
          // Auth Screens
          <>
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'Đăng nhập' }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Đăng ký' }}
            />
          </>
        ) : userRole === 'member' ? (
          // Member Screens (was 'customer')
          <>
            <Stack.Screen
              name="CustomerDashboard"
              component={CustomerDashboard}
              options={{ headerShown: false }}
            />
          </>
        ) : userRole === 'trainer' ? (
          // Trainer Screens (was 'coach')
          <>
            <Stack.Screen
              name="CoachDashboard"
              component={CoachDashboard}
              options={{ headerShown: false }}
            />
          </>
        ) : userRole === 'admin' ? (
          // Admin Screens
          <>
            <Stack.Screen
              name="AdminDashboard"
              component={AdminDashboard}
              options={{ headerShown: false }}
            />
          </>
        ) : userRole === 'receptionist' ? (
          // Receptionist Screens - thêm màn hình cho receptionist
          <>
            <Stack.Screen
              name="AdminDashboard" // Có thể sử dụng chung màn hình của admin hoặc tạo màn hình riêng
              component={AdminDashboard}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // Fallback to Welcome screen if role is not recognized
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
        )}

        {/* Shared Screens - accessible from any authenticated role */}
        <Stack.Screen
          name="Notifications"
          component={NotificationScreen}
          options={{ title: 'Thông báo' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Thông tin cá nhân' }}
        />
        <Stack.Screen
          name="ClassDetails"
          component={ClassDetails}
          options={{ title: 'Chi tiết lớp học' }}
        />

        {/* We can add conditional screens like this later */}
        {/* {userRole === 'member' && (
          <Stack.Screen name="MemberSpecificScreen" component={...} />
        )} */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
