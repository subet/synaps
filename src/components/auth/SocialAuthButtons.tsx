import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { useTranslation } from '../../i18n';

interface Props {
  onApple: () => void;
  onGoogle: () => void;
  isLoading: boolean;
}

export function SocialAuthButtons({ onApple, onGoogle, isLoading }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{t('or_divider')}</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Apple — iOS only */}
      {Platform.OS === 'ios' && (
        <Pressable
          style={({ pressed }) => [styles.socialBtn, styles.appleBtn, pressed && styles.pressed]}
          onPress={onApple}
          disabled={isLoading}
        >
          <Ionicons name="logo-apple" size={20} color="#fff" style={styles.socialIcon} />
          <Text style={[styles.socialBtnText, styles.appleBtnText]}>{t('continue_with_apple')}</Text>
        </Pressable>
      )}

      {/* Google */}
      <Pressable
        style={({ pressed }) => [styles.socialBtn, styles.googleBtn, pressed && styles.pressed]}
        onPress={onGoogle}
        disabled={isLoading}
      >
        <GoogleIcon />
        <Text style={[styles.socialBtnText, styles.googleBtnText]}>{t('continue_with_google')}</Text>
      </Pressable>
    </View>
  );
}

// Simple Google "G" icon using View-based shapes (no external SVG needed)
function GoogleIcon() {
  return (
    <View style={styles.googleIconContainer}>
      <Text style={styles.googleIconText}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    opacity: 0.8,
  },
  socialIcon: {
    marginRight: spacing.sm,
  },
  socialBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Apple
  appleBtn: {
    backgroundColor: '#000',
  },
  appleBtnText: {
    color: '#fff',
  },
  // Google
  googleBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
  },
  googleBtnText: {
    color: '#1F1F1F',
  },
  googleIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  googleIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4285F4',
  },
});
