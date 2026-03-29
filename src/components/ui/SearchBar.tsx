import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../constants';

interface SearchBarProps extends TextInputProps {
  containerStyle?: ViewStyle;
}

export function SearchBar({ containerStyle, style, ...props }: SearchBarProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        clearButtonMode="while-editing"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    height: 44,
    justifyContent: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
});
