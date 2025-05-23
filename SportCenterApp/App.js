import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from './screens/Auth/WelcomeScreen';
import LoginScreen from './screens/Auth/LoginScreen';
import RegisterScreen from './screens/Auth/RegisterScreen';

import CustomerDashboard from './screens/Customer/CustomerDashboard';

import CoachDashboard from './screens/Coach/CoachDashboard';

import AdminDashboard from './screens/Admin/AdminDashboard';

import NotificationScreen from './screens/Shared/NotificationScreen';
import ProfileScreen from './screens/Shared/ProfileScreen';
import ClassDetails from './screens/Shared/ClassDetails';
import { MyDispatchContext, MyUserContext } from "./contexts/UserContext";
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
            />

            <Stack.Screen
              name="TrainerDashboard"
              component={CoachDashboard}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="AdminDashboard"
              component={AdminDashboard}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="ReceptionistDashboard"
              component={AdminDashboard}
              options={{ headerShown: false }}
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
          name="ClassDetails"
          component={ClassDetails}
          options={{ title: 'Chi tiết lớp học' }}
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
          <StackNavigator/>
        </NavigationContainer>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
  );
}

export default App;
