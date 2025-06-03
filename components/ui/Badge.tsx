import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { colors } from '@/constants/colors';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
}) => {
  return (
    <View style={[styles.badge, styles[variant], styles[size], style]}>
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`], textStyle]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  // Size variants
  sm: {
    paddingVertical: 2,
  },
  md: {
    paddingVertical: 4,
  },
  lg: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  smText: {
    fontSize: 10,
  },
  mdText: {
    fontSize: 12,
  },
  lgText: {
    fontSize: 14,
  },
  // Color variants
  default: {
    backgroundColor: colors.border,
  },
  primary: {
    backgroundColor: colors.highlight,
  },
  success: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  warning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  // Text colors
  defaultText: {
    color: colors.textSecondary,
  },
  primaryText: {
    color: colors.primary,
  },
  successText: {
    color: colors.success,
  },
  warningText: {
    color: colors.warning,
  },
  errorText: {
    color: colors.error,
  },
});