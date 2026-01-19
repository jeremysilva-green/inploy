/**
 * Kiosk Display - Employee Check-in/out Screen
 * Full-screen mode for employee time tracking
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { theme } from '../../styles/theme';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api';
import { playClickSound, playLunchSound } from '../../utils/soundPlayer';

export const KioskDisplay: React.FC = () => {
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);
  const [unlockClicks, setUnlockClicks] = useState(0);

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Monitor fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);

      // If exiting fullscreen while locked, re-enter fullscreen
      if (!isCurrentlyFullscreen && isLocked) {
        setTimeout(() => {
          enterFullscreen();
        }, 100);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [isLocked]);

  // Prevent accidental exits when locked
  React.useEffect(() => {
    if (isLocked) {
      const preventEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'F11') {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      document.addEventListener('keydown', preventEscape, true);
      return () => {
        document.removeEventListener('keydown', preventEscape, true);
      };
    }
  }, [isLocked]);

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((elem as any).webkitRequestFullscreen) {
      (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).mozRequestFullScreen) {
      (elem as any).mozRequestFullScreen();
    } else if ((elem as any).msRequestFullscreen) {
      (elem as any).msRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      if (isLocked) {
        // Show unlock prompt
        setShowUnlockPrompt(true);
      } else {
        exitFullscreen();
      }
    } else {
      enterFullscreen();
    }
  };

  const toggleLock = () => {
    if (isLocked) {
      // Unlock requires confirmation
      setShowUnlockPrompt(true);
    } else {
      // Lock immediately
      setIsLocked(true);
      if (!isFullscreen) {
        enterFullscreen();
      }
    }
  };

  const handleUnlockClick = () => {
    const newClicks = unlockClicks + 1;
    setUnlockClicks(newClicks);

    if (newClicks >= 5) {
      // Unlock after 5 clicks
      setIsLocked(false);
      setShowUnlockPrompt(false);
      setUnlockClicks(0);
    }
  };

  const cancelUnlock = () => {
    setShowUnlockPrompt(false);
    setUnlockClicks(0);
  };

  // Clear success message after 3 seconds
  React.useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch employees
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employers'],
    queryFn: () => apiClient.getEmployers(),
  });

  // Fetch today's check-ins to display times in buttons
  const { data: checkInsData } = useQuery({
    queryKey: ['check-ins-today'],
    queryFn: () => apiClient.getCheckIns({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    }),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: (data: { employerId: string; eventType: string; employeeName: string }) =>
      apiClient.createCheckIn({
        employerId: data.employerId,
        eventType: data.eventType,
        timestamp: new Date().toISOString(),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employers'] });
      queryClient.invalidateQueries({ queryKey: ['check-ins-today'] });
      setSuccessMessage(`✓ ${variables.employeeName} - ${formatButtonTime(currentTime)}`);
    },
    onError: (error: any) => {
      setSuccessMessage(`✗ Error: ${error.message || 'No se pudo registrar'}`);
    },
  });

  const handleCheckIn = (employerId: string, employeeName: string, eventType: 'ENTRADA' | 'SALIDA' | 'ALMUERZO' | 'RETURN') => {
    console.log('Check-in button pressed:', { employerId, employeeName, eventType, timestamp: new Date().toISOString() });

    // Play appropriate sound based on button type
    if (eventType === 'ENTRADA' || eventType === 'SALIDA') {
      playClickSound();
    } else if (eventType === 'ALMUERZO' || eventType === 'RETURN') {
      playLunchSound();
    }

    checkInMutation.mutate({ employerId, employeeName, eventType });
  };

  const formatButtonTime = (date: Date) => {
    return date.toLocaleTimeString('es-PY', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-PY', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-PY', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Success/Error Message Banner */}
      {successMessage && (
        <View style={[
          styles.messageBanner,
          successMessage.includes('✓') ? styles.successBanner : styles.errorBanner
        ]}>
          <Text style={styles.messageText}>{successMessage}</Text>
        </View>
      )}

      {/* Unlock Prompt Modal */}
      {showUnlockPrompt && (
        <View style={styles.unlockModal}>
          <View style={styles.unlockContent}>
            <Text style={styles.unlockTitle}>Desbloquear Modo Kiosco</Text>
            <Text style={styles.unlockInstructions}>
              Haga clic {5 - unlockClicks} {5 - unlockClicks === 1 ? 'vez' : 'veces'} más para desbloquear
            </Text>
            <TouchableOpacity
              style={styles.unlockButton}
              onPress={handleUnlockClick}
            >
              <Text style={styles.unlockButtonText}>
                Desbloquear ({unlockClicks}/5)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelUnlock}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Fullscreen Controls */}
      <View style={styles.fullscreenControls}>
        <TouchableOpacity
          style={[styles.controlButton, isFullscreen && styles.controlButtonActive]}
          onPress={toggleFullscreen}
        >
          <Text style={styles.controlButtonText}>
            {isFullscreen ? '⛶ Salir Pantalla Completa' : '⛶ Pantalla Completa'}
          </Text>
        </TouchableOpacity>

        {isFullscreen && (
          <TouchableOpacity
            style={[styles.controlButton, styles.lockButton, isLocked && styles.lockButtonActive]}
            onPress={toggleLock}
          >
            <Text style={styles.controlButtonText}>
              {isLocked ? '🔒 Bloqueado' : '🔓 Bloquear'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Header with Clock */}
      <View style={styles.header}>
        <View style={styles.clockSection}>
          <Text style={styles.time}>{formatTime(currentTime)}</Text>
          <Text style={styles.date}>{formatDate(currentTime)}</Text>
        </View>
        <View style={styles.logoSection}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Sistema de Control de Asistencia</Text>
        </View>
      </View>

      {/* Employee List */}
      <ScrollView style={styles.employeeList} contentContainerStyle={styles.listContent}>
        {employees?.items?.map((employee: any) => {
          // Get check-ins for this employee
          const employeeCheckIns = checkInsData?.checkIns?.filter(
            (ci: any) => ci.employerId === employee.id
          ) || [];

          const entrada = employeeCheckIns.find((ci: any) => ci.eventType === 'ENTRADA');
          const salida = employeeCheckIns.find((ci: any) => ci.eventType === 'SALIDA');
          const almuerzo = employeeCheckIns.find((ci: any) => ci.eventType === 'ALMUERZO');
          const returnFromLunch = employeeCheckIns.find((ci: any) => ci.eventType === 'RETURN');

          // Determine almuerzo button state
          const isOnLunch = almuerzo && !returnFromLunch; // Has ALMUERZO but no RETURN
          const hasReturnedFromLunch = almuerzo && returnFromLunch; // Has both ALMUERZO and RETURN

          return (
            <View key={employee.id} style={styles.employeeCard}>
              <View style={styles.employeeInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {employee.firstName?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.employeeDetails}>
                  <Text style={styles.employeeName}>{employee.firstName}</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.entradaButton,
                    checkInMutation.isPending && styles.buttonDisabled
                  ]}
                  onPress={() => handleCheckIn(employee.id, employee.firstName, 'ENTRADA')}
                  disabled={checkInMutation.isPending}
                >
                  <Text style={styles.buttonIcon}>→</Text>
                  <Text style={styles.buttonText}>Entrada</Text>
                  {entrada && (
                    <Text style={styles.buttonTime}>
                      {formatButtonTime(new Date(entrada.timestamp))}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.salidaButton,
                    checkInMutation.isPending && styles.buttonDisabled
                  ]}
                  onPress={() => handleCheckIn(employee.id, employee.firstName, 'SALIDA')}
                  disabled={checkInMutation.isPending}
                >
                  <Text style={styles.buttonIcon}>←</Text>
                  <Text style={styles.buttonText}>Salida</Text>
                  {salida && (
                    <Text style={styles.buttonTime}>
                      {formatButtonTime(new Date(salida.timestamp))}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    isOnLunch ? styles.almuerzoButtonActive : styles.almuerzoButton,
                    checkInMutation.isPending && styles.buttonDisabled
                  ]}
                  onPress={() => {
                    if (isOnLunch) {
                      // Return from lunch
                      handleCheckIn(employee.id, employee.firstName, 'RETURN');
                    } else {
                      // Go to lunch
                      handleCheckIn(employee.id, employee.firstName, 'ALMUERZO');
                    }
                  }}
                  disabled={checkInMutation.isPending}
                >
                  <Text style={styles.buttonIcon}>
                    {isOnLunch ? '→' : '←'}
                  </Text>
                  <Text style={styles.buttonText}>Almuerzo</Text>
                  {almuerzo && (
                    <Text style={styles.buttonTime}>
                      {formatButtonTime(new Date(almuerzo.timestamp))}
                    </Text>
                  )}
                  {returnFromLunch && (
                    <Text style={styles.buttonTime}>
                      {formatButtonTime(new Date(returnFromLunch.timestamp))}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Presiona el botón correspondiente para registrar tu asistencia
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  messageBanner: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  successBanner: {
    backgroundColor: '#10B981',
  },
  errorBanner: {
    backgroundColor: '#EF4444',
  },
  messageText: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loading: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gray500,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xxl,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clockSection: {
    flex: 1,
  },
  time: {
    fontFamily: theme.fonts.heading,
    fontSize: 48,
    fontWeight: theme.fontWeight.extrabold as any,
    color: theme.colors.gray900,
    marginBottom: theme.spacing.xs,
  },
  date: {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSize.lg,
    color: theme.colors.gray600,
    textTransform: 'capitalize',
  },
  logoSection: {
    alignItems: 'flex-end',
  },
  logoImage: {
    width: 200,
    height: 60,
    marginBottom: theme.spacing.xs,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
  },
  subtitle: {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSize.md,
    color: theme.colors.gray600,
  },
  employeeList: {
    flex: 1,
  },
  listContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  employeeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.sm,
    minHeight: 60,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontFamily: theme.fonts.heading,
    fontSize: 18,
    fontWeight: theme.fontWeight.bold as any,
    color: '#FFFFFF',
  },
  employeeDetails: {
    flex: 1,
  },
  employeeName: {
    fontFamily: theme.fonts.heading,
    fontSize: 16,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.gray900,
    marginBottom: 2,
  },
  employeePosition: {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray600,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  button: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
    width: 90,
    ...theme.shadows.sm,
  },
  entradaButton: {
    backgroundColor: '#10B981',
  },
  salidaButton: {
    backgroundColor: '#EF4444',
  },
  almuerzoButton: {
    backgroundColor: '#F59E0B', // Orange - default state
  },
  almuerzoButtonActive: {
    backgroundColor: '#9CA3AF', // Grey when on lunch
  },
  buttonIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  buttonText: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold as any,
    color: '#FFFFFF',
  },
  buttonTime: {
    fontFamily: theme.fonts.heading,
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
  },
  footerText: {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSize.md,
    color: theme.colors.gray600,
    textAlign: 'center',
  },
  // Fullscreen controls
  fullscreenControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
    zIndex: 100,
  },
  controlButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    ...theme.shadows.md,
  },
  controlButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
  },
  controlButtonText: {
    fontFamily: theme.fonts.heading,
    fontSize: 12,
    fontWeight: theme.fontWeight.bold as any,
    color: '#FFFFFF',
  },
  lockButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
  },
  lockButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  // Unlock modal
  unlockModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  unlockContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    minWidth: 320,
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  unlockTitle: {
    fontFamily: theme.fonts.heading,
    fontSize: 24,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.gray900,
    marginBottom: 16,
    textAlign: 'center',
  },
  unlockInstructions: {
    fontFamily: theme.fonts.body,
    fontSize: 16,
    color: theme.colors.gray600,
    marginBottom: 24,
    textAlign: 'center',
  },
  unlockButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 200,
    ...theme.shadows.md,
  },
  unlockButtonText: {
    fontFamily: theme.fonts.heading,
    fontSize: 18,
    fontWeight: theme.fontWeight.bold as any,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.gray300,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
  },
  cancelButtonText: {
    fontFamily: theme.fonts.heading,
    fontSize: 16,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.gray700,
    textAlign: 'center',
  },
});
