import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { useTranslation } from '../../i18n';
import { useAppStore } from '../../stores/useAppStore';
import { COUNTRIES, getCountryName } from '../../i18n/countries';

interface Props {
  label: string;
  value: string; // ISO country code e.g. "US"
  onChange: (code: string) => void;
}

export function CountryPicker({ label, value, onChange }: Props) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);

  const displayName = value ? getCountryName(value, language) : '';

  const sorted = useMemo(() => {
    return [...COUNTRIES].sort((a, b) =>
      getCountryName(a.code, language).localeCompare(getCountryName(b.code, language))
    );
  }, [language]);

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.trim().toLowerCase();
    return sorted.filter((c) =>
      getCountryName(c.code, language).toLowerCase().includes(q)
    );
  }, [search, sorted, language]);

  const handleSelect = (code: string) => {
    onChange(code);
    setVisible(false);
    setSearch('');
  };

  return (
    <>
      <View style={styles.wrapper}>
        <Text style={styles.label}>{label}</Text>
        <Pressable style={styles.selector} onPress={() => setVisible(true)}>
          <Text style={[styles.selectorText, !value && styles.placeholder]}>
            {displayName || t('country_placeholder')}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label}</Text>
            <Pressable onPress={() => { setVisible(false); setSearch(''); }} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Search */}
          <View style={styles.searchWrapper}>
            <Ionicons name="search-outline" size={16} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder={t('search_cards').replace('...', '')}
              placeholderTextColor={colors.textMuted}
              autoFocus
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </View>

          {/* List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const name = getCountryName(item.code, language);
              const selected = value === item.code;
              return (
                <Pressable
                  style={[styles.item, selected && styles.itemSelected]}
                  onPress={() => handleSelect(item.code)}
                >
                  <Text style={[styles.itemText, selected && styles.itemTextSelected]}>
                    {name}
                  </Text>
                  {selected && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  )}
                </Pressable>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs, fontWeight: '500' },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  selectorText: { ...typography.body, color: colors.textPrimary, flex: 1 },
  placeholder: { color: colors.textMuted },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { ...typography.h3, color: colors.textPrimary },
  closeBtn: { padding: spacing.xs },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { ...typography.body, flex: 1, color: colors.textPrimary, padding: 0 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  itemSelected: { backgroundColor: colors.primaryLight },
  itemText: { ...typography.body, color: colors.textPrimary },
  itemTextSelected: { color: colors.primary, fontWeight: '600' },
  separator: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg },
});
