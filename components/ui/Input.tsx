import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureTextEntry?: boolean;
}

const BaseInput = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      disabled = false,
      containerStyle,
      inputStyle,
      leftIcon,
      rightIcon,
      secureTextEntry,
      value,
      onChangeText,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(!secureTextEntry);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      if (onFocus) {
        onFocus(e);
      }
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      if (onBlur) {
        onBlur(e);
      }
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const inputContainerStyle = [
      styles.inputContainer,
      isFocused && !error && styles.inputFocused,
      error ? styles.inputError : null,
      disabled ? styles.inputDisabled : null,
    ];

    const textInputStyle = [
      styles.input,
      leftIcon ? styles.inputWithLeftIcon : null,
      (rightIcon || secureTextEntry) ? styles.inputWithRightIcon : null,
      inputStyle,
    ];

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={inputContainerStyle}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            style={textInputStyle}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry && !showPassword}
            editable={!disabled}
            placeholderTextColor={colors.textSecondary}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...rest}
          />
          {secureTextEntry && (
            <TouchableOpacity
              style={styles.rightIconContainer}
              onPress={togglePasswordVisibility}
              activeOpacity={0.7}
            >
              {showPassword ? (
                <Ionicons name="eye-off" size={20} color={colors.textSecondary} />
              ) : (
                <Ionicons name="eye" size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          )}
          {!secureTextEntry && rightIcon && (
            <View style={styles.rightIconContainer}>{rightIcon}</View>
          )}
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

export const Input = React.memo(BaseInput);

const styles = StyleSheet.create({
  container: {
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    height: 52,
  },
  inputFocused: {
    borderColor: colors.primary,
    // Optional: add shadow for focused state if desired
    // shadowColor: colors.primary,
    // shadowOffset: { width: 0, height: 0 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 2,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  },
  inputWithLeftIcon: {
    paddingLeft: 0, // Adjusted as icon container has padding
  },
  inputWithRightIcon: {
    paddingRight: 0, // Adjusted as icon container has padding
  },
  leftIconContainer: {
    paddingLeft: 16,
    paddingRight: 8, // Space between icon and text
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    paddingRight: 16,
    paddingLeft: 8, // Space between icon and text
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    backgroundColor: colors.border, // Or a more distinct disabled color
    opacity: 0.7,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
});