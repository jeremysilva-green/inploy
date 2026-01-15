/**
 * CheckInButtons Component
 * Main UI for employer check-in/out with state-based colors
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { CheckInEventType, EmployerState, ButtonState, CheckInButtonStates } from '@inploy/shared';
import { theme } from '../../styles/theme';

interface CheckInButtonsProps {
  employerId: string;
  employerName: string;
  currentState: EmployerState;
  onCheckIn: (eventType: CheckInEventType) => void;
  isLoading?: boolean;
}

/**
 * Get button states based on current employer state
 */
const getButtonStates = (currentState: EmployerState): CheckInButtonStates => {
  const states = {
    [EmployerState.CHECKED_OUT]: {
      entrada: 'active' as ButtonState,
      salida: 'disabled' as ButtonState,
      almuerzo: 'disabled' as ButtonState,
    },
    [EmployerState.CHECKED_IN]: {
      entrada: 'disabled' as ButtonState,
      salida: 'active' as ButtonState,
      almuerzo: 'active' as ButtonState,
    },
    [EmployerState.ON_LUNCH]: {
      entrada: 'disabled' as ButtonState,
      salida: 'disabled' as ButtonState,
      almuerzo: 'pending' as ButtonState,
    },
  };

  return states[currentState];
};

/**
 * Get button style based on button type and state
 */
const getButtonStyle = (
  eventType: CheckInEventType,
  buttonState: ButtonState,
  isPressed: boolean
) => {
  // Base styles for each button type
  const baseStyles = {
    [CheckInEventType.ENTRADA]: {
      backgroundColor: theme.colors.entrada,
      activeBackgroundColor: isPressed ? theme.colors.entradaHover : theme.colors.entrada,
    },
    [CheckInEventType.SALIDA]: {
      backgroundColor: theme.colors.salida,
      activeBackgroundColor: isPressed ? theme.colors.salidaHover : theme.colors.salida,
    },
    [CheckInEventType.ALMUERZO]: {
      backgroundColor: theme.colors.almuerzo,
      activeBackgroundColor: isPressed ? theme.colors.almuerzoHover : theme.colors.almuerzo,
    },
    [CheckInEventType.RETURN]: {
      backgroundColor: theme.colors.almuerzo,
      activeBackgroundColor: isPressed ? theme.colors.almuerzoHover : theme.colors.almuerzo,
    },
  };

  const base = baseStyles[eventType];

  // Return style based on button state
  if (buttonState === 'disabled') {
    return {
      backgroundColor: theme.colors.gray300,
      opacity: 0.5,
    };
  }

  if (buttonState === 'pending') {
    return {
      backgroundColor: base.activeBackgroundColor,
      opacity: 0.8,
    };
  }

  // Active state
  return {
    backgroundColor: base.activeBackgroundColor,
  };
};

/**
 * Get button label
 */
const getButtonLabel = (eventType: CheckInEventType, buttonState: ButtonState): string => {
  const labels = {
    [CheckInEventType.ENTRADA]: 'Entrada',
    [CheckInEventType.SALIDA]: 'Salida',
    [CheckInEventType.ALMUERZO]: buttonState === 'pending' ? 'En Almuerzo...' : 'Almuerzo',
    [CheckInEventType.RETURN]: 'Regresar',
  };

  return labels[eventType];
};

export const CheckInButtons: React.FC<CheckInButtonsProps> = ({
  employerId,
  employerName,
  currentState,
  onCheckIn,
  isLoading = false,
}) => {
  const [pressedButton, setPressedButton] = React.useState<CheckInEventType | null>(null);

  const buttonStates = getButtonStates(currentState);

  const handlePress = (eventType: CheckInEventType) => {
    const buttonState = buttonStates[eventType.toLowerCase() as keyof CheckInButtonStates];

    if (buttonState === 'disabled' || isLoading) {
      return;
    }

    onCheckIn(eventType);
  };

  const renderButton = (eventType: CheckInEventType) => {
    const buttonState = buttonStates[eventType.toLowerCase() as keyof CheckInButtonStates];
    const isPressed = pressedButton === eventType;
    const isDisabled = buttonState === 'disabled';

    return (
      <TouchableOpacity
        key={eventType}
        style={[
          styles.button,
          getButtonStyle(eventType, buttonState, isPressed),
          isDisabled && styles.disabledButton,
        ]}
        onPress={() => handlePress(eventType)}
        onPressIn={() => setPressedButton(eventType)}
        onPressOut={() => setPressedButton(null)}
        disabled={isDisabled || isLoading}
        activeOpacity={0.8}
      >
        {isLoading && pressedButton === eventType ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <Text style={styles.buttonText}>{getButtonLabel(eventType, buttonState)}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        {renderButton(CheckInEventType.ENTRADA)}
        {renderButton(CheckInEventType.SALIDA)}
        {renderButton(CheckInEventType.ALMUERZO)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    ...theme.shadows.md,
  },
  disabledButton: {
    ...theme.shadows.sm,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
});
