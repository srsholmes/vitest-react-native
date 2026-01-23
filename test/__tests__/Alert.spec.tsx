import { test, expect, describe, vi, beforeEach } from 'vitest';
import { Alert } from 'react-native';

describe('Alert', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('alert is callable', () => {
    Alert.alert('Title');
    expect(Alert.alert).toHaveBeenCalledWith('Title');
  });

  test('alert with title and message', () => {
    Alert.alert('Title', 'Message');
    expect(Alert.alert).toHaveBeenCalledWith('Title', 'Message');
  });

  test('alert with title, message and buttons', () => {
    const buttons = [
      { text: 'Cancel', style: 'cancel' as const },
      { text: 'OK', onPress: vi.fn() },
    ];
    Alert.alert('Title', 'Message', buttons);
    expect(Alert.alert).toHaveBeenCalledWith('Title', 'Message', buttons);
  });

  test('alert with title, message, buttons and options', () => {
    const buttons = [{ text: 'OK', onPress: vi.fn() }];
    const options = { cancelable: true };
    Alert.alert('Title', 'Message', buttons, options);
    expect(Alert.alert).toHaveBeenCalledWith('Title', 'Message', buttons, options);
  });

  test('alert with single button', () => {
    const onPress = vi.fn();
    Alert.alert('Title', 'Message', [{ text: 'OK', onPress }]);
    expect(Alert.alert).toHaveBeenCalled();
  });

  test('alert with destructive button', () => {
    const buttons = [
      { text: 'Cancel', style: 'cancel' as const },
      { text: 'Delete', style: 'destructive' as const, onPress: vi.fn() },
    ];
    Alert.alert('Delete Item', 'Are you sure?', buttons);
    expect(Alert.alert).toHaveBeenCalled();
  });

  test('prompt is callable', () => {
    Alert.prompt('Title');
    expect(Alert.prompt).toHaveBeenCalledWith('Title');
  });

  test('prompt with title and message', () => {
    Alert.prompt('Title', 'Enter your name');
    expect(Alert.prompt).toHaveBeenCalledWith('Title', 'Enter your name');
  });

  test('prompt with callback', () => {
    const callback = vi.fn();
    Alert.prompt('Title', 'Message', callback);
    expect(Alert.prompt).toHaveBeenCalledWith('Title', 'Message', callback);
  });

  test('prompt with buttons', () => {
    const buttons = [
      { text: 'Cancel', style: 'cancel' as const },
      { text: 'Submit', onPress: vi.fn() },
    ];
    Alert.prompt('Title', 'Message', buttons);
    expect(Alert.prompt).toHaveBeenCalled();
  });

  test('prompt with type and default value', () => {
    const callback = vi.fn();
    Alert.prompt('Title', 'Message', callback, 'plain-text', 'default value');
    expect(Alert.prompt).toHaveBeenCalled();
  });

  test('all methods are defined', () => {
    expect(Alert.alert).toBeDefined();
    expect(Alert.prompt).toBeDefined();
  });
});
