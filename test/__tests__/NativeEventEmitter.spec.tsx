import { test, expect, describe, vi, beforeEach } from 'vitest';
import { NativeEventEmitter, NativeModules } from 'react-native';

describe('NativeEventEmitter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('can be instantiated', () => {
    const emitter = new NativeEventEmitter();
    expect(emitter).toBeDefined();
  });

  test('can be instantiated with native module', () => {
    const emitter = new NativeEventEmitter(NativeModules.KeyboardObserver);
    expect(emitter).toBeDefined();
  });

  test('addListener is callable', () => {
    const emitter = new NativeEventEmitter();
    const callback = vi.fn();
    const subscription = emitter.addListener('testEvent', callback);
    expect(subscription).toBeDefined();
  });

  test('addListener returns subscription with remove', () => {
    const emitter = new NativeEventEmitter();
    const callback = vi.fn();
    const subscription = emitter.addListener('testEvent', callback);
    expect(subscription.remove).toBeDefined();
    expect(typeof subscription.remove).toBe('function');
  });

  test('subscription remove is callable', () => {
    const emitter = new NativeEventEmitter();
    const callback = vi.fn();
    const subscription = emitter.addListener('testEvent', callback);
    expect(() => subscription.remove()).not.toThrow();
  });

  test('removeListener is callable', () => {
    const emitter = new NativeEventEmitter();
    const callback = vi.fn();
    expect(() => emitter.removeListener('testEvent', callback)).not.toThrow();
  });

  test('removeAllListeners is callable', () => {
    const emitter = new NativeEventEmitter();
    expect(() => emitter.removeAllListeners('testEvent')).not.toThrow();
  });

  test('removeSubscription is callable', () => {
    const emitter = new NativeEventEmitter();
    const callback = vi.fn();
    const subscription = emitter.addListener('testEvent', callback);
    expect(() => emitter.removeSubscription(subscription)).not.toThrow();
  });

  test('emit is callable', () => {
    const emitter = new NativeEventEmitter();
    expect(() => emitter.emit('testEvent', { data: 'test' })).not.toThrow();
  });

  test('multiple listeners can be added', () => {
    const emitter = new NativeEventEmitter();
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const sub1 = emitter.addListener('testEvent', callback1);
    const sub2 = emitter.addListener('testEvent', callback2);

    expect(sub1).toBeDefined();
    expect(sub2).toBeDefined();
  });

  test('addListener with context', () => {
    const emitter = new NativeEventEmitter();
    const callback = vi.fn();
    const context = { name: 'test' };
    const subscription = emitter.addListener('testEvent', callback, context);
    expect(subscription).toBeDefined();
  });

  test('all methods are defined', () => {
    const emitter = new NativeEventEmitter();
    expect(emitter.addListener).toBeDefined();
    expect(emitter.removeListener).toBeDefined();
    expect(emitter.removeAllListeners).toBeDefined();
    expect(emitter.removeSubscription).toBeDefined();
    expect(emitter.emit).toBeDefined();
  });
});
