// src/screens/Auth/WelcomeScreen.js

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, Dimensions, ImageBackground } from 'react-native';
import { authStyles } from '../../styles';

export default function WelcomeScreen({ navigation }) {
  const phrases = ['Chào mừng!', 'Hôm nay bạn thế nào?', 'Hãy đến với chúng tôi!'];
  const [phraseIndex, setPhraseIndex] = useState(0);

  const screenWidth = Dimensions.get('window').width;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
        slideAnim.setValue(screenWidth);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(animate, 1500);
        });
      });
    };

    animate();
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/background.png')} 
      style={authStyles.welcomeBackground} 
      resizeMode="cover"
    >
      <View style={authStyles.welcomeContainer}>
        <Image source={require('../../assets/icon.png')} style={authStyles.logo} />

        <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
          <Text style={authStyles.title}>{phrases[phraseIndex]}</Text>
        </Animated.View>

        <TouchableOpacity style={authStyles.welcomeButton} onPress={() => navigation.navigate('Login')}>
          <Text style={authStyles.welcomeButtonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity style={authStyles.welcomeButtonOutline} onPress={() => navigation.navigate('Register')}>
          <Text style={authStyles.welcomeButtonOutlineText}>Bạn chưa có tài khoản?</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
