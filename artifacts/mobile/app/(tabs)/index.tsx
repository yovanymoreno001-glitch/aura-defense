import React, { useEffect } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSecurity } from '@/contexts/SecurityContext';
import { useColors } from '@/hooks/useColors';
import RadarHUD from '@/components/RadarHUD';
import { router } from 'expo-router';

function StatusIndicator({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  const colors = useColors();
  return (
    <View style={[styles.statCell, { borderColor: `${colors.border}` }]}>
      <View style={[styles.statDot, { backgroundColor: ok ? colors.primary : colors.threat }]} />
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.statVal, { color: ok ? colors.primary : colors.threat }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export default function ShieldScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    firewallEnabled,
    toggleFirewall,
    scanState,
    threatCount,
    criticalCount,
    networkStatus,
    rootDetected,
    startScan,
    purgeAll,
    startP2PConnection,
  } = useSecurity();

  const isScanning = scanState === 'scanning';
  const glowOpacity = useSharedValue(0.3);
  const fwGlow = useSharedValue(0);

  useEffect(() => {
    glowOpacity.value = withRepeat(withTiming(0.8, { duration: 1400 }), -1, true);
  }, []);

  useEffect(() => {
    fwGlow.value = withTiming(firewallEnabled ? 1 : 0, { duration: 400 });
  }, [firewallEnabled]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    shadowOpacity: glowOpacity.value,
  }));

  const fwGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: fwGlow.value * 0.8,
    opacity: 0.5 + fwGlow.value * 0.5,
  }));

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFirewall();
  };

  const handleScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startScan();
  };

  const handlePurge = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    purgeAll();
  };

  const handleNodePress = async (nodeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await startP2PConnection(nodeId);
    router.push('/p2p');
  };

  const overallOk = threatCount === 0 && !rootDetected;
  const statusColor = isScanning ? colors.warning : overallOk ? colors.primary : colors.threat;
  const statusText = isScanning
    ? 'ESCANEANDO...'
    : overallOk
    ? 'SEGURO'
    : `${threatCount} AMENAZA${threatCount !== 1 ? 'S' : ''}`;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.appTitle, { color: colors.cyan }]}>AURA</Text>
          <Text style={[styles.appSubtitle, { color: colors.foreground }]}>DEFENSENSOR</Text>
        </View>
        <Animated.View
          style={[
            styles.statusBadge,
            { borderColor: statusColor, backgroundColor: `${statusColor}18` },
            isScanning && glowStyle,
          ]}
        >
          <Animated.View style={[styles.statusDot, { backgroundColor: statusColor }, isScanning && glowStyle]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.coreCard,
          {
            borderColor: firewallEnabled ? `${colors.primary}80` : `${colors.border}`,
            backgroundColor: `${colors.card}EE`,
            shadowColor: colors.cyan,
          },
          fwGlowStyle,
        ]}
      >
        <View style={styles.coreHeader}>
          <View>
            <Text style={[styles.coreLabel, { color: colors.mutedForeground }]}>P2P NETWORK CORE</Text>
            <Text style={[styles.coreTitle, { color: colors.foreground }]}>NODO DE CONTRAINTELIGENCIA</Text>
          </View>
          <View style={[styles.coreSignal, { backgroundColor: `${colors.primary}16` }]}> 
            <MaterialCommunityIcons name="lan-connect" size={16} color={colors.primary} />
            <Text style={[styles.coreSignalText, { color: colors.primary }]}>LIVE</Text>
          </View>
        </View>

        <View style={styles.radarStage}>
          <Animated.View
            style={[
              styles.radarGlow,
              { shadowColor: statusColor, backgroundColor: `${statusColor}08` },
              glowStyle,
            ]}
          >
            <RadarHUD isScanning={isScanning} threatCount={threatCount} size={220} onNodePress={handleNodePress} />
          </Animated.View>
          <View style={styles.coreInfo}>
            <Text style={[styles.coreInfoText, { color: colors.cyan }]}>TRÁFICO ENRUTADO</Text>
            <Text style={[styles.coreInfoSub, { color: colors.foreground }]}> 
              {firewallEnabled ? 'Canal seguro activo · filtrado local' : 'Esperando enlace de confianza'}
            </Text>
            <Text style={[styles.coreInfoSub, { color: colors.mutedForeground }]}> 
              {networkStatus?.gateway ? `GW ${networkStatus.gateway}` : 'Sin ruta definida'}
            </Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleScan}
          style={[styles.actionButton, { backgroundColor: `${colors.cyan}16`, borderColor: `${colors.cyan}45` }]}
        >
          <MaterialCommunityIcons name="radar" size={18} color={colors.cyan} />
          <Text style={[styles.actionText, { color: colors.cyan }]}>SCAN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePurge}
          style={[styles.actionButton, { backgroundColor: `${colors.threat}16`, borderColor: `${colors.threat}45` }]}
        >
          <MaterialCommunityIcons name="delete-sweep" size={18} color={colors.threat} />
          <Text style={[styles.actionText, { color: colors.threat }]}>PURGE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleToggle}
          style={[styles.actionButton, { backgroundColor: firewallEnabled ? `${colors.primary}16` : `${colors.border}80`, borderColor: firewallEnabled ? `${colors.primary}45` : `${colors.border}` }]}
        >
          <MaterialCommunityIcons name={firewallEnabled ? 'shield-check' : 'shield-off'} size={18} color={firewallEnabled ? colors.primary : colors.mutedForeground} />
          <Text style={[styles.actionText, { color: firewallEnabled ? colors.primary : colors.mutedForeground }]}>LATCH</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statGrid}>
        <StatusIndicator label="RED" value={networkStatus ? 'SEGURA' : 'SIN ESCANEO'} ok={!!networkStatus && !networkStatus.mitm} />
        <StatusIndicator label="ROOT" value={rootDetected ? 'COMPROMETIDO' : 'LIMPIO'} ok={!rootDetected} />
        <StatusIndicator label="AMENAZAS" value={scanState === 'idle' ? '—' : `${threatCount} ACTIVAS`} ok={threatCount === 0} />
        <StatusIndicator label="CRÍTICO" value={scanState === 'idle' ? '—' : `${criticalCount} HALLADAS`} ok={criticalCount === 0} />
      </View>

      <View style={[styles.sentinelCard, { borderColor: `${colors.border}`, backgroundColor: `${colors.card}DD` }]}> 
        <View style={styles.sentinelHeader}>
          <MaterialCommunityIcons name="chip" size={18} color={colors.cyan} />
          <Text style={[styles.sentinelTitle, { color: colors.foreground }]}>HARDWARE SENTINEL</Text>
        </View>
        <View style={styles.sentinelGrid}>
          <TouchableOpacity onPress={() => router.push('/voice')} style={styles.sentinelCell}>
            <Text style={[styles.sentinelLabel, { color: colors.mutedForeground }]}>VOZ</Text>
            <Text style={[styles.sentinelValue, { color: colors.primary }]}>NUCLEO NATURAL</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/privacy')} style={styles.sentinelCell}>
            <Text style={[styles.sentinelLabel, { color: colors.mutedForeground }]}>PRIVACY</Text>
            <Text style={[styles.sentinelValue, { color: colors.cyan }]}>EXIF CLEAN</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/ghosts')} style={styles.sentinelCell}>
            <Text style={[styles.sentinelLabel, { color: colors.mutedForeground }]}>PURGA</Text>
            <Text style={[styles.sentinelValue, { color: colors.warning }]}>GHOST APPS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 18, gap: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 6,
    lineHeight: 30,
  },
  appSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 6,
    opacity: 0.7,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 7,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
  },
  coreCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 4,
  },
  coreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coreLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 2.5,
  },
  coreTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
    marginTop: 3,
  },
  coreSignal: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  coreSignalText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.4,
  },
  radarStage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radarGlow: {
    borderRadius: 200,
    padding: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 26,
  },
  coreInfo: {
    flex: 1,
    gap: 4,
  },
  coreInfoText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
  },
  coreInfoSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.8,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCell: {
    flex: 1,
    minWidth: '44%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 4,
    alignItems: 'flex-start',
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 2,
  },
  statVal: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  sentinelCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  sentinelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sentinelTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.6,
  },
  sentinelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sentinelCell: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  sentinelLabel: {
    fontSize: 9,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.6,
  },
  sentinelValue: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    marginTop: 2,
  },
});
