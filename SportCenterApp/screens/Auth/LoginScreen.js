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

export default function LoginScreen( ) {
  const [user, setUser] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useContext(MyDispatchContext);
  const nav = useNavigation();

  const info = [{
    label: "Tên đăng nhập",
    field: "username",
    secureTextEntry: false,
    icon: "text"
  }, {
    label: "Mật khẩu",
    field: "password",
    secureTextEntry: true,
    icon: "eye"
  }];

  const setState = (value, field) => {
    setUser({ ...user, [field]: value });
  }

  const validate = () => {
    for (let i of info)
      if (!(i.field in user) || user[i.field] === '') {
        setMsg(`Vui lòng nhập ${i.label}!`);
        return false;
      }
    return true;
  }

  const handleLogin = async () => {
    if (validate() === true) {
      try {
        let res = await apiConfig.post(API_ENDPOINTS['login'], {
          ...user,
          'client_id': '7RphfNKj71H9i3uaIN9ps6GKtMCxDHWtjWiEPWPI',
          'client_secret': 'BTK3xttEJH15ynjVKTC5CRQZsqoZIRUkQHt62rkfGlWoYWDogJfbe5WAJkH4PIIK8wlDqw0tENo2b6zMgwodBjITTEyVpgYnduteXcvHNvJVqpbpOLlsHktDkkXjzowP',
          'grant_type': 'password'
        });
        console.info("Đăng nhập thành công2222!")
        console.info(res.data.access_token);
        console.info("Successfully logged in!");
        console.info("User data: ", res.data);
        await AsyncStorage.setItem('token', res.data.access_token);
        

        console.info('The problem is here!')
        let u = await authApis(res.data.access_token).get(API_ENDPOINTS['current-user']);
        dispatch({
          "type": "login",
          "payload": u.data
        });
        console.info(u.data)
        console.info("Đăng nhập thành công!")
        nav.navigate("CustomerDashboard");
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[authStyles.scrollContainer, { paddingBottom: 40 }]}
          keyboardShouldPersistTaps="never"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ width: '100%' }}>
              <Image source={require('../../assets/icon.png')} style={authStyles.logo} />
              <Text style={authStyles.title}>Đăng nhập</Text>

              {errorMsg ? (
                <Text style={authStyles.errorText}>{errorMsg}</Text>
              ) : null}

              {/* <TextInput
                label="Tên người dùng"
                value={username}
                placeholder="VD: nguyenvana"
                onChangeText={(text) => {
                  setUsername(text);
                  setErrorMsg('');
                }}
                mode="outlined"
                style={authStyles.input}
                autoCapitalize="none"
                theme={{ colors: { background: theme.colors.background } }}
                error={errorMsg && !username}
              />

              <TextInput
                label="Mật khẩu"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrorMsg('');
                }}
                secureTextEntry={!showPassword}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                mode="outlined"
                style={authStyles.input}
                theme={{ colors: { background: theme.colors.background } }}
                error={errorMsg && !password}
              /> */}
              {info.map(i => <TextInput value={user[i.field]}
                onChangeText={t => setState(t, i.field)}
                style={authStyles.input} key={`${i.label}${i.field}`}
                label={i.label} secureTextEntry={i.secureTextEntry}
                right={<TextInput.Icon icon={i.icon} />} />)}
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

              {/* Các nút đăng nhập với mạng xã hội */}
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

              {/* Liên kết tới màn hình đăng ký */}
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