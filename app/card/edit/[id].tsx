import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { borderRadius, colors, spacing, typography } from '../../../src/constants';
import { getCardById } from '../../../src/services/database';
import { useStudyStore } from '../../../src/stores/useStudyStore';
import { Card } from '../../../src/types';

export default function EditCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateCard, deleteCard } = useStudyStore();

  const [card, setCard] = useState<Card | null>(null);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tags, setTags] = useState('');
  const [frontImage, setFrontImage] = useState<string | undefined>();
  const [backImage, setBackImage] = useState<string | undefined>();
  const [errors, setErrors] = useState({ front: '', back: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getCardById(id).then((c) => {
      if (c) {
        setCard(c);
        setFront(c.front);
        setBack(c.back);
        setTags(c.tags ?? '');
        setFrontImage(c.front_image);
        setBackImage(c.back_image);
      }
    });
  }, [id]);

  const validate = () => {
    const newErrors = { front: '', back: '' };
    if (!front.trim()) newErrors.front = 'Front text is required';
    if (!back.trim()) newErrors.back = 'Back text is required';
    setErrors(newErrors);
    return !newErrors.front && !newErrors.back;
  };

  const handlePickImage = async (side: 'front' | 'back') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Required', 'Please allow access to your photo library.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true });
    if (!result.canceled && result.assets[0]) {
      if (side === 'front') setFrontImage(result.assets[0].uri);
      else setBackImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await updateCard(id, {
        front: front.trim(),
        back: back.trim(),
        tags: tags.trim() || undefined,
        front_image: frontImage,
        back_image: backImage,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save card.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Card', 'Are you sure you want to delete this card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteCard(id);
          router.back();
        },
      },
    ]);
  };

  if (!card) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.topRow}>
            <Pressable onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={colors.primary} />
            </Pressable>
            <Text style={styles.title}>Edit Card</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.cardSectionLabel}>Front (Question)</Text>
            <Input
              value={front}
              onChangeText={(t) => { setFront(t); setErrors((e) => ({ ...e, front: '' })); }}
              error={errors.front}
              placeholder="Question or prompt..."
              multiline
              numberOfLines={4}
              style={styles.cardInput}
            />
            {frontImage ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: frontImage }} style={styles.previewImg} resizeMode="contain" />
                <Pressable onPress={() => setFrontImage(undefined)} style={styles.removeImg}>
                  <Ionicons name="close-circle" size={18} color={colors.white} />
                </Pressable>
              </View>
            ) : null}
            <Pressable style={styles.imagePickerBtn} onPress={() => handlePickImage('front')}>
              <Text style={styles.imagePickerText}>📷 {frontImage ? 'Change' : 'Add'} image</Text>
            </Pressable>
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.cardSectionLabel}>Back (Answer)</Text>
            <Input
              value={back}
              onChangeText={(t) => { setBack(t); setErrors((e) => ({ ...e, back: '' })); }}
              error={errors.back}
              placeholder="Answer..."
              multiline
              numberOfLines={4}
              style={styles.cardInput}
            />
            {backImage ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: backImage }} style={styles.previewImg} resizeMode="contain" />
                <Pressable onPress={() => setBackImage(undefined)} style={styles.removeImg}>
                  <Ionicons name="close-circle" size={18} color={colors.white} />
                </Pressable>
              </View>
            ) : null}
            <Pressable style={styles.imagePickerBtn} onPress={() => handlePickImage('back')}>
              <Text style={styles.imagePickerText}>📷 {backImage ? 'Change' : 'Add'} image</Text>
            </Pressable>
          </View>

          <Input
            label="Tags (optional)"
            value={tags}
            onChangeText={setTags}
            placeholder="e.g. grammar, chapter-1"
          />

          <Button label="Save Card" onPress={handleSave} loading={isSaving} />

          <Pressable onPress={handleDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>Delete Card</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 60 },
  loadingText: { ...typography.body, color: colors.textSecondary, padding: spacing.lg },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  backText: { ...typography.body, color: colors.primary },
  title: { ...typography.h3, color: colors.textPrimary },
  cardSection: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md },
  cardSectionLabel: { ...typography.captionBold, color: colors.primary, marginBottom: spacing.sm },
  cardInput: { minHeight: 100, textAlignVertical: 'top', marginBottom: 0 },
  imagePreview: { position: 'relative', marginTop: spacing.sm },
  previewImg: { width: '100%', height: 120, borderRadius: borderRadius.sm },
  removeImg: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  removeImgText: { color: colors.white, fontSize: 12 },
  imagePickerBtn: { marginTop: spacing.sm },
  imagePickerText: { ...typography.caption, color: colors.primary },
  deleteBtn: { alignItems: 'center', marginTop: spacing.lg },
  deleteBtnText: { ...typography.body, color: colors.danger },
});
