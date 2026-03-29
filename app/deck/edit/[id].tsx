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
        <Text style={styles.error}>Deck not found</Text>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Deck name is required');
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
      Alert.alert('Error', 'Failed to update deck.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Deck',
      'Are you sure you want to delete this deck? All cards will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
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
      'Reset Progress',
      'This will reset all card progress in this deck. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetDeckProgress(id);
            Alert.alert('Done', 'Deck progress has been reset.');
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
            <Text style={styles.title}>Edit Deck</Text>
            <View style={{ width: 60 }} />
          </View>

          <Input
            label="Deck name"
            value={name}
            onChangeText={setName}
            placeholder="Deck name"
          />
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Description (optional)"
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          <View style={styles.sectionCard}>
            <SettingsRow
              label="Add new subdeck"
              onPress={isPro ? () => Alert.alert('Subdecks', 'Coming soon!') : () => router.push('/paywall')}
            />
            <SettingsRow
              label="New cards per day"
              value={newCardsPerDay}
              onPress={() => {
                Alert.prompt(
                  'New cards per day',
                  'Enter the maximum number of new cards per day',
                  (text) => { if (text) setNewCardsPerDay(text); },
                  'plain-text',
                  newCardsPerDay,
                  'numeric'
                );
              }}
            />
            <SettingsRow
              label="Shuffle cards"
              right={<Toggle value={shuffleCards} onValueChange={setShuffleCards} />}
            />
            <SettingsRow
              label="Auto play audio"
              right={
                isPro ? (
                  <Toggle value={autoPlayAudio} onValueChange={setAutoPlayAudio} />
                ) : (
                  <Pressable onPress={() => router.push('/paywall')} style={styles.proBadge}>
                    <Text style={styles.proBadgeText}>PRO</Text>
                  </Pressable>
                )
              }
            />
            <SettingsRow
              label="Reverse cards"
              right={<Toggle value={reverseCards} onValueChange={setReverseCards} />}
            />
            <SettingsRow label="Reset progress" onPress={handleResetProgress} danger />
            <SettingsRow label="Delete deck" onPress={handleDelete} danger />
          </View>

          <View style={styles.sectionCard}>
            <SettingsRow
              label="Offline Study"
              right={
                isPro ? (
                  <Text style={styles.availableText}>Available</Text>
                ) : (
                  <Pressable onPress={() => router.push('/paywall')} style={styles.proBadge}>
                    <Text style={styles.proBadgeText}>PRO</Text>
                  </Pressable>
                )
              }
            />
          </View>

          <Button label="Save Changes" onPress={handleSave} loading={isSaving} style={styles.saveBtn} />
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
