import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { useSecurity } from '@/contexts/SecurityContext';
import { useColors } from '@/hooks/useColors';

export default function P2PScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { operatorName, p2pStatus, startP2PConnection } = useSecurity();
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    Speech.speak(`Señor Moreno, ha seleccionado el nodo ${p2pStatus?.nodeId ?? 'desconocido'}. ¿Desea habilitar la comunicación P2P cifrada con este dispositivo?`);
  }, []);

  const statusColor = useMemo(() => {
    if (p2pStatus?.connected) return colors.primary;
    if (p2pStatus?.status === 'FAILED') return colors.threat;
    return colors.warning;
  }, [p2pStatus, colors]);

  const handleAuthorize = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAuth(true);
    if (p2pStatus?.nodeId) {
      await startP2PConnection(p2pStatus.nodeId);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={[styles.kicker, { color: colors.cyan }]}>CONSOLA P2P CIFRADA</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Túnel seguro Aura</Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>{operatorName}, se ha identificado el nodo y Aura está gestionando el enlace cifrado localmente.</Text>

      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}> 
        <Text style={[styles.label, { color: colors.mutedForeground }]}>ESTADO</Text>
        <Text style={[styles.status, { color: statusColor }]}> {p2pStatus?.status ?? 'IDLE'} </Text>
        <Text style={[styles.statusBody, { color: colors.foreground }]}>{p2pStatus?.message ?? 'Sin enlace activo.'}</Text>
      </View>

      <TouchableOpacity activeOpacity={0.9} onPress={handleAuthorize} style={[styles.primaryButton, { backgroundColor: colors.primary }]}> 
        <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>HABILITAR CONEXIÓN CIFRADA</Text>
      </TouchableOpacity>

      {auth && (
        <View style={[styles.progress, { borderColor: colors.border, backgroundColor: colors.card }]}> 
          <Text style={[styles.progressLine, { color: colors.primary }]}>SOFTAP READY</Text>
          <Text style={[styles.progressLine, { color: colors.cyan }]}>EXCHANGE PACKETS</Text>
          <Text style={[styles.progressLine, { color: colors.warning }]}>SYNC CHANNEL</Text>
          <Text style={[styles.progressLine, { color: colors.primary }]}>CONEXIÓN EXITOSA / TÚNEL SEGURO ESTABLECIDO</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: 20, gap: 18 },
  kicker: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 2.4 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  body: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 10 },
  label: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.8 },
  status: { fontSize: 18, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' },
  statusBody: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  primaryButton: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 2.4 },
  progress: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 6 },
  progressLine: { fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 1.5 },
});
