import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSecurity } from '@/contexts/SecurityContext';
import { useColors } from '@/hooks/useColors';

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { saveOperatorName } = useSecurity();
  const [name, setName] = useState('Señor Moreno');

  const handleContinue = async () => {
    const ok = await saveOperatorName(name);
    if (ok) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Identidad requerida', 'Escriba un nombre válido para que Aura lo salude con naturalidad.');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={[styles.kicker, { color: colors.cyan }]}>AUTENTICACIÓN OPERADOR</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>¿Cómo le gustaría que lo llamara?</Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>Aura guardará ese nombre localmente y lo usará en saludos, reportes y voz natural.</Text>

      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}> 
        <Text style={[styles.label, { color: colors.mutedForeground }]}>NOMBRE DEL OPERADOR</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ej. Señor Moreno"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
        />
      </View>

      <TouchableOpacity activeOpacity={0.9} onPress={handleContinue} style={[styles.primaryButton, { backgroundColor: colors.primary }]}> 
        <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>CONTINUAR</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: 20, gap: 18 },
  kicker: { fontSize: 11, letterSpacing: 2.4, fontFamily: 'Inter_700Bold' },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  body: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 10 },
  label: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  primaryButton: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 2.4 },
});
