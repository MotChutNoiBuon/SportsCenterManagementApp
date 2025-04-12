import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ClassDetailScreen from './screens/ClassDetailScreen';
import { Provider as PaperProvider } from 'react-native-paper';

const Stack = createStackNavigator();

export default function App() {
  const [accessToken, setAccessToken] = useState(null);

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {!accessToken ? (
            <Stack.Screen name="Login" options={{ headerShown: false }}>
              {props => <LoginScreen {...props} setAccessToken={setAccessToken} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Home">
                {props => <HomeScreen {...props} accessToken={accessToken} />}
              </Stack.Screen>
              <Stack.Screen name="ClassDetail">
                {props => <ClassDetailScreen {...props} accessToken={accessToken} />}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
