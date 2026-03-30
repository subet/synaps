import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { Toggle } from '../../../src/components/ui/Toggle';
import { borderRadius, colors, spacing, typography } from '../../../src/constants';
import { useTranslation } from '../../../src/i18n';
import { useDeckStore } from '../../../src/stores/useDeckStore';
import { useSubscriptionStore } from '../../../src/stores/useSubscriptionStore';

function SettingsRow({
  label,
  value,
  onPress,
  right,
  danger,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && onPress && styles.rowPressed]}
      onPress={onPress}
    >
      <Text style={[styles.rowLabel, danger && styles.dangerText]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {right}
        {onPress && !right && <Text style={styles.chevron}>›</Text>}
      </View>
    </Pressable>
  );
}

export default function EditDeckScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getDeckById, updateDeck, deleteDeck, resetDeckProgress } = useDeckStore();
  const { isPro } = useSubscriptionStore();

  const deck = getDeckById(id);

  const [name, setName] = useState(deck?.name ?? '');
  const [description, setDescription] = useState(deck?.description ?? '');
  const [newCardsPerDay, setNewCardsPerDay] = useState(String(deck?.new_cards_per_day ?? 20));
  const [shuffleCards, setShuffleCards] = useState(deck?.shuffle_cards ?? true);
  const [autoPlayAudio, setAutoPlayAudio] = useState(deck?.auto_play_audio ?? false);
  const [reverseCards, setReverseCards] = useState(deck?.reverse_cards ?? false);
  const [isSaving, setIsSaving] = useState(false);

  if (!deck) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.error}>{t('deck_not_found')}</Text>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('error'), 'Deck name is required');
      return;
    }
    setIsSaving(true);
    try {
      await updateDeck(id, {
        name: name.trim(),
        description: description.trim() || undefined,
        new_cards_per_day: parseInt(newCardsPerDay) || 20,
        shuffle_cards: shuffleCards,
        auto_play_audio: autoPlayAudio,
        reverse_cards: reverseCards,
      });
      router.back();
    } catch {
      Alert.alert(t('error'), 'Failed to update deck.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('delete_deck_title'),
      t('delete_deck_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteDeck(id);
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  const handleResetProgress = () => {
    Alert.alert(
      t('reset_progress_title'),
      t('reset_progress_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('reset'),
          style: 'destructive',
          onPress: async () => {
            await resetDeckProgress(id);
            Alert.alert(t('done'), t('deck_progress_reset'));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.topRow}>
            <Pressable onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={colors.primary} />
            </Pressable>
            <Text style={styles.title}>{t('edit_deck_title')}</Text>
            <View style={{ width: 60 }} />
          </View>

          <Input
            label={t('deck_name')}
            value={name}
            onChangeText={setName}
            placeholder={t('deck_name')}
          />
          <Input
            label={t('deck_description')}
            value={description}
            onChangeText={setDescription}
            placeholder={t('deck_description')}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          <View style={styles.sectionCard}>
            <SettingsRow
              label={t('add_subdeck')}
              onPress={isPro ? () => Alert.alert('Subdecks', t('coming_soon')) : () => router.push('/paywall')}
            />
            <SettingsRow
              label={t('new_cards_per_day')}
              value={newCardsPerDay}
              onPress={() => {
                Alert.prompt(
                  t('new_cards_per_day'),
                  'Enter the maximum number of new cards per day',
                  (text) => { if (text) setNewCardsPerDay(text); },
                  'plain-text',
                  newCardsPerDay,
                  'numeric'
                );
              }}
            />
            <SettingsRow
              label={t('shuffle_cards')}
              right={<Toggle value={shuffleCards} onValueChange={setShuffleCards} />}
            />
            <SettingsRow
              label={t('auto_play_audio')}
              right={
                isPro ? (
                  <Toggle value={autoPlayAudio} onValueChange={setAutoPlayAudio} />
                ) : (
                  <Pressable onPress={() => router.push('/paywall')} style={styles.proBadge}>
                    <Text style={styles.proBadgeText}>{t('pro_badge')}</Text>
                  </Pressable>
                )
              }
            />
            <SettingsRow
              label={t('reverse_cards')}
              right={<Toggle value={reverseCards} onValueChange={setReverseCards} />}
            />
            <SettingsRow label={t('reset_progress')} onPress={handleResetProgress} danger />
            <SettingsRow label={t('delete')} onPress={handleDelete} danger />
          </View>

          <View style={styles.sectionCard}>
            <SettingsRow
              label={t('offline_study')}
              right={
                isPro ? (
                  <Text style={styles.availableText}>Available</Text>
                ) : (
                  <Pressable onPress={() => router.push('/paywall')} style={styles.proBadge}>
                    <Text style={styles.proBadgeText}>{t('pro_badge')}</Text>
                  </Pressable>
                )
              }
            />
          </View>

          <Button label={t('update_deck')} onPress={handleSave} loading={isSaving} style={styles.saveBtn} />
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
  error: { ...typography.body, color: colors.danger, padding: spacing.lg },
  sectionCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowPressed: { opacity: 0.7 },
  rowLabel: { ...typography.body, color: colors.textPrimary, flex: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowValue: { ...typography.body, color: colors.textSecondary },
  chevron: { fontSize: 20, color: colors.textMuted },
  dangerText: { color: colors.danger },
  proBadge: { backgroundColor: colors.primary, borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  proBadgeText: { ...typography.smallBold, color: colors.white },
  availableText: { ...typography.caption, color: colors.learning },
  saveBtn: { marginTop: spacing.sm },
});
