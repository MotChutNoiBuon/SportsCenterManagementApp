import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CustomButton = ({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  width = null,
  style = {},
  textStyle = {},
}) => {
  const getButtonStyle = () => {
    let buttonStyle = [styles.button];

    // Button type
    switch (type) {
      case 'primary':
        buttonStyle.push(styles.primaryButton);
        break;
      case 'secondary':
        buttonStyle.push(styles.secondaryButton);
        break;
      case 'outline':
        buttonStyle.push(styles.outlineButton);
        break;
      case 'danger':
        buttonStyle.push(styles.dangerButton);
        break;
      case 'success':
        buttonStyle.push(styles.successButton);
        break;
      case 'text':
        buttonStyle.push(styles.textButton);
        break;
      default:
        buttonStyle.push(styles.primaryButton);
    }

    // Button size
    switch (size) {
      case 'small':
        buttonStyle.push(styles.smallButton);
        break;
      case 'medium':
        buttonStyle.push(styles.mediumButton);
        break;
      case 'large':
        buttonStyle.push(styles.largeButton);
        break;
      default:
        buttonStyle.push(styles.mediumButton);
    }

    // Disabled state
    if (disabled || loading) {
      buttonStyle.push(styles.disabledButton);
    }

    // Custom width
    if (width) {
      buttonStyle.push({ width });
    }

    return buttonStyle;
  };

  const getTextStyle = () => {
    let buttonTextStyle = [styles.buttonText];

    // Text color based on button type
    switch (type) {
      case 'primary':
        buttonTextStyle.push(styles.primaryButtonText);
        break;
      case 'secondary':
        buttonTextStyle.push(styles.secondaryButtonText);
        break;
      case 'outline':
        buttonTextStyle.push(styles.outlineButtonText);
        break;
      case 'danger':
        buttonTextStyle.push(styles.dangerButtonText);
        break;
      case 'success':
        buttonTextStyle.push(styles.successButtonText);
        break;
      case 'text':
        buttonTextStyle.push(styles.textButtonText);
        break;
      default:
        buttonTextStyle.push(styles.primaryButtonText);
    }

    // Text size based on button size
    switch (size) {
      case 'small':
        buttonTextStyle.push(styles.smallButtonText);
        break;
      case 'medium':
        buttonTextStyle.push(styles.mediumButtonText);
        break;
      case 'large':
        buttonTextStyle.push(styles.largeButtonText);
        break;
      default:
        buttonTextStyle.push(styles.mediumButtonText);
    }

    // Disabled state
    if (disabled) {
      buttonTextStyle.push(styles.disabledButtonText);
    }

    return buttonTextStyle;
  };

  const iconComponent = icon ? (
    <Icon
      name={icon}
      size={size === 'small' ? 16 : size === 'medium' ? 20 : 24}
      color={
        type === 'primary' || type === 'danger' || type === 'success'
          ? 'white'
          : type === 'outline'
          ? '#4A90E2'
          : type === 'secondary'
          ? '#333'
          : '#4A90E2'
      }
      style={iconPosition === 'left' ? styles.leftIcon : styles.rightIcon}
    />
  ) : null;

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={type === 'outline' || type === 'text' ? '#4A90E2' : 'white'}
        />
      ) : (
        <View style={styles.buttonContent}>
          {icon && iconPosition === 'left' && iconComponent}
          <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && iconComponent}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Button types
  primaryButton: {
    backgroundColor: '#4A90E2',
  },
  secondaryButton: {
    backgroundColor: '#f2f2f2',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  dangerButton: {
    backgroundColor: '#FF6B6B',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  // Button sizes
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  // Button states
  disabledButton: {
    opacity: 0.6,
  },
  // Text styles
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  // Text colors
  primaryButtonText: {
    color: 'white',
  },
  secondaryButtonText: {
    color: '#333',
  },
  outlineButtonText: {
    color: '#4A90E2',
  },
  dangerButtonText: {
    color: 'white',
  },
  successButtonText: {
    color: 'white',
  },
  textButtonText: {
    color: '#4A90E2',
  },
  // Text sizes
  smallButtonText: {
    fontSize: 14,
  },
  mediumButtonText: {
    fontSize: 16,
  },
  largeButtonText: {
    fontSize: 18,
  },
  // Text states
  disabledButtonText: {
    color: '#999',
  },
  // Icon styles
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default CustomButton;
