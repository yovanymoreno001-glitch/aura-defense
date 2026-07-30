import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low';
export type LogLevel = 'OK' | 'THREAT' | 'WARN' | 'AUDIT' | 'INFO' | 'SYS';
export type ScanState = 'idle' | 'scanning' | 'complete';

export interface ThreatItem {
  id: string;
  name: string;
  packageName: string;
  severity: ThreatSeverity;
  threatType: string;
  description: string;
  permissions: string[];
  riskScore: number;
  purged: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
}

export interface NetworkStatus {
  ssid: string;
  gateway: string;
  dns: string;
  mitm: boolean;
  encrypted: boolean;
}

interface SecurityContextValue {
  firewallEnabled: boolean;
  scanState: ScanState;
  threats: ThreatItem[];
  logs: LogEntry[];
  networkStatus: NetworkStatus | null;
  rootDetected: boolean;
  debugDetected: boolean;
  toggleFirewall: () => void;
  startScan: () => void;
  purgeThreat: (id: string) => void;
  purgeAll: () => void;
  clearLogs: () => void;
  threatCount: number;
  criticalCount: number;
}

interface NativeSecuritySnapshot {
  deviceName: string;
  osVersion: string;
  debugEnabled: boolean;
  rootDetected: boolean;
  permissions: {
    fineLocation: boolean;
    notifications: boolean;
    microphone: boolean;
  };
  networkStatus: {
    ssid: string;
    gateway: string;
    dns: string;
    mitm: boolean;
    encrypted: boolean;
    vpnActive: boolean;
  };
  telemetry: {
    storageAvailable: string;
    storageTotal: string;
    ramAvailableMb: number;
    ramTotalMb: number;
    lowMemory: boolean;
    batteryLevel: number;
  };
  threats: Array<{
    id: string;
    name: string;
    packageName: string;
    severity: ThreatSeverity;
    threatType: string;
    description: string;
    permissions: string[];
    riskScore: number;
    purged: boolean;
  }>;
  accessibilityServices: Array<{ packageName: string; serviceName: string }>;
}

interface NativeSecurityModule {
  requestRuntimePermissions: (callback?: (success: boolean) => void) => Promise<boolean> | boolean;
  collectSecuritySnapshot: () => Promise<NativeSecuritySnapshot>;
  startRealtimeMonitoring: () => void;
  stopRealtimeMonitoring: () => void;
}

const SecurityContext = createContext<SecurityContextValue | null>(null);

const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

const makeId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 6);

const makeTs = () => {
  const n = new Date();
  const h = n.getHours().toString().padStart(2, '0');
  const m = n.getMinutes().toString().padStart(2, '0');
  const s = n.getSeconds().toString().padStart(2, '0');
  const ms = n.getMilliseconds().toString().padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
};

const nativeModule = Platform.OS === 'android'
  ? (NativeModules.AuraSecurityModule as NativeSecurityModule | undefined)
  : undefined;

const nativeEmitter = Platform.OS === 'android' && nativeModule
  ? new NativeEventEmitter(NativeModules.AuraSecurityModule as never)
  : null;

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [firewallEnabled, setFirewallEnabled] = useState(false);
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [threats, setThreats] = useState<ThreatItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [rootDetected, setRootDetected] = useState(false);
  const [debugDetected, setDebugDetected] = useState(false);
  const scanning = useRef(false);

  const log = useCallback((level: LogLevel, message: string) => {
    setLogs((prev) => [
      ...prev,
      { id: makeId(), timestamp: makeTs(), level, message },
    ]);
  }, []);

  useEffect(() => {
    if (!nativeModule) return;

    const sub = nativeEmitter?.addListener('onSnapshot', (payload: NativeSecuritySnapshot) => {
      setNetworkStatus({
        ssid: payload.networkStatus.ssid,
        gateway: payload.networkStatus.gateway,
        dns: payload.networkStatus.dns,
        mitm: payload.networkStatus.mitm,
        encrypted: payload.networkStatus.encrypted,
      });
      setRootDetected(payload.rootDetected);
      setDebugDetected(payload.debugEnabled);
      setThreats((prev) => prev.length > 0 ? prev : (payload.threats ?? []).map((item, index) => ({
        id: `${item.packageName}-${index}`,
        name: item.name,
        packageName: item.packageName,
        severity: item.severity,
        threatType: item.threatType,
        description: item.description,
        permissions: item.permissions,
        riskScore: item.riskScore,
        purged: false,
      })));
    });

    const clipboardSub = nativeEmitter?.addListener('onClipboardChange', (payload: { message: string }) => {
      log('WARN', payload.message);
    });

    return () => {
      sub?.remove();
      clipboardSub?.remove();
      nativeModule.stopRealtimeMonitoring();
    };
  }, [log]);

  const toggleFirewall = useCallback(() => {
    setFirewallEnabled((prev) => {
      const next = !prev;
      if (nativeModule) {
        if (next) {
          nativeModule.startRealtimeMonitoring();
          log('OK', 'Real-time native monitoring enabled.');
        } else {
          nativeModule.stopRealtimeMonitoring();
          log('OK', 'Real-time native monitoring paused.');
        }
      }
      return next;
    });
  }, [log]);

  const startScan = useCallback(async () => {
    if (scanning.current) return;
    scanning.current = true;
    setScanState('scanning');
    setThreats([]);
    setLogs([]);

    await wait(80);
    log('SYS', 'AuraDefensa Engine v2.2.0 — Initializing native Android security stack');
    await wait(180);
    log('AUDIT', 'Modules loaded: PERMISSIONS · NETWORK · PACKAGES · PRIVACY');
    await wait(200);
    log('AUDIT', `Platform: ${Platform.OS.toUpperCase()} ${Platform.Version}`);

    if (nativeModule) {
      try {
        await wait(220);
        log('AUDIT', 'Requesting runtime permissions from the Android runtime');
        await nativeModule.requestRuntimePermissions();
        await wait(250);
        const snapshot = await nativeModule.collectSecuritySnapshot();
        setNetworkStatus({
          ssid: snapshot.networkStatus.ssid,
          gateway: snapshot.networkStatus.gateway,
          dns: snapshot.networkStatus.dns,
          mitm: snapshot.networkStatus.mitm,
          encrypted: snapshot.networkStatus.encrypted,
        });
        setRootDetected(snapshot.rootDetected);
        setDebugDetected(snapshot.debugEnabled);

        const found = (snapshot.threats ?? []).map((item, index) => ({
          id: `${item.packageName}-${index}`,
          name: item.name || item.packageName,
          packageName: item.packageName,
          severity: item.severity,
          threatType: item.threatType,
          description: item.description,
          permissions: item.permissions,
          riskScore: item.riskScore,
          purged: false,
        }));

        log('OK', `Native snapshot collected for ${snapshot.deviceName} (${snapshot.osVersion})`);
        log('OK', `Runtime permissions: location=${snapshot.permissions.fineLocation ? 'granted' : 'denied'}, notification=${snapshot.permissions.notifications ? 'granted' : 'denied'}, microphone=${snapshot.permissions.microphone ? 'granted' : 'denied'}`);
        log('OK', `Telemetry: ${snapshot.telemetry.storageAvailable} free / ${snapshot.telemetry.ramAvailableMb.toFixed(1)} MB RAM available`);
        if (snapshot.rootDetected) {
          log('THREAT', 'Root access detected in the device runtime.');
        }
        if (snapshot.debugEnabled) {
          log('WARN', 'Debugging state is enabled.');
        }
        if (snapshot.networkStatus.mitm || snapshot.networkStatus.vpnActive) {
          log('THREAT', 'Network interception path detected by the native monitor.');
        }
        if (found.length > 0) {
          found.forEach((threat) => {
            log('THREAT', `${threat.name} — ${threat.threatType} (${threat.riskScore}/100)`);
          });
        } else {
          log('OK', 'No suspicious package patterns were reported by the runtime scanner.');
        }

        setThreats(found);
      } catch (error) {
        log('WARN', `Native scan failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      log('WARN', 'Native Android module unavailable on this platform.');
    }

    await wait(220);
    log('SYS', '════════ SCAN COMPLETE ════════');
    setScanState('complete');
    scanning.current = false;
  }, [log]);

  const purgeThreat = useCallback((id: string) => {
    setThreats((prev) => prev.map((t) => (t.id === id ? { ...t, purged: true } : t)));
  }, []);

  const purgeAll = useCallback(() => {
    setThreats((prev) => prev.map((t) => ({ ...t, purged: true })));
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  const active = threats.filter((t) => !t.purged);

  return (
    <SecurityContext.Provider
      value={{
        firewallEnabled,
        scanState,
        threats,
        logs,
        networkStatus,
        rootDetected,
        debugDetected,
        toggleFirewall,
        startScan,
        purgeThreat,
        purgeAll,
        clearLogs,
        threatCount: active.length,
        criticalCount: active.filter((t) => t.severity === 'critical').length,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const ctx = useContext(SecurityContext);
  if (!ctx) throw new Error('useSecurity must be inside SecurityProvider');
  return ctx;
}
