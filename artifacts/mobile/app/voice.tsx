import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { useSecurity } from '@/contexts/SecurityContext';
import { useColors } from '@/hooks/useColors';

export default function VoiceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { operatorName } = useSecurity();
  const [message, setMessage] = useState('Aura, inicia una verificación de red.');

  const handleSpeak = () => {
    Speech.speak(message, {
      language: 'es-ES',
      rate: 0.9,
      pitch: 1,
      onDone: () => undefined,
    });
  };

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={[styles.kicker, { color: colors.cyan }]}>NÚCLEO CONVERSACIONAL</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Voz natural y chat operativo</Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>Aura se dirige a usted con cortesía, claridad y seguimiento analítico.</Text>

      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}> 
        <Text style={[styles.label, { color: colors.mutedForeground }]}>OPERADOR</Text>
        <Text style={[styles.operatorName, { color: colors.primary }]}>{operatorName}</Text>
        <TextInput value={message} onChangeText={setMessage} multiline style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]} />
      </View>

      <TouchableOpacity activeOpacity={0.9} onPress={handleSpeak} style={[styles.primaryButton, { backgroundColor: colors.primary }]}> 
        <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>REPRODUCIR RESPUESTA</Text>
      </TouchableOpacity>
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
  operatorName: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  input: { minHeight: 100, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, textAlignVertical: 'top' },
  primaryButton: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 2.4 },
});
