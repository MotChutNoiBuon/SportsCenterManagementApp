import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, Dimensions, ImageBackground } from 'react-native';
import { authStyles } from '../../styles';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../contexts/UserContext';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const user = useUser(); // Lấy user trực tiếp từ MyUserContext
  const phrases = ['Chào mừng!', 'Hôm nay bạn thế nào?', 'Hãy đến với chúng tôi!'];
  const [phraseIndex, setPhraseIndex] = useState(0);

  const screenWidth = Dimensions.get('window').width;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleNavigate = () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    switch (user.role) {
      case 'member':
        navigation.navigate('CustomerDashboard');
        break;
      case 'trainer':
        navigation.navigate('TrainerDashboard');
        break;
      case 'admin':
        navigation.navigate('AdminDashboard');
        break;
      case 'receptionist':
        navigation.navigate('ReceptionistDashboard');
        break;
      default:
        navigation.navigate('Login');
    }
  };

  useEffect(() => {
    let isMounted = true;
    const animate = () => {
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        if (isMounted) {
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
          slideAnim.setValue(screenWidth);
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            if (isMounted) {
              setTimeout(animate, 1500);
            }
          });
        }
      });
    };

    animate();
    return () => {
      isMounted = false;
    };
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

        <TouchableOpacity style={authStyles.welcomeButton} onPress={handleNavigate}>
          <Text style={authStyles.welcomeButtonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity style={authStyles.welcomeButtonOutline} onPress={() => navigation.navigate('Register')}>
          <Text style={authStyles.welcomeButtonOutlineText}>Bạn chưa có tài khoản?</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}