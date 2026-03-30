import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
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
import { borderRadius, colors, FREE_CARDS_PER_DECK_LIMIT, spacing, typography } from '../../../src/constants';
import { useTranslation } from '../../../src/i18n';
import { useStudyStore } from '../../../src/stores/useStudyStore';
import { useSubscriptionStore } from '../../../src/stores/useSubscriptionStore';

export default function CreateCardScreen() {
  const { t } = useTranslation();
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const { createCard, deckCards } = useStudyStore();
  const { isPro } = useSubscriptionStore();

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tags, setTags] = useState('');
  const [frontImage, setFrontImage] = useState<string | undefined>();
  const [backImage, setBackImage] = useState<string | undefined>();
  const [errors, setErrors] = useState({ front: '', back: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [addAnother, setAddAnother] = useState(false);

  const validate = () => {
    const newErrors = { front: '', back: '' };
    if (!front.trim()) newErrors.front = 'Front text is required';
    if (!back.trim()) newErrors.back = 'Back text is required';
    setErrors(newErrors);
    return !newErrors.front && !newErrors.back;
  };

  const handlePickImage = async (side: 'front' | 'back') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('permission_required'), t('photo_permission'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      if (side === 'front') setFrontImage(result.assets[0].uri);
      else setBackImage(result.assets[0].uri);
    }
  };

  const handleSave = async (continueAdding = false) => {
    if (!validate()) return;

    if (!isPro && deckCards.length >= FREE_CARDS_PER_DECK_LIMIT) {
      router.push('/paywall');
      return;
    }

    setIsSaving(true);
    try {
      await createCard({
        deck_id: deckId,
        front: front.trim(),
        back: back.trim(),
        tags: tags.trim() || undefined,
        front_image: frontImage,
        back_image: backImage,
        status: 'new',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
      });

      if (continueAdding) {
        setFront('');
        setBack('');
        setTags('');
        setFrontImage(undefined);
        setBackImage(undefined);
        setErrors({ front: '', back: '' });
      } else {
        router.back();
      }
    } catch {
      Alert.alert(t('error'), t('failed_save_card'));
    } finally {
      setIsSaving(false);
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
            <Text style={styles.title}>{t('new_card')}</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Front */}
          <View style={styles.cardSection}>
            <Text style={styles.cardSectionLabel}>{t('card_front')}</Text>
            <Input
              value={front}
              onChangeText={(v) => { setFront(v); setErrors((e) => ({ ...e, front: '' })); }}
              error={errors.front}
              placeholder={t('card_front_placeholder')}
              multiline
              numberOfLines={4}
              style={styles.cardInput}
              autoFocus
            />
            {frontImage && (
              <View style={styles.imagePreview}>
                <Image source={{ uri: frontImage }} style={styles.previewImg} resizeMode="contain" />
                <Pressable onPress={() => setFrontImage(undefined)} style={styles.removeImg}>
                  <Ionicons name="close-circle" size={18} color={colors.white} />
                </Pressable>
              </View>
            )}
            <Pressable style={styles.imagePickerBtn} onPress={() => handlePickImage('front')}>
              <Text style={styles.imagePickerText}>📷 {t('add_image_front')}</Text>
            </Pressable>
          </View>

          {/* Back */}
          <View style={styles.cardSection}>
            <Text style={styles.cardSectionLabel}>{t('card_back')}</Text>
            <Input
              value={back}
              onChangeText={(v) => { setBack(v); setErrors((e) => ({ ...e, back: '' })); }}
              error={errors.back}
              placeholder={t('card_back_placeholder')}
              multiline
              numberOfLines={4}
              style={styles.cardInput}
            />
            {backImage && (
              <View style={styles.imagePreview}>
                <Image source={{ uri: backImage }} style={styles.previewImg} resizeMode="contain" />
                <Pressable onPress={() => setBackImage(undefined)} style={styles.removeImg}>
                  <Ionicons name="close-circle" size={18} color={colors.white} />
                </Pressable>
              </View>
            )}
            <Pressable style={styles.imagePickerBtn} onPress={() => handlePickImage('back')}>
              <Text style={styles.imagePickerText}>📷 {t('add_image_back')}</Text>
            </Pressable>
          </View>

          <Input
            label={t('card_tags')}
            value={tags}
            onChangeText={setTags}
            placeholder={t('card_tags_placeholder')}
            containerStyle={styles.tagsInput}
          />

          <Pressable
            style={[styles.proRow]}
            onPress={() => router.push('/paywall')}
          >
            <Text style={styles.proRowText}>🎵 {t('add_audio')}</Text>
            <View style={styles.proBadge}><Text style={styles.proBadgeText}>{t('pro_badge')}</Text></View>
          </Pressable>

          <View style={styles.actions}>
            <Button
              label={t('save_add_another')}
              onPress={() => handleSave(true)}
              variant="secondary"
              loading={isSaving && addAnother}
              style={styles.saveAnotherBtn}
            />
            <Button
              label={t('save_card')}
              onPress={() => handleSave(false)}
              loading={isSaving && !addAnother}
              style={styles.saveBtn}
            />
          </View>
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
  cardSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardSectionLabel: { ...typography.captionBold, color: colors.primary, marginBottom: spacing.sm },
  cardInput: { minHeight: 100, textAlignVertical: 'top', marginBottom: 0 },
  imagePreview: { position: 'relative', marginTop: spacing.sm },
  previewImg: { width: '100%', height: 120, borderRadius: borderRadius.sm },
  removeImg: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImgText: { color: colors.white, fontSize: 12 },
  imagePickerBtn: { marginTop: spacing.sm },
  imagePickerText: { ...typography.caption, color: colors.primary },
  tagsInput: { marginBottom: spacing.sm },
  proRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  proRowText: { ...typography.body, color: colors.textSecondary, flex: 1 },
  proBadge: { backgroundColor: colors.primary, borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  proBadgeText: { ...typography.smallBold, color: colors.white },
  actions: { gap: spacing.sm },
  saveAnotherBtn: {},
  saveBtn: {},
});
