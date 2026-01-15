/**
 * Simple icon component using Unicode symbols
 * Clean, modern line-style icons
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface IconProps {
  name: 'dashboard' | 'users' | 'calendar' | 'briefcase' | 'search' | 'moon' | 'bell' | 'edit' | 'trash';
  size?: number;
  color?: string;
  style?: any;
}

const iconMap = {
  dashboard: '▦',     // Grid/dashboard icon
  users: '⚊⚊',       // Multiple people
  calendar: '▢',      // Calendar
  briefcase: '▥',     // Briefcase
  search: '⌕',        // Search/magnifying glass
  moon: '☾',          // Moon/dark mode
  bell: '🔔',         // Notification bell
  edit: '✎',          // Edit/pencil
  trash: '🗑',         // Trash/delete
};

export const Icon: React.FC<IconProps> = ({ name, size = 18, color = '#6B7280', style }) => {
  return (
    <Text style={[styles.icon, { fontSize: size, color }, style]}>
      {iconMap[name] || '?'}
    </Text>
  );
};

const styles = StyleSheet.create({
  icon: {
    fontWeight: '400',
    lineHeight: 1,
  },
});
