import { test, expect, describe, vi, beforeEach } from 'vitest';
import { Clipboard } from 'react-native';

describe('Clipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('getString is callable', async () => {
    await Clipboard.getString();
    expect(Clipboard.getString).toHaveBeenCalled();
  });

  test('getString returns a promise', () => {
    const result = Clipboard.getString();
    expect(result).toBeInstanceOf(Promise);
  });

  test('getString resolves to empty string', async () => {
    const content = await Clipboard.getString();
    expect(content).toBe('');
  });

  test('setString is callable', () => {
    Clipboard.setString('test content');
    expect(Clipboard.setString).toHaveBeenCalledWith('test content');
  });

  test('setString with different values', () => {
    Clipboard.setString('Hello World');
    expect(Clipboard.setString).toHaveBeenCalledWith('Hello World');

    Clipboard.setString('');
    expect(Clipboard.setString).toHaveBeenCalledWith('');

    Clipboard.setString('123456');
    expect(Clipboard.setString).toHaveBeenCalledWith('123456');
  });

  test('hasString is callable', async () => {
    await Clipboard.hasString();
    expect(Clipboard.hasString).toHaveBeenCalled();
  });

  test('hasString returns a promise', () => {
    const result = Clipboard.hasString();
    expect(result).toBeInstanceOf(Promise);
  });

  test('hasString resolves to false', async () => {
    const hasContent = await Clipboard.hasString();
    expect(hasContent).toBe(false);
  });

  test('all methods are defined', () => {
    expect(Clipboard.getString).toBeDefined();
    expect(Clipboard.setString).toBeDefined();
    expect(Clipboard.hasString).toBeDefined();
  });
});
