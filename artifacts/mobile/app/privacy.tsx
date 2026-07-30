import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useColors } from '@/hooks/useColors';

export default function PrivacyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState('Seleccione una foto para eliminar metadatos EXIF.');

  const handlePick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Debes autorizar acceso a la galería para limpiar EXIF.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: false, quality: 1 });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setStatus(`Imagen seleccionada: ${result.assets[0].uri}. El limpiador puede retirar GPS, fecha y modelo del dispositivo antes de compartir.`);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={[styles.kicker, { color: colors.cyan }]}>LIMPIADOR VISUAL DE PRIVACIDAD</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Quitar metadatos sensibles</Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>Aura elimina etiquetas de GPS, fecha, modelo y otros rastros antes del intercambio de archivos.</Text>

      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}> 
        <Text style={[styles.label, { color: colors.mutedForeground }]}>ESTADO</Text>
        <Text style={[styles.status, { color: colors.primary }]}>{status}</Text>
      </View>

      <TouchableOpacity activeOpacity={0.9} onPress={handlePick} style={[styles.primaryButton, { backgroundColor: colors.primary }]}> 
        <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>SELECCIONAR IMAGEN</Text>
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
  status: { fontSize: 12, fontFamily: 'Inter_600SemiBold', lineHeight: 18 },
  primaryButton: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 2.4 },
});
