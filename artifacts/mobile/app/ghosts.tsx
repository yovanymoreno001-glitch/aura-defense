import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSecurity } from '@/contexts/SecurityContext';
import { useColors } from '@/hooks/useColors';

export default function GhostsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { ghostApps, collectGhostApps, purgeGhostAppCache } = useSecurity();

  useEffect(() => {
    void collectGhostApps();
  }, [collectGhostApps]);

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={[styles.kicker, { color: colors.cyan }]}>DETECTOR DE APPS FANTASMAS</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Purgar fondo y caché</Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>Aura revisa paquetes inactivos por más de 30 días y permite limpiar archivos temporales y basura de fondo.</Text>

      {ghostApps.length === 0 ? (
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}> 
          <Text style={[styles.status, { color: colors.primary }]}>No se reportaron apps fantasmas en este perfil.</Text>
        </View>
      ) : (
        <View style={styles.list}> 
          {ghostApps.map((item) => (
            <View key={item.packageName} style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}> 
              <Text style={[styles.name, { color: colors.foreground }]}>{item.appName}</Text>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>Inactivo {item.daysInactive} días · fondo {item.background ? 'activo' : 'inactivo'}</Text>
              <TouchableOpacity activeOpacity={0.85} onPress={() => void purgeGhostAppCache(item.packageName)} style={[styles.primaryButton, { backgroundColor: colors.threat }]}> 
                <Text style={[styles.primaryButtonText, { color: '#fff' }]}>LIMPIAR CACHÉ</Text>
              </TouchableOpacity>
            </View>
          ))}
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
  status: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  list: { gap: 10 },
  name: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  meta: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  primaryButton: { borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  primaryButtonText: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1.6 },
});
