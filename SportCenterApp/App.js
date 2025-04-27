// App.js hoặc AppNavigator.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import UserProvider
import { UserProvider, useUser } from './contexts/UserContext';

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

// Tạo component AppNavigator riêng để sử dụng useUser hook
const AppNavigator = () => {
  const { isLoggedIn, userRole, isLoading } = useUser();

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
              name="TrainerDashboard"
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
              name="ReceptionistDashboard" // Có thể sử dụng chung màn hình của admin hoặc tạo màn hình riêng
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

// Wrap AppNavigator with UserProvider
export default function App() {
  return (
    <UserProvider>
      <AppNavigator />
    </UserProvider>
  );
}
