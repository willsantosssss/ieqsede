import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ platform: { OS: 'web' }, get: vi.fn(), set: vi.fn(), remove: vi.fn() }));
vi.mock('react-native', () => ({ Platform: mocks.platform }));
vi.mock('expo-secure-store', () => ({ getItemAsync: mocks.get, setItemAsync: mocks.set, deleteItemAsync: mocks.remove }));
vi.mock('@/constants/oauth', () => ({ SESSION_TOKEN_KEY: 'ieqsede-session', USER_INFO_KEY: 'ieqsede-user-info' }));
import * as auth from '../lib/_core/auth';
beforeEach(() => { vi.clearAllMocks(); mocks.platform.OS = 'web'; });
it('web removes legacy tokens and profiles and never persists new credentials', async () => {
  const values = new Map([['ieqsede-session','old-token'],['ieqsede-user-info','old-profile']]);
  const setItem = vi.fn();
  vi.stubGlobal('window', { localStorage: { getItem: (key:string) => values.get(key), setItem, removeItem: (key:string) => values.delete(key) } });
  expect(await auth.getSessionToken()).toBeNull();
  await auth.setSessionToken('secret');
  await auth.setUserInfo({id:1} as any);
  expect(await auth.getUserInfo()).toBeNull();
  expect(values.size).toBe(0);
  expect(setItem).not.toHaveBeenCalled();
  expect(mocks.set).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});
it('native uses secure storage and deletes its session on logout', async () => {
  mocks.platform.OS = 'ios'; mocks.get.mockResolvedValue('native-token');
  await auth.setSessionToken('native-token');
  expect(await auth.getSessionToken()).toBe('native-token');
  await auth.removeSessionToken();
  expect(mocks.set).toHaveBeenCalledWith('ieqsede-session','native-token');
  expect(mocks.remove).toHaveBeenCalledWith('ieqsede-session');
});
