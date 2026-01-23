import { test, expect, describe, vi, beforeEach } from 'vitest';
import { Linking } from 'react-native';

describe('Linking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('openURL is callable', async () => {
    await Linking.openURL('https://example.com');
    expect(Linking.openURL).toHaveBeenCalledWith('https://example.com');
  });

  test('openURL returns a promise', () => {
    const result = Linking.openURL('https://example.com');
    expect(result).toBeInstanceOf(Promise);
  });

  test('openURL resolves successfully', async () => {
    await expect(Linking.openURL('https://example.com')).resolves.toBeUndefined();
  });

  test('canOpenURL is callable', async () => {
    await Linking.canOpenURL('https://example.com');
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://example.com');
  });

  test('canOpenURL returns true', async () => {
    const canOpen = await Linking.canOpenURL('https://example.com');
    expect(canOpen).toBe(true);
  });

  test('openSettings is callable', async () => {
    await Linking.openSettings();
    expect(Linking.openSettings).toHaveBeenCalled();
  });

  test('openSettings returns a promise', () => {
    const result = Linking.openSettings();
    expect(result).toBeInstanceOf(Promise);
  });

  test('addEventListener is callable', () => {
    const callback = vi.fn();
    const subscription = Linking.addEventListener('url', callback);
    expect(subscription).toBeDefined();
    expect(subscription.remove).toBeDefined();
  });

  test('addEventListener returns subscription with remove', () => {
    const callback = vi.fn();
    const subscription = Linking.addEventListener('url', callback);
    expect(typeof subscription.remove).toBe('function');
  });

  test('getInitialURL is callable', async () => {
    await Linking.getInitialURL();
    expect(Linking.getInitialURL).toHaveBeenCalled();
  });

  test('getInitialURL returns null', async () => {
    const url = await Linking.getInitialURL();
    expect(url).toBeNull();
  });

  test('sendIntent is callable', async () => {
    await Linking.sendIntent('android.intent.action.VIEW');
    expect(Linking.sendIntent).toHaveBeenCalled();
  });

  test('sendIntent returns a promise', () => {
    const result = Linking.sendIntent('android.intent.action.VIEW');
    expect(result).toBeInstanceOf(Promise);
  });

  test('all methods are defined', () => {
    expect(Linking.openURL).toBeDefined();
    expect(Linking.canOpenURL).toBeDefined();
    expect(Linking.openSettings).toBeDefined();
    expect(Linking.addEventListener).toBeDefined();
    expect(Linking.getInitialURL).toBeDefined();
    expect(Linking.sendIntent).toBeDefined();
  });
});
