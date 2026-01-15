/**
 * CurrencyToggle Component
 * Toggle between PYG and USD display
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Currency, CURRENCY_SYMBOLS } from '@inploy/shared';
import { useCurrencyStore } from '../../store/currencyStore';
import { theme } from '../../styles/theme';

export const CurrencyToggle: React.FC = () => {
  const { currency, toggleCurrency } = useCurrencyStore();

  const isPYG = currency === Currency.PYG;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={toggleCurrency}
      activeOpacity={0.7}
    >
      <View style={styles.toggleContainer}>
        <View style={[styles.option, isPYG && styles.activeOption]}>
          <Text style={[styles.optionText, isPYG && styles.activeText]}>
            {CURRENCY_SYMBOLS.PYG} PYG
          </Text>
        </View>
        <View style={[styles.option, !isPYG && styles.activeOption]}>
          <Text style={[styles.optionText, !isPYG && styles.activeText]}>
            {CURRENCY_SYMBOLS.USD} USD
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray200,
    borderRadius: theme.borderRadius.full,
    padding: 4,
  },
  option: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    minWidth: 80,
    alignItems: 'center',
  },
  activeOption: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  optionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gray700,
  },
  activeText: {
    color: theme.colors.white,
  },
});
