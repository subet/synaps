import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../constants';
import { Language } from '../../types';
import { isMultilingual, LANGUAGE_FLAGS } from '../../utils/languages';

interface LanguageBadgeProps {
  supported_languages?: Language[] | null;
}

export function LanguageBadge({ supported_languages }: LanguageBadgeProps) {
  if (isMultilingual(supported_languages)) {
    return (
      <View style={styles.badge}>
        <Ionicons name="globe-outline" size={13} color={colors.textMuted} />
      </View>
    );
  }

  return (
    <View style={styles.badge}>
      {supported_languages!.map((lang) => (
        <Text key={lang} style={styles.flag}>{LANGUAGE_FLAGS[lang]}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  flag: {
    fontSize: 12,
  },
});
