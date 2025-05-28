import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiConfig, { API_ENDPOINTS, authApis } from '../../api/apiConfig';

const CoachList = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const api = authApis(token);
      const response = await api.get(API_ENDPOINTS.trainers);
      setCoaches(response.data.results || response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      setLoading(false);
    }
  };

  const getSpecializationText = (specialization) => {
    const specializations = {
      'gym': 'Gym',
      'yoga': 'Yoga',
      'swimming': 'Bơi lội',
      'dance': 'Nhảy',
    };
    return specializations[specialization] || specialization;
  };

  const renderCoachItem = ({ item }) => (
    <TouchableOpacity
      style={styles.coachCard}
      onPress={() => navigation.navigate('CoachDetail', { coach: item })}
    >
      <Image
        source={{ uri: item.avatar || 'https://via.placeholder.com/100' }}
        style={styles.coachAvatar}
      />
      <View style={styles.coachInfo}>
        <Text style={styles.coachName}>{item.full_name || item.username}</Text>
        <Text style={styles.coachSpecialty}>{getSpecializationText(item.specialization)}</Text>
        <View style={styles.experienceContainer}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.experience}>{item.experience_years || 0} năm kinh nghiệm</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách huấn luyện viên</Text>
      <FlatList
        data={coaches}
        renderItem={renderCoachItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 16,
  },
  coachCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coachAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  coachSpecialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experience: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
});

export default CoachList; 