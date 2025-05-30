// src/screens/Auth/LoginScreen.js

import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { authStyles, theme } from '../../styles';
import { MyDispatchContext } from '../../contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiConfig, { API_ENDPOINTS, authApis } from '../../api/apiConfig';
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const [user, setUser] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useContext(MyDispatchContext);
  const nav = useNavigation();

  const info = [
    {
      label: "Tên đăng nhập",
      field: "username",
      secureTextEntry: false,
      icon: "account"
    },
    {
      label: "Mật khẩu",
      field: "password",
      secureTextEntry: true,
      icon: "eye"
    }
  ];

  const setState = (value, field) => {
    setUser({ ...user, [field]: value });
    setErrorMsg('');
  };

  const validate = () => {
    for (let i of info) {
      if (!(i.field in user) || user[i.field] === '') {
        setErrorMsg(`Vui lòng nhập ${i.label}!`);
        return false;
      }
    }
    return true;
  };

  const handleLogin = async () => {
    if (validate()) {
      setLoading(true);
      try {
        const res = await apiConfig.post(API_ENDPOINTS['login'], {
          ...user,
          client_id: '7RphfNKj71H9i3uaIN9ps6GKtMCxDHWtjWiEPWPI',
          client_secret: 'BTK3xttEJH15ynjVKTC5CRQZsqoZIRUkQHt62rkfGlWoYWDogJfbe5WAJkH4PIIK8wlDqw0tENo2b6zMgwodBjITTEyVpgYnduteXcvHNvJVqpbpOLlsHktDkkXjzowP',
          grant_type: 'password'
        });

        await AsyncStorage.setItem('access_token', res.data.access_token);
        await AsyncStorage.setItem('refresh_token', res.data.refresh_token);
        await AsyncStorage.setItem('isLoggedIn', 'true');

        const u = await authApis(res.data.access_token).get(API_ENDPOINTS['current-user']);
        
        // Log toàn bộ response data để debug
        console.log('Current user data:', u.data);
        
        dispatch({
          type: 'login',
          payload: u.data
        });

        // Điều hướng theo role (nếu có)
        console.log('User role:', u.data.role);
        
        if (u.data.role === 'customer') {
          console.log('Navigating to CustomerDashboard');
          nav.navigate("CustomerDashboard");
        } else if (u.data.role === 'trainer') {
          console.log('Navigating to CoachDashboard');
          nav.navigate("CoachDashboard");
        } else {
          console.log('Navigating to default dashboard');
          nav.navigate("CustomerDashboard");
        }
      } catch (ex) {
        console.error(ex);
        Alert.alert("Đăng nhập thất bại", "Vui lòng kiểm tra tài khoản, mật khẩu hoặc kết nối mạng.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[authStyles.scrollContainer, { paddingBottom: 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ width: '100%' }}>
              <Image source={require('../../assets/icon.png')} style={authStyles.logo} />
              <Text style={authStyles.title}>Đăng nhập</Text>

              {errorMsg ? <Text style={authStyles.errorText}>{errorMsg}</Text> : null}

              {info.map(i => (
                <TextInput
                  key={`${i.label}-${i.field}`}
                  label={i.label}
                  value={user[i.field]}
                  onChangeText={t => setState(t, i.field)}
                  style={authStyles.input}
                  secureTextEntry={i.field === 'password' ? !showPassword : false}
                  autoCapitalize="none"
                  right={
                    i.field === 'password' ? (
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    ) : (
                      <TextInput.Icon icon={i.icon} />
                    )
                  }
                  theme={{ colors: { background: theme.colors.background } }}
                />
              ))}

              <TouchableOpacity
                style={[authStyles.button, loading && authStyles.disabledButton]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={authStyles.buttonText}>Đăng nhập</Text>
                )}
              </TouchableOpacity>

              <Text style={authStyles.orText}>Hoặc đăng nhập bằng</Text>

              <View style={authStyles.socialContainer}>
                <TouchableOpacity style={authStyles.socialButton}>
                  <Image source={require('../../assets/google.png')} style={authStyles.socialIcon} />
                  <Text style={authStyles.socialText}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity style={authStyles.socialButton}>
                  <Image source={require('../../assets/facebook.png')} style={authStyles.socialIcon} />
                  <Text style={authStyles.socialText}>Facebook</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => nav.navigate('Register')}>
                <Text style={authStyles.registerLink}>Chưa có tài khoản? Đăng ký</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}