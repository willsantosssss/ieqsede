import * as Api from '@/lib/_core/api';
import * as Auth from '@/lib/_core/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAuth(options?: { autoFetch?: boolean }) {
  const [user, setUser] = useState<Auth.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const generation = useRef(0);
  const queryClient = useQueryClient();
  const fetchUser = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true);
    setError(null);
    try {
      // Cached profiles never establish an authenticated session.
      const result = await Api.getMe();
      if (current !== generation.current) return;
      setUser(result ? { ...result, lastSignedIn: new Date(result.lastSignedIn) } : null);
    } catch (err) {
      if (current !== generation.current) return;
      setUser(null);
      setError(err instanceof Error ? err : new Error('Falha ao validar sessão.'));
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, []);
  const logout = useCallback(async () => {
    ++generation.current;
    setUser(null);
    setLoading(false);
    setError(null);
    await queryClient.cancelQueries();
    queryClient.clear();
    try { await Api.logout(); }
    finally {
      await Auth.removeSessionToken();
      await Auth.clearUserInfo();
      await AsyncStorage.multiRemove(['@is_logged_in', '@cadastro_completo', '@user_email', '@lider_logado']);
      queryClient.clear();
    }
  }, [queryClient]);
  useEffect(() => {
    if (options?.autoFetch !== false) void fetchUser();
    else setLoading(false);
    return () => { ++generation.current; };
  }, [options?.autoFetch, fetchUser]);
  return { user, loading, error, isAuthenticated: !!user, refresh: fetchUser, logout };
}
