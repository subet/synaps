import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,

  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { borderRadius, colors, FREE_DECK_LIMIT, spacing, typography } from '../../src/constants';
import { useTranslation } from '../../src/i18n';
import { useDeckStore } from '../../src/stores/useDeckStore';
import { useSubscriptionStore } from '../../src/stores/useSubscriptionStore';

const ICONS: string[] = [
  'book-outline',
  'bulb-outline',
  'flask-outline',
  'globe-outline',
  'musical-notes-outline',
  'code-slash-outline',
  'calculator-outline',
  'medkit-outline',
  'color-palette-outline',
  'document-text-outline',
  'school-outline',
  'airplane-outline',
  'fitness-outline',
  'leaf-outline',
  'briefcase-outline',
  'planet-outline',
  'pizza-outline',
  'paw-outline',
  'language-outline',
  'telescope-outline',
];
const COLORS = ['#4361EE', '#E53E3E', '#48BB78', '#ED8936', '#9B59B6', '#3182CE', '#319795', '#D69E2E', '#F687B3', '#2D3748'];

export default function CreateDeckScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('book-outline');
  const [selectedColor, setSelectedColor] = useState<string>(colors.primary);
  const [nameError, setNameError] = useState('');

  const { createDeck, decks } = useDeckStore();
  const { isPro, wasPro } = useSubscriptionStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      setNameError('Deck name is required');
      return;
    }

    if (!isPro && decks.length >= FREE_DECK_LIMIT) {
      Alert.alert(
        t('limit_decks_title'),
        t('limit_decks_message', { limit: FREE_DECK_LIMIT }),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: wasPro ? t('resubscribe') : t('upgrade'), onPress: () => router.push('/paywall') },
        ]
      );
      return;
    }

    setIsLoading(true);
    try {
      const deck = await createDeck({
        name: name.trim(),
        description: description.trim() || undefined,
        icon: selectedIcon,
        color: selectedColor,
        new_cards_per_day: 20,
        shuffle_cards: true,
        auto_play_audio: false,
        reverse_cards: false,
        is_public_download: false,
      });
      router.replace(`/deck/${deck.id}`);
    } catch {
      Alert.alert(t('error'), t('failed_create_deck'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.topRow}>
            <Pressable onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={colors.primary} />
            </Pressable>
            <Text style={styles.title}>{t('new_deck')}</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Preview */}
          <View style={[styles.preview, { borderColor: selectedColor }]}>
            <View style={[styles.previewIcon, { backgroundColor: `${selectedColor}22` }]}>
              <Ionicons name={selectedIcon as any} size={32} color={selectedColor} />
            </View>
            <Text style={styles.previewName}>{name || 'Deck Name'}</Text>
          </View>

          <Input
            label={`${t('deck_name')} *`}
            value={name}
            onChangeText={(v) => { setName(v); setNameError(''); }}
            error={nameError}
            placeholder="e.g. Spanish Vocabulary"
            autoFocus
          />

          <Input
            label={t('deck_description')}
            value={description}
            onChangeText={setDescription}
            placeholder="What is this deck about?"
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          <Text style={styles.sectionLabel}>{t('deck_icon')}</Text>
          <View style={styles.iconGrid}>
            {ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[styles.iconOption, selectedIcon === icon && styles.iconOptionSelected]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Ionicons
                  name={icon as any}
                  size={22}
                  color={selectedIcon === icon ? colors.primary : colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>{t('deck_color')}</Text>
          <View style={styles.colorRow}>
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.colorCircle, { backgroundColor: c }, selectedColor === c && styles.colorCircleSelected]}
                onPress={() => setSelectedColor(c)}
              />
            ))}
          </View>

          <Button label={t('create_deck')} onPress={handleCreate} loading={isLoading} style={styles.createBtn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 60 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  backText: { ...typography.body, color: colors.primary },
  title: { ...typography.h3, color: colors.textPrimary },
  preview: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
  },
  previewIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  previewName: { ...typography.h3, color: colors.textPrimary, textAlign: 'center' },
  sectionLabel: { ...typography.captionBold, color: colors.textSecondary, marginBottom: spacing.sm },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  iconText: { fontSize: 24 },
  colorRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', marginBottom: spacing.lg },
  colorCircle: { width: 36, height: 36, borderRadius: 18 },
  colorCircleSelected: { borderWidth: 3, borderColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  createBtn: { marginTop: spacing.sm },
});
