// Compatibility exports; the old parent-window session injection is disabled.
import type { Metrics } from 'react-native-safe-area-context';
export function initManusRuntime() {}
export function subscribeSafeAreaInsets(_callback: (metrics: Metrics)=>void) { return ()=>{}; }
