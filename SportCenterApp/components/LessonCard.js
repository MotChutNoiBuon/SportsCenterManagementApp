import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LessonCard = ({
  lesson,
  onPress,
  showActions = true,
  style = {},
}) => {
  // Lesson data structure:
  // {
  //   id: string,
  //   title: string,
  //   instructor: string,
  //   date: string,
  //   time: string,
  //   duration: number, // in minutes
  //   level: 'beginner' | 'intermediate' | 'advanced',
  //   location: string,
  //   thumbnail: string,
  //   status: 'upcoming' | 'completed' | 'canceled',
  //   category: string,
  //   spotsAvailable: number,
  //   totalSpots: number,
  // }

  if (!lesson) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return '#4CAF50';
      case 'completed':
        return '#9E9E9E';
      case 'canceled':
        return '#FF6B6B';
      default:
        return '#4A90E2';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'beginner':
        return 'fitness-center';
      case 'intermediate':
        return 'bolt';
      case 'advanced':
        return 'whatshot';
      default:
        return 'fitness-center';
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.thumbnailContainer}>
        <Image 
          source={{ uri: lesson.thumbnail || 'https://via.placeholder.com/150' }} 
          style={styles.thumbnail} 
        />
        <View 
          style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(lesson.status) }
          ]}
        >
          <Text style={styles.statusText}>
            {lesson.status === 'upcoming' ? 'Sắp diễn ra' : 
             lesson.status === 'completed' ? 'Đã kết thúc' : 'Đã hủy'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{lesson.title}</Text>
        
        <View style={styles.infoRow}>
          <Icon name="person" size={16} color="#666" style={styles.infoIcon} />
          <Text style={styles.infoText} numberOfLines={1}>{lesson.instructor}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="event" size={16} color="#666" style={styles.infoIcon} />
          <Text style={styles.infoText}>{lesson.date}, {lesson.time}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="schedule" size={16} color="#666" style={styles.infoIcon} />
          <Text style={styles.infoText}>{formatDuration(lesson.duration)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="location-on" size={16} color="#666" style={styles.infoIcon} />
          <Text style={styles.infoText} numberOfLines={1}>{lesson.location}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.levelContainer}>
            <Icon 
              name={getLevelIcon(lesson.level)} 
              size={16} 
              color="#4A90E2" 
              style={styles.levelIcon} 
            />
            <Text style={styles.levelText}>
              {lesson.level === 'beginner' ? 'Người mới' : 
               lesson.level === 'intermediate' ? 'Trung cấp' : 'Nâng cao'}
            </Text>
          </View>

          <View style={styles.spotsContainer}>
            <Text style={styles.spotsText}>
              {lesson.spotsAvailable}/{lesson.totalSpots} chỗ
            </Text>
          </View>
        </View>
      </View>

      {showActions && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="bookmark-border" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="more-vert" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailContainer: {
    position: 'relative',
    width: 100,
  },
  thumbnail: {
    width: 100,
    height: '100%',
    resizeMode: 'cover',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelIcon: {
    marginRight: 4,
  },
  levelText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
  },
  spotsContainer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  spotsText: {
    fontSize: 11,
    color: '#666',
  },
  actionsContainer: {
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingRight: 5,
    paddingLeft: 0,
  },
  actionButton: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LessonCard;
