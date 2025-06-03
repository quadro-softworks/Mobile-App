import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View
} from 'react-native';
import { colors } from '@/constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...styles[size],
    };

    if (disabled) {
      return {
        ...baseStyle,
        ...styles[`${variant}Disabled`],
      };
    }

    return {
      ...baseStyle,
      ...styles[variant],
    };
  };

  const getTextStyle = () => {
    const baseStyle: TextStyle = {
      ...styles.text,
      ...styles[`${size}Text`],
    };

    if (disabled) {
      return {
        ...baseStyle,
        ...styles[`${variant}DisabledText`],
      };
    }

    return {
      ...baseStyle,
      ...styles[`${variant}Text`],
    };
  };

  const content = (
    <>
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'secondary' ? colors.card : colors.primary} 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconContainer}>
              {icon}
            </View>
          )}
          <Text style={[getTextStyle(), textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconContainer}>
              {icon}
            </View>
          )}
        </>
      )}
    </>
  );

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconContainer: {
    marginHorizontal: 8,
  },
  // Size variants
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  smText: {
    fontSize: 14,
  },
  mdText: {
    fontSize: 16,
  },
  lgText: {
    fontSize: 18,
  },
  // Button variants
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  // Disabled states
  primaryDisabled: {
    backgroundColor: colors.inactive,
    shadowOpacity: 0,
    elevation: 0,
  },
  secondaryDisabled: {
    backgroundColor: colors.inactive,
    shadowOpacity: 0,
    elevation: 0,
  },
  outlineDisabled: {
    borderColor: colors.inactive,
  },
  ghostDisabled: {
    opacity: 0.5,
  },
  // Text colors
  primaryText: {
    color: colors.card,
  },
  secondaryText: {
    color: colors.card,
  },
  outlineText: {
    color: colors.primary,
  },
  ghostText: {
    color: colors.primary,
  },
  // Disabled text colors
  primaryDisabledText: {
    color: colors.card,
  },
  secondaryDisabledText: {
    color: colors.card,
  },
  outlineDisabledText: {
    color: colors.inactive,
  },
  ghostDisabledText: {
    color: colors.inactive,
  },
});