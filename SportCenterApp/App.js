import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MyUserProvider } from './contexts/UserContext';
import WelcomeScreen from './screens/Auth/WelcomeScreen';
import LoginScreen from './screens/Auth/LoginScreen';
import RegisterScreen from './screens/Auth/RegisterScreen';

import CustomerDashboard from './screens/Customer/CustomerDashboard';
import CoachList from './screens/Customer/CoachList';
import CoachDetail from './screens/Customer/CoachDetail';

import CoachDashboard from './screens/Coach/CoachDashboard';
import CoachClasses from './screens/Coach/CoachClasses';
import Students from './screens/Coach/Students';
import ClassStudents from './screens/Coach/ClassStudents';
import StudentDetails from './screens/Coach/StudentDetails';

import AdminDashboard from './screens/Admin/AdminDashboard';
import ReceptionistDashboard from './screens/Receptionist/ReceptionistDashboard';

import NotificationScreen from './screens/Shared/NotificationScreen';
import ProfileScreen from './screens/Shared/ProfileScreen';
import ClassDetails from './screens/Shared/ClassDetails';
import CoachClassDetail from './screens/Coach/CoachClassDetail';

import RegisterClass from './screens/Shared/RegisterClass';
import InternalNews from './screens/Shared/InternalNews';

import EnrolledClasses from './screens/Shared/EnrolledClasses';
import Classes from './screens/Shared/Classes';
import { MyDispatchContext, MyUserContext, UserProvider } from "./contexts/UserContext";
import MyUserReducer from "./reducers/MyUserReducer";

import { useContext, useReducer } from "react";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const user = useContext(MyUserContext);

  return (
    <Stack.Navigator>
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

      <Stack.Screen
        name="CustomerDashboard"
        component={CustomerDashboard}
        options={{
          title: 'Home',
          gestureEnabled: false,
          headerLeft: () => null,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="CoachDashboard"
        component={CoachDashboard}
        options={{
          title: 'Huấn luyện viên',
          gestureEnabled: false,
          headerLeft: () => null,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="InternalNews"
        component={InternalNews}
        options={{
          title: 'Bản tin nội bộ',
          gestureEnabled: false,
          headerLeft: () => null,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="CoachList"
        component={CoachList}
        options={{ title: 'Danh sách huấn luyện viên' }}
      />

      <Stack.Screen
        name="CoachDetail"
        component={CoachDetail}
        options={{ title: 'Thông tin huấn luyện viên' }}
      />

      <Stack.Screen
        name="TrainerDashboard"
        component={CoachDashboard}
        options={{
          gestureEnabled: false,
          headerLeft: () => null,
          headerBackVisible: false,
        }}
      />

      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{
          gestureEnabled: false,
          headerLeft: () => null,
          headerBackVisible: false,
        }}
      />

      <Stack.Screen
        name="ReceptionistDashboard"
        component={ReceptionistDashboard}
        options={{
          gestureEnabled: false,
          headerLeft: () => null,
          headerBackVisible: false,
        }}
      />

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
        name="CoachClassDetail"
        component={CoachClassDetail}
        options={{ title: 'Chi tiết lớp học' }}
      />
      <Stack.Screen
        name="ClassDetails"
        component={ClassDetails}
        options={{ title: 'Chi tiết lớp học' }}
      />
      <Stack.Screen
        name="RegisterClass"
        component={RegisterClass}
        options={{ title: 'Danh sách lớp học' }}
      />
      <Stack.Screen
        name="EnrolledClasses"
        component={EnrolledClasses}
        options={{ title: 'Lớp học đã đăng ký' }}
      />
      <Stack.Screen
        name="Classes"
        component={Classes}
        options={{ title: 'Lớp học' }}
      />
      <Stack.Screen
        name="CoachClasses"
        component={CoachClasses}
        options={{ title: 'Lớp học của tôi' }}
      />
      <Stack.Screen
        name="Students"
        component={Students}
        options={{ title: 'Học viên của tôi' }}
      />
      <Stack.Screen
        name="ClassStudents"
        component={ClassStudents}
        options={{ title: 'Danh sách học viên' }}
      />
      <Stack.Screen
        name="StudentDetails"
        component={StudentDetails}
        options={{ title: 'Thông tin học viên' }}
      />
    </Stack.Navigator>
  );
}

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        <NavigationContainer>
          <MyUserProvider>
            <StackNavigator />
          </MyUserProvider>
        </NavigationContainer>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
  );
}

export default App;